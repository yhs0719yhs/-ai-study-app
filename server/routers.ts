import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI 문제 분서 라우터
  problem: router({
    analyze: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          imageName: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // 1. 이미지를 S3에 업로드
          const imageBuffer = Buffer.from(input.imageBase64, "base64");
          const fileName = input.imageName || `problem_${Date.now()}.jpg`;
          const uploadResult = await storagePut(
            `problems/${fileName}`,
            imageBuffer,
            "image/jpeg"
          );

          // 2. AI를 사용하여 이미지 분석
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `당신은 학생들의 공부를 돕는 AI 튜터입니다. 학생이 촬영한 시험 문제 이미지를 분석하고, 다음 정보를 제공해야 합니다:
1. 문제 유형 (예: 수학-미적분, 영어-독해, 과학-화학 등)
2. 과목 (예: 수학, 영어, 과학, 사회 등)
3. 단계별 풀이 과정 (마크다운 형식으로 작성)
4. 핵심 개념 설명

풀이는 학생이 이해하기 쉬도록 친절하고 자세하게 설명해주세요.`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "이 문제를 분석하고 풀이 과정을 알려주세요.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: uploadResult.url,
                      detail: "high",
                    },
                  },
                ],
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "problem_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    problemType: {
                      type: "string",
                      description: "문제 유형 (예: 수학-미적분, 영어-독해)",
                    },
                    subject: {
                      type: "string",
                      description: "과목 (예: 수학, 영어, 과학)",
                    },
                    solution: {
                      type: "string",
                      description: "단계별 풀이 과정 (마크다운 형식)",
                    },
                  },
                  required: ["problemType", "subject", "solution"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0].message.content;
          if (typeof content !== "string") {
            throw new Error("예상치 못한 응답 형식입니다.");
          }
          const analysis = JSON.parse(content);

          return {
            imageUrl: uploadResult.url,
            problemType: analysis.problemType,
            subject: analysis.subject,
            solution: analysis.solution,
          };
        } catch (error) {
          console.error("AI 분석 오류:", error);
          throw new Error("문제 분석 중 오류가 발생했습니다.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
