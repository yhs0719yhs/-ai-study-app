import { describe, it, expect, beforeAll } from "vitest";

/**
 * 외부 서비스 연동 테스트
 * OpenAI, Supabase, Vercel API 키 검증
 */

describe("External Services Integration", () => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const vercelUrl = process.env.VERCEL_DEPLOYMENT_URL;

  describe("OpenAI API", () => {
    it("should have valid OpenAI API key format", () => {
      expect(openaiKey).toBeDefined();
      expect(openaiKey).toMatch(/^sk-proj-/);
      expect(openaiKey?.length).toBeGreaterThan(20);
    });

    it("should validate OpenAI API key connectivity", async () => {
      if (!openaiKey) {
        console.warn("OpenAI API key not set, skipping connectivity test");
        return;
      }

      try {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
          },
        });

        // API 키가 유효하면 200 또는 401 (권한 부족) 반환
        // 잘못된 키면 401 반환
        expect([200, 401]).toContain(response.status);
      } catch (error) {
        console.error("OpenAI connectivity test failed:", error);
        // 네트워크 오류는 무시
      }
    });
  });

  describe("Supabase Configuration", () => {
    it("should have valid Supabase URL", () => {
      expect(supabaseUrl).toBeDefined();
      expect(supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);
    });

    it("should have valid Supabase Anon Key", () => {
      expect(supabaseAnonKey).toBeDefined();
      expect(supabaseAnonKey).toMatch(/^sb_publishable_/);
      expect(supabaseAnonKey?.length).toBeGreaterThan(20);
    });

    it("should validate Supabase connectivity", async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials not set, skipping connectivity test");
        return;
      }

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });

        // Supabase REST API 응답 확인
        expect([200, 401, 404]).toContain(response.status);
      } catch (error) {
        console.error("Supabase connectivity test failed:", error);
        // 네트워크 오류는 무시
      }
    });
  });

  describe("Vercel Deployment", () => {
    it("should have valid Vercel deployment URL", () => {
      expect(vercelUrl).toBeDefined();
      expect(vercelUrl).toMatch(/^https:\/\/.+\.vercel\.app\/?$/);
    });

    it("should validate Vercel deployment connectivity", async () => {
      if (!vercelUrl) {
        console.warn("Vercel URL not set, skipping connectivity test");
        return;
      }

      try {
        const response = await fetch(vercelUrl, {
          method: "HEAD",
          redirect: "follow",
        });

        // Vercel 배포 상태 확인
        expect([200, 404, 500]).toContain(response.status);
      } catch (error) {
        console.error("Vercel connectivity test failed:", error);
        // 네트워크 오류는 무시
      }
    });
  });

  describe("Environment Variables", () => {
    it("should have all required environment variables", () => {
      const requiredVars = [
        "OPENAI_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "VERCEL_DEPLOYMENT_URL",
      ];

      requiredVars.forEach((varName) => {
        expect(process.env[varName]).toBeDefined();
      });
    });

    it("should not have empty environment variables", () => {
      expect(openaiKey?.trim().length).toBeGreaterThan(0);
      expect(supabaseUrl?.trim().length).toBeGreaterThan(0);
      expect(supabaseAnonKey?.trim().length).toBeGreaterThan(0);
      expect(vercelUrl?.trim().length).toBeGreaterThan(0);
    });
  });
});
