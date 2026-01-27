import { ENV } from "./env";

/**
 * OpenAI API를 사용한 문제 분석 및 풀이
 */

export interface SolutionStep {
  stepNumber: number;
  title: string;
  content: string;
}

export interface ProblemAnalysisResult {
  problemType: string;
  subject: string;
  solution: string;
  problemNumber?: string;
  steps: SolutionStep[];
  finalAnswer: string;
}

/**
 * OpenAI API를 사용하여 이미지 기반 문제를 분석합니다
 */
export async function analyzeProblemWithOpenAI(
  imageUrl: string
): Promise<ProblemAnalysisResult> {
  if (!ENV.openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision",
        messages: [
          {
            role: "system",
            content: `당신은 학생들의 공부를 돕는 AI 튜터입니다. 학생이 촬영한 시험 문제 이미지를 분석하고, 다음 정보를 JSON 형식으로 제공해야 합니다:
{
  "problemNumber": "문제 번호 (예: '1번', '2번', '(1)', '(2)' 등. 없으면 null)",
  "problemType": "문제 유형 (예: 일차함수, 영어-독해, 화학-산화환원 등)",
  "subject": "과목 (예: 수학, 영어, 과학, 사회 등)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "첫 번째 단계 제목",
      "content": "첫 번째 단계 설명"
    },
    {
      "stepNumber": 2,
      "title": "두 번째 단계 제목",
      "content": "두 번째 단계 설명"
    }
  ],
  "finalAnswer": "최종 답 (예: x = 5, y = 3, 답: ③ 등)"
}

중요한 지침:
1. 문제를 푸는 데 필요한 최소 단계만 포함하세요 (2-3단계가 적당)
2. 각 단계는 명확한 제목과 설명을 포함하세요
3. 최종 답은 반드시 따로 명시하세요
4. 반드시 유효한 JSON 형식으로만 응답하세요.`,
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
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    const result = JSON.parse(content);

    if (!result.problemType || !result.subject || !result.steps || !result.finalAnswer) {
      throw new Error("Invalid response format from OpenAI");
    }

    const solutionMarkdown = result.steps
      .map((step: SolutionStep) => `**${step.stepNumber}단계: ${step.title}**\n${step.content}`)
      .join("\n\n") + `\n\n**답:** ${result.finalAnswer}`;

    return {
      problemType: result.problemType,
      subject: result.subject,
      solution: solutionMarkdown,
      problemNumber: result.problemNumber || undefined,
      steps: result.steps,
      finalAnswer: result.finalAnswer,
    };
  } catch (error) {
    console.error("Error analyzing problem with OpenAI:", error);
    throw error;
  }
}

/**
 * OpenAI API를 사용하여 텍스트 기반 질문에 답변합니다
 */
export async function askOpenAI(question: string): Promise<string> {
  if (!ENV.openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "당신은 학생들의 공부를 돕는 친절한 AI 튜터입니다. 학생의 질문에 명확하고 이해하기 쉽게 답변해주세요.",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    return content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
