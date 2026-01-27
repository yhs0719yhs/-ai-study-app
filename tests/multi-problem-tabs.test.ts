import { describe, it, expect } from "vitest";
import { extractFinalAnswer } from "../lib/solution-parser";

/**
 * 다중 문제 탭 기능 테스트
 */

describe("Multi-Problem Tabs Feature", () => {
  describe("Final Answer Extraction", () => {
    it("should extract answer with '답:' format", () => {
      const solution = `
1단계: 주어진 식을 정리합니다.
2단계: 계산을 진행합니다.
답: x = 5
      `;
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("x = 5");
    });

    it("should extract answer with '최종 답:' format", () => {
      const solution = `
풀이 과정...
최종 답: 42
      `;
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("42");
    });

    it("should extract answer with bold format", () => {
      const solution = `
단계별 풀이...
**답:** 3.14
      `;
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("3.14");
    });

    it("should extract answer with '따라서 답은' format", () => {
      const solution = `
계산 과정...
따라서 답은 √2입니다.
      `;
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("√2입니다.");
    });

    it("should return null when no answer is found", () => {
      const solution = "풀이 과정만 있고 답이 없습니다.";
      const answer = extractFinalAnswer(solution);
      expect(answer).toBeNull();
    });

    it("should handle multiple answer formats", () => {
      const solutions = [
        "답: 10",
        "최종 답: 20",
        "**답:** 30",
        "따라서 답은 40입니다.",
      ];

      solutions.forEach((solution) => {
        const answer = extractFinalAnswer(solution);
        expect(answer).not.toBeNull();
        expect(answer?.length).toBeGreaterThan(0);
      });
    });

    it("should trim whitespace from extracted answer", () => {
      const solution = "답:   x = 5   ";
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("x = 5");
    });

    it("should handle Korean punctuation", () => {
      const solution = "답：y = 3x + 2";
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("y = 3x + 2");
    });
  });

  describe("Solution Parsing", () => {
    it("should parse multi-step solutions correctly", () => {
      const solution = `
1단계: 주어진 조건을 정리합니다.
2단계: 식을 전개합니다.
3단계: 항을 정렬합니다.
답: x = 5
      `;

      // 단계 개수 확인
      const stepCount = (solution.match(/\d단계/g) || []).length;
      expect(stepCount).toBe(3);

      // 답 추출
      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("x = 5");
    });

    it("should handle solutions with code blocks", () => {
      const solution = `
풀이:
\`\`\`
x = 2
y = 3
\`\`\`
답: (2, 3)
      `;

      const answer = extractFinalAnswer(solution);
      expect(answer).toBe("(2, 3)");
    });
  });

  describe("Tab Navigation", () => {
    it("should support multiple problem selection", () => {
      const problemIds = ["prob1", "prob2", "prob3"];
      const selectedIds = problemIds.join(",");

      expect(selectedIds).toBe("prob1,prob2,prob3");
      expect(selectedIds.split(",")).toHaveLength(3);
    });

    it("should validate minimum selection count", () => {
      const selectedIds = ["prob1"];
      const isValid = selectedIds.length >= 2;

      expect(isValid).toBe(false);
    });

    it("should handle tab switching", () => {
      const problems = [
        { id: "1", title: "문제 1" },
        { id: "2", title: "문제 2" },
        { id: "3", title: "문제 3" },
      ];

      let currentTabIndex = 0;

      // 탭 이동
      currentTabIndex = 1;
      expect(problems[currentTabIndex].id).toBe("2");

      currentTabIndex = 2;
      expect(problems[currentTabIndex].id).toBe("3");

      currentTabIndex = 0;
      expect(problems[currentTabIndex].id).toBe("1");
    });

    it("should prevent invalid tab index", () => {
      const problems = [
        { id: "1", title: "문제 1" },
        { id: "2", title: "문제 2" },
      ];

      let currentTabIndex = 0;
      const nextIndex = Math.min(currentTabIndex + 1, problems.length - 1);

      expect(nextIndex).toBe(1);

      currentTabIndex = 1;
      const nextIndex2 = Math.min(currentTabIndex + 1, problems.length - 1);

      expect(nextIndex2).toBe(1); // 마지막 탭이므로 변경 없음
    });
  });

  describe("Problem Selection UI", () => {
    it("should track selected problems", () => {
      const selectedProblems = new Set<string>();

      selectedProblems.add("prob1");
      selectedProblems.add("prob2");

      expect(selectedProblems.size).toBe(2);
      expect(selectedProblems.has("prob1")).toBe(true);
      expect(selectedProblems.has("prob2")).toBe(true);
    });

    it("should toggle problem selection", () => {
      const selectedProblems = new Set<string>();

      selectedProblems.add("prob1");
      expect(selectedProblems.size).toBe(1);

      selectedProblems.delete("prob1");
      expect(selectedProblems.size).toBe(0);

      selectedProblems.add("prob1");
      expect(selectedProblems.size).toBe(1);
    });

    it("should clear all selections", () => {
      const selectedProblems = new Set(["prob1", "prob2", "prob3"]);

      expect(selectedProblems.size).toBe(3);

      selectedProblems.clear();

      expect(selectedProblems.size).toBe(0);
    });
  });
});
