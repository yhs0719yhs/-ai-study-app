/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * 문제 데이터 타입
 */
export interface Problem {
  id: string;
  imageUri: string;
  imageUrl?: string; // S3 업로드 후 URL
  solution: string; // AI 풀이 내용
  problemType: string; // 문제 유형 (예: 수학, 영어, 과학 등)
  subject?: string; // 과목 (선택)
  createdAt: string; // ISO 날짜 문자열
}

/**
 * 문제 생성 입력 타입
 */
export interface CreateProblemInput {
  imageUri: string;
  imageUrl?: string;
}

/**
 * AI 분석 결과 타입
 */
export interface AnalysisResult {
  solution: string;
  problemType: string;
  subject?: string;
}

/**
 * 통계 데이터 타입
 */
export interface Statistics {
  totalProblems: number;
  topProblemTypes: Array<{
    type: string;
    count: number;
  }>;
  recentTrend: Array<{
    date: string;
    count: number;
  }>;
  subjectDistribution: Array<{
    subject: string;
    count: number;
  }>;
}

/**
 * 학습 목표 타입
 */
export interface LearningGoal {
  dailyGoal: number;
  lastUpdated: string;
}

/**
 * 목표 진행률 타입
 */
export interface GoalProgress {
  goal: number;
  completed: number;
  percentage: number;
  achieved: boolean;
}

/**
 * 풀이 단계 타입
 */
export interface SolutionStep {
  stepNumber: number;
  title: string;
  content: string;
}

/**
 * 파싱된 풀이 타입
 */
export interface ParsedSolution {
  steps: SolutionStep[];
  rawSolution: string;
}
