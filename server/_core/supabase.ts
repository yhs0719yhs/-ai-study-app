import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

/**
 * Supabase 클라이언트 초기화
 */
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    throw new Error("Supabase credentials are not configured");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey);
  }

  return supabaseClient;
}

/**
 * 문제 저장
 */
export async function saveProblem(data: {
  userId?: number;
  imageUrl: string;
  problemType: string;
  subject: string;
  solution: string;
}) {
  try {
    const client = getSupabaseClient();
    const { data: result, error } = await (client.from("problems") as any)
      .insert([data])
      .select();

    if (error) {
      throw new Error(`Failed to save problem: ${error.message}`);
    }

    return result?.[0];
  } catch (error) {
    console.error("Error saving problem to Supabase:", error);
    throw error;
  }
}

/**
 * 사용자의 모든 문제 조회
 */
export async function getUserProblems(userId?: number) {
  try {
    const client = getSupabaseClient();
    let query = (client.from("problems") as any).select("*");

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch problems: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching problems from Supabase:", error);
    throw error;
  }
}

/**
 * 문제 삭제
 */
export async function deleteProblem(problemId: number) {
  try {
    const client = getSupabaseClient();
    const { error } = await (client.from("problems") as any).delete().eq("id", problemId);

    if (error) {
      throw new Error(`Failed to delete problem: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting problem from Supabase:", error);
    throw error;
  }
}

/**
 * 학습 목표 저장
 */
export async function saveLearningGoal(data: {
  userId?: number;
  goalType: "daily" | "weekly" | "monthly";
  targetCount: number;
  currentCount?: number;
  subject?: string;
}) {
  try {
    const client = getSupabaseClient();
    const { data: result, error } = await (client.from("learning_goals") as any)
      .insert([data])
      .select();

    if (error) {
      throw new Error(`Failed to save learning goal: ${error.message}`);
    }

    return result?.[0];
  } catch (error) {
    console.error("Error saving learning goal to Supabase:", error);
    throw error;
  }
}

/**
 * 사용자의 학습 목표 조회
 */
export async function getUserLearningGoals(userId?: number) {
  try {
    const client = getSupabaseClient();
    let query = (client.from("learning_goals") as any).select("*");

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch learning goals: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching learning goals from Supabase:", error);
    throw error;
  }
}

/**
 * 통계 데이터 저장
 */
export async function saveStatistics(data: {
  userId?: number;
  totalProblems: number;
  topProblemTypes?: string;
  recentTrend?: string;
  subjectDistribution?: string;
}) {
  try {
    const client = getSupabaseClient();
    const { data: result, error } = await (client.from("statistics") as any)
      .insert([data])
      .select();

    if (error) {
      throw new Error(`Failed to save statistics: ${error.message}`);
    }

    return result?.[0];
  } catch (error) {
    console.error("Error saving statistics to Supabase:", error);
    throw error;
  }
}

/**
 * 사용자의 통계 데이터 조회
 */
export async function getUserStatistics(userId?: number) {
  try {
    const client = getSupabaseClient();
    let query = (client.from("statistics") as any).select("*");

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1);

    if (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error fetching statistics from Supabase:", error);
    throw error;
  }
}
