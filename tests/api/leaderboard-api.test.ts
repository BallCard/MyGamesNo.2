import { afterEach, describe, expect, test, vi } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function loadApiWithFreshStore() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "zju-leaderboard-"));
  process.env.LEADERBOARD_STORE_PATH = path.join(tempDir, "leaderboard.json");
  vi.resetModules();
  const api = await import("../../src/server/leaderboardApi");
  return { tempDir, api };
}

afterEach(async () => {
  delete process.env.LEADERBOARD_STORE_PATH;
  vi.resetModules();
});

describe("leaderboard api", () => {
  test("initializes players, stores only better scores, and returns global plus self rows", async () => {
    const { tempDir, api } = await loadApiWithFreshStore();

    try {
      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/player/init", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "Alpha" }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/player/init", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-b", nickname: "Beta" }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      let response = await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/scores", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "Alpha", score: 42000, peakLevel: 8 }),
          headers: { "Content-Type": "application/json" },
        }),
      );
      expect(response.status).toBe(200);
      let payload = await response.json();
      expect(payload.accepted).toBe(true);
      expect(payload.me.rank).toBe(1);

      response = await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/scores", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "Alpha", score: 41000, peakLevel: 9 }),
          headers: { "Content-Type": "application/json" },
        }),
      );
      payload = await response.json();
      expect(payload.accepted).toBe(false);
      expect(payload.me.score).toBe(42000);
      expect(payload.me.peakLevel).toBe(8);

      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/scores", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-b", nickname: "Beta", score: 50000, peakLevel: 9 }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      response = await api.handleLeaderboardApiRequest(new Request("http://localhost/api/leaderboard/global?anonymousId=anon-a"));
      payload = await response.json();
      expect(payload.entries).toHaveLength(2);
      expect(payload.entries[0]).toMatchObject({ anonymousId: "anon-b", rank: 1, isSelf: false, score: 50000 });
      expect(payload.entries[1]).toMatchObject({ anonymousId: "anon-a", rank: 2, isSelf: true, score: 42000 });
      expect(payload.me).toMatchObject({ anonymousId: "anon-a", rank: 2, score: 42000, peakLevel: 8 });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("updates nickname and exposes the latest value in leaderboard me", async () => {
    const { tempDir, api } = await loadApiWithFreshStore();

    try {
      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/player/init", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "Alpha" }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/player/nickname", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "NewName" }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      await api.handleLeaderboardApiRequest(
        new Request("http://localhost/api/scores", {
          method: "POST",
          body: JSON.stringify({ anonymousId: "anon-a", nickname: "NewName", score: 23000, peakLevel: 7 }),
          headers: { "Content-Type": "application/json" },
        }),
      );

      const response = await api.handleLeaderboardApiRequest(new Request("http://localhost/api/leaderboard/me?anonymousId=anon-a"));
      const payload = await response.json();
      expect(payload.me).toMatchObject({ anonymousId: "anon-a", nickname: "NewName", score: 23000, peakLevel: 7, rank: 1 });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
