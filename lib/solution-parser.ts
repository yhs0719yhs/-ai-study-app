import { SolutionStep, ParsedSolution } from "@/shared/types";
import { formatSolution } from "./math-formatter";

/**
 * AI 풀이를 단계별로 파싱
 * 지원하는 형식:
 * - "1단계: ..." / "2단계: ..."
 * - "**1단계:**" / "**2단계:**"
 * - "Step 1:" / "Step 2:"
 */
export function parseSolution(solution: string): ParsedSolution {
  const steps: SolutionStep[] = [];

  // 다양한 단계 표시 패턴 정의
  const stepPatterns = [
    /(\d+)\s*단계\s*[:：]\s*(.+?)(?=\d+\s*단계|$)/gs, // "1단계: ..."
    /\*\*(\d+)\s*단계\s*[:：]\*\*\s*(.+?)(?=\*\*\d+\s*단계|$)/gs, // "**1단계:** ..."
    /Step\s+(\d+)\s*[:：]\s*(.+?)(?=Step\s+\d+|$)/gis, // "Step 1: ..."
  ];

  let matched = false;
  let content = solution;

  for (const pattern of stepPatterns) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      matches.forEach((match) => {
        const stepNumber = parseInt(match[1]);
        const stepContent = match[2].trim();

        // 제목과 내용 분리
        const lines = stepContent.split("\n");
        const title = lines[0].replace(/^[\*\-\•]\s*/, "").trim();
        const contentLines = lines.slice(1).join("\n").trim();

        steps.push({
          stepNumber,
          title: formatSolution(title) || `단계 ${stepNumber}`,
          content: formatSolution(contentLines || stepContent),
        });
      });
      matched = true;
      break;
    }
  }

  // 단계를 찾지 못한 경우, 전체를 하나의 단계로 처리
  if (!matched || steps.length === 0) {
    steps.push({
      stepNumber: 1,
      title: "풀이",
      content: formatSolution(solution),
    });
  }

  // 단계 번호 정렬
  steps.sort((a, b) => a.stepNumber - b.stepNumber);

  return {
    steps,
    rawSolution: solution,
  };
}

/**
 * 단계별 풀이를 HTML 형식으로 렌더링
 */
export function renderSolutionSteps(steps: SolutionStep[]): string {
  return steps
    .map(
      (step) => `
<div class="solution-step">
  <h3 class="step-title">${step.stepNumber}단계: ${step.title}</h3>
  <p class="step-content">${step.content}</p>
</div>
`
    )
    .join("");
}

/**
 * 풀이 텍스트에서 마크다운 포맷팅 제거
 */
export function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // 굵은 텍스트
    .replace(/\*(.*?)\*/g, "$1") // 이탤릭
    .replace(/__(.*?)__/g, "$1") // 굵은 텍스트 (언더스코어)
    .replace(/_(.*?)_/g, "$1") // 이탤릭 (언더스코어)
    .replace(/`(.*?)`/g, "$1") // 코드
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // 링크
    .trim();
}

/**
 * 풀이 텍스트에서 불릿 포인트 정리
 */
export function cleanBulletPoints(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      return line.replace(/^[\s\*\-\•]+/, "").trim();
    })
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * 풀이 텍스트에서 최종 답 추출
 */
export function extractFinalAnswer(solution: string): string | null {
  const answerPatterns = [
    /(?:최종\s*)?답\s*[:：]\s*(.+?)(?=\n|$)/i,
    /\*\*(?:최종\s*)?답\*\*\s*[:：]\s*(.+?)(?=\n|$)/i,
    /Answer\s*[:：]\s*(.+?)(?=\n|$)/i,
    /따라서\s*(?:최종\s*)?답은\s*(.+?)(?=\n|$)/i,
  ];

  for (const pattern of answerPatterns) {
    const match = solution.match(pattern);
    if (match && match[1]) {
      let answer = match[1].trim();
      answer = answer.replace(/\*\*(.*?)\*\*/g, "$1");
      answer = answer.replace(/\*(.*?)\*/g, "$1");
      return answer.trim();
    }
  }

  return null;
}
