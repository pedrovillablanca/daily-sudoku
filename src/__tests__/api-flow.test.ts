import { describe, it, expect } from "vitest";

const BASE = process.env.TEST_API_URL || "http://localhost:3000";
const ts = Date.now();

function api(method: string, path: string, body?: object) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, data: await r.json() }));
}

describe("API flow: score submission", () => {
  it("TEST 1: submits new score and returns rank", async () => {
    const r = await api("POST", "/api/score", {
      alias: `APITest_${ts}`,
      fingerprint: `api_test_fp_${ts}_1`,
      score: 500,
      timeSeconds: 120,
      errors: 3,
      difficulty: "medium",
    });
    expect(r.status).toBe(200);
    expect(r.data.rank).toBeGreaterThan(0);
    expect(r.data.score).toBe(500);
    expect(r.data.alias).toBe(`APITest_${ts}`);
  });

  it("TEST 2: same fingerprint → 409", async () => {
    const r = await api("POST", "/api/score", {
      alias: `APITest_${ts}`,
      fingerprint: `api_test_fp_${ts}_1`,
      score: 600,
      timeSeconds: 100,
      errors: 1,
      difficulty: "medium",
    });
    expect(r.status).toBe(409);
    expect(r.data.error).toContain("Already played");
  });

  it("TEST 3: different fingerprint, same IP → 409", async () => {
    const r = await api("POST", "/api/score", {
      alias: `APITest2_${ts}`,
      fingerprint: `api_test_fp_${ts}_2`,
      score: 450,
      timeSeconds: 150,
      errors: 5,
      difficulty: "medium",
    });
    expect(r.status).toBe(409);
    expect(r.data.error).toContain("network");
  });

  it("TEST 4: leaderboard includes our score with errors=3", async () => {
    const today = new Date().toISOString().split("T")[0];
    const r = await api("GET", `/api/leaderboard?date=${today}`);
    expect(r.status).toBe(200);
    const entry = r.data.find(
      (e: { alias: string }) => e.alias === `APITest_${ts}`
    );
    expect(entry).toBeDefined();
    expect(entry.errors).toBe(3);
    expect(entry.score).toBe(500);
  });

  it("TEST 5: check-played returns true for submitted fp, false for unknown", async () => {
    const r1 = await api("GET", `/api/check-played?fp=api_test_fp_${ts}_1`);
    expect(r1.status).toBe(200);
    expect(r1.data.played).toBe(true);

    const r2 = await api("GET", `/api/check-played?fp=never_played_ever`);
    expect(r2.status).toBe(200);
    expect(r2.data.played).toBe(false);
  });
});
