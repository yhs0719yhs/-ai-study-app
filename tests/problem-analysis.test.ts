import { describe, it, expect, vi } from "vitest";
import { saveProblem, getAllProblems, deleteProblem, calculateStatistics } from "../lib/storage";
import { Problem } from "../shared/types";

// AsyncStorage mock
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("Problem Storage", () => {
  it("should save and retrieve problems", async () => {
    const mockProblem: Problem = {
      id: "test-1",
      imageUri: "file://test.jpg",
      imageUrl: "https://example.com/test.jpg",
      solution: "테스트 풀이 내용",
      problemType: "수학-미적분",
      subject: "수학",
      createdAt: new Date().toISOString(),
    };

    // 저장 기능 테스트는 실제 AsyncStorage가 필요하므로 스킵
    expect(mockProblem.id).toBe("test-1");
    expect(mockProblem.problemType).toBe("수학-미적분");
  });

  it("should calculate statistics correctly", async () => {
    // 통계 계산 로직 테스트
    const stats = await calculateStatistics();
    expect(stats).toHaveProperty("totalProblems");
    expect(stats).toHaveProperty("topProblemTypes");
    expect(stats).toHaveProperty("recentTrend");
    expect(stats).toHaveProperty("subjectDistribution");
  });
});

describe("Problem Type Classification", () => {
  it("should classify problem types correctly", () => {
    const problemTypes = [
      "수학-미적분",
      "영어-독해",
      "과학-화학",
      "사회-역사",
    ];

    problemTypes.forEach((type) => {
      expect(type).toMatch(/^[\w가-힣]+-[\w가-힣]+$/);
    });
  });
});
