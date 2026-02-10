import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
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
          // AI를 사용하여 이미지 분석 (Base64로 직접 전송)
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `당신은 학생의 공부를 돕는 AI 튜터입니다. 학생의 시험 문제 이미지를 분석하고, 다음 내용을 제공해야 합니다:
1. 문제 유형 (예: 수학-기하부분, 영어-문법, 과학-물리 등)
2. 과목 (예: 수학, 영어, 과학, 사회 등)
3. 풀이 과정 (마크다운 형식으로 작성)
4. 최종 답변 명시

응답은 학생의 이해를 위해 친절하고 상세하게 설명해주세요.`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "이 문제를 분석하고 풀이 과정을 보여주세요.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/jpeg;base64,${input.imageBase64}`,
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
                      description: "문제 유형 (예: 수학-기하부분, 영어-문법)",
                    },
                    subject: {
                      type: "string",
                      description: "과목 (예: 수학, 영어, 과학)",
                    },
                    solution: {
                      type: "string",
                      description: "풀이 과정 (마크다운 형식)",
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
