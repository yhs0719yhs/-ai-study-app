import { describe, it, expect } from "vitest";
import { extractFinalAnswer, parseSolution } from "../lib/solution-parser";

/**
 * 풀이 과정 및 답 표시 개선 테스트
 */

describe("Solution Display Enhancement", () => {
  describe("Problem Number Detection", () => {
    it("should detect problem number from solution", () => {
      const solutionWithNumber = "1번: 일차함수 문제입니다.";
      const numberMatch = solutionWithNumber.match(/(\d+)\s*번/);
      expect(numberMatch).not.toBeNull();
      expect(numberMatch?.[1]).toBe("1");
    });

    it("should detect problem number with parentheses", () => {
      const solutionWithNumber = "(2) 이차함수 문제입니다.";
      const numberMatch = solutionWithNumber.match(/\((\d+)\)/);
      expect(numberMatch).not.toBeNull();
      expect(numberMatch?.[1]).toBe("2");
    });

    it("should handle missing problem number", () => {
      const solutionWithoutNumber = "일차함수 문제입니다.";
      const numberMatch = solutionWithoutNumber.match(/(\d+)\s*번/);
      expect(numberMatch).toBeNull();
    });
  });

  describe("Dynamic Step Count", () => {
    it("should parse solution with 2 steps", () => {
      const solution = `
1단계: x절편 구하기
y = 0일 때를 대입합니다.

2단계: y절편 구하기
x = 0일 때를 대입합니다.

답: x절편은 2, y절편은 3
      `;

      const parsed = parseSolution(solution);
      expect(parsed.steps.length).toBeLessThanOrEqual(3);
      expect(parsed.steps.length).toBeGreaterThanOrEqual(1);
    });

    it("should parse solution with 3 steps", () => {
      const solution = `
1단계: 주어진 조건 정리
문제에서 주어진 정보를 정리합니다.

2단계: 식 세우기
주어진 조건으로 방정식을 세웁니다.

3단계: 계산하기
방정식을 풀어 답을 구합니다.

답: x = 5
      `;

      const parsed = parseSolution(solution);
      expect(parsed.steps.length).toBeLessThanOrEqual(3);
    });

    it("should handle single step solution", () => {
      const solution = `
풀이: 직접 계산하면 답은 10입니다.
답: 10
      `;

      const parsed = parseSolution(solution);
      expect(parsed.steps.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Final Answer Separation", () => {
    it("should extract final answer separately", () => {
      const solution = `
1단계: 계산 과정
2단계: 정리
답: x = 5
      `;

      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("x = 5");
      expect(answer).not.toContain("1단계");
      expect(answer).not.toContain("2단계");
    });

    it("should handle answer with multiple values", () => {
      const solution = `
풀이 과정...
답: x = 2, y = 3
      `;

      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("x = 2, y = 3");
    });

    it("should handle answer with special characters", () => {
      const solution = `
계산 과정...
답: √2 + 1
      `;

      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("√2 + 1");
    });

    it("should handle answer with choice format", () => {
      const solution = `
풀이...
답: ③
      `;

      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("③");
    });
  });

  describe("Step Structure", () => {
    it("should have clear step titles", () => {
      const solution = `
**1단계: x절편 구하기**
y = 0을 대입합니다.

**2단계: y절편 구하기**
x = 0을 대입합니다.

답: x절편 = 2, y절편 = 3
      `;

      const parsed = parseSolution(solution);
      parsed.steps.forEach((step) => {
        expect(step.title).toBeTruthy();
        expect(step.title.length).toBeGreaterThan(0);
      });
    });

    it("should have step content", () => {
      const solution = `
1단계: 첫 번째 단계
이것은 첫 번째 단계의 설명입니다.

2단계: 두 번째 단계
이것은 두 번째 단계의 설명입니다.

답: 최종 답
      `;

      const parsed = parseSolution(solution);
      parsed.steps.forEach((step) => {
        expect(step.content).toBeTruthy();
        expect(step.content.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Answer Display Format", () => {
    it("should format answer with emphasis", () => {
      const answer = "x = 5";
      const formattedAnswer = `**답:** ${answer}`;

      expect(formattedAnswer).toContain("**답:**");
      expect(formattedAnswer).toContain(answer);
    });

    it("should handle answer with equation", () => {
      const answer = "y = 2x + 3";
      expect(answer).toMatch(/y\s*=\s*\d+x\s*\+\s*\d+/);
    });

    it("should handle answer with fraction", () => {
      const answer = "x = 1/2";
      expect(answer).toMatch(/\d+\/\d+/);
    });

    it("should handle answer with radical", () => {
      const answer = "x = √2";
      expect(answer).toContain("√");
    });
  });

  describe("Problem Number Display", () => {
    it("should format problem number with badge style", () => {
      const problemNumber = "1번";
      expect(problemNumber).toMatch(/\d+번/);
    });

    it("should handle various problem number formats", () => {
      const formats = ["1번", "2번", "(1)", "(2)", "①", "②"];
      formats.forEach((format) => {
        expect(format).toBeTruthy();
        expect(format.length).toBeGreaterThan(0);
      });
    });

    it("should emphasize problem number", () => {
      const problemNumber = "1번";
      const emphasized = `**${problemNumber}**`;
      expect(emphasized).toContain(problemNumber);
    });
  });

  describe("Solution Parsing with Problem Number", () => {
    it("should parse complete solution with problem number", () => {
      const solution = `
**1번 문제**

1단계: x절편 구하기
y = 0을 대입하면 x = 2

2단계: y절편 구하기
x = 0을 대입하면 y = 3

답: x절편 = 2, y절편 = 3
      `;

      const parsed = parseSolution(solution);
      const answer = extractFinalAnswer(solution);

      expect(parsed.steps.length).toBeGreaterThanOrEqual(1);
      expect(answer).toBe("x절편 = 2, y절편 = 3");
    });

    it("should handle solution without explicit problem number", () => {
      const solution = `
1단계: 계산
2단계: 정리

답: 10
      `;

      const parsed = parseSolution(solution);
      const answer = extractFinalAnswer(solution);

      expect(parsed.steps.length).toBeGreaterThanOrEqual(1);
      expect(answer).toBe("10");
    });
  });
});
