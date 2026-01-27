import AsyncStorage from "@react-native-async-storage/async-storage";
import { Problem, LearningGoal, GoalProgress } from "@/shared/types";

const PROBLEMS_KEY = "@ai_study_app:problems";

/**
 * 모든 문제 가져오기
 */
export async function getAllProblems(): Promise<Problem[]> {
  try {
    const data = await AsyncStorage.getItem(PROBLEMS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("문제 목록 가져오기 오류:", error);
    return [];
  }
}

/**
 * 문제 저장하기
 */
export async function saveProblem(problem: Problem): Promise<void> {
  try {
    const problems = await getAllProblems();
    problems.unshift(problem); // 최신 문제를 맨 앞에 추가
    await AsyncStorage.setItem(PROBLEMS_KEY, JSON.stringify(problems));
  } catch (error) {
    console.error("문제 저장 오류:", error);
    throw error;
  }
}

/**
 * 문제 삭제하기
 */
export async function deleteProblem(id: string): Promise<void> {
  try {
    const problems = await getAllProblems();
    const filtered = problems.filter((p) => p.id !== id);
    await AsyncStorage.setItem(PROBLEMS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("문제 삭제 오류:", error);
    throw error;
  }
}

/**
 * 특정 문제 가져오기
 */
export async function getProblemById(id: string): Promise<Problem | null> {
  try {
    const problems = await getAllProblems();
    return problems.find((p) => p.id === id) || null;
  } catch (error) {
    console.error("문제 가져오기 오류:", error);
    return null;
  }
}

/**
 * 통계 계산하기
 */
export async function calculateStatistics() {
  const problems = await getAllProblems();
  
  // 총 문제 수
  const totalProblems = problems.length;
  
  // 문제 유형별 카운트
  const typeCount: Record<string, number> = {};
  problems.forEach((p) => {
    typeCount[p.problemType] = (typeCount[p.problemType] || 0) + 1;
  });
  
  // Top 5 문제 유형
  const topProblemTypes = Object.entries(typeCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 최근 7일 추세
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentProblems = problems.filter(
    (p) => new Date(p.createdAt) >= sevenDaysAgo
  );
  
  const dateCount: Record<string, number> = {};
  recentProblems.forEach((p) => {
    const date = new Date(p.createdAt).toISOString().split("T")[0];
    dateCount[date] = (dateCount[date] || 0) + 1;
  });
  
  const recentTrend = Object.entries(dateCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // 과목별 분포
  const subjectCount: Record<string, number> = {};
  problems.forEach((p) => {
    if (p.subject) {
      subjectCount[p.subject] = (subjectCount[p.subject] || 0) + 1;
    }
  });
  
  const subjectDistribution = Object.entries(subjectCount)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalProblems,
    topProblemTypes,
    recentTrend,
    subjectDistribution,
  };
}

// 학습 목표 관리
const GOAL_KEY = "@ai_study_app:learning_goal";
const DEFAULT_GOAL = 10;

export async function getLearningGoal(): Promise<LearningGoal> {
  try {
    const goal = await AsyncStorage.getItem(GOAL_KEY);
    if (goal) {
      return JSON.parse(goal);
    }
    return {
      dailyGoal: DEFAULT_GOAL,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("학습 목표 조회 오류:", error);
    return {
      dailyGoal: DEFAULT_GOAL,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function setLearningGoal(dailyGoal: number): Promise<void> {
  try {
    const goal: LearningGoal = {
      dailyGoal,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  } catch (error) {
    console.error("학습 목표 저장 오류:", error);
  }
}

export async function getGoalProgress(): Promise<GoalProgress> {
  try {
    const goal = await getLearningGoal();
    const problems = await getAllProblems();
    
    const today = new Date().toDateString();
    const todayProblems = problems.filter(
      (p) => new Date(p.createdAt).toDateString() === today
    );
    
    const completed = todayProblems.length;
    const percentage = Math.min(
      Math.round((completed / goal.dailyGoal) * 100),
      100
    );
    
    return {
      goal: goal.dailyGoal,
      completed,
      percentage,
      achieved: completed >= goal.dailyGoal,
    };
  } catch (error) {
    console.error("목표 진행률 조회 오류:", error);
    return {
      goal: DEFAULT_GOAL,
      completed: 0,
      percentage: 0,
      achieved: false,
    };
  }
}
