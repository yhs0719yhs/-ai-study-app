import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Cron Job Handler - 서버를 항상 켜두기 위해 매분마다 호출됨
 * Vercel이 자동으로 호출하므로 수동으로 호출할 필요 없음
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Cron secret 확인 (보안)
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // 간단한 상태 확인
    const timestamp = new Date().toISOString();
    console.log(`[CRON] Server keep-alive ping at ${timestamp}`);

    return res.status(200).json({
      success: true,
      message: "Server is alive",
      timestamp,
    });
  } catch (error) {
    console.error("[CRON] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
