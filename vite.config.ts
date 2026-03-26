import type { IncomingMessage } from "node:http";

import { defineConfig, type Plugin } from "vite";

import { handleLeaderboardApiRequest } from "./src/server/leaderboardApi";

function leaderboardApiPlugin(): Plugin {
  return {
    name: "leaderboard-api-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req as IncomingMessage) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
        const origin = req.headers.host ? `http://${req.headers.host}` : "http://localhost:5173";
        const request = new Request(new URL(url, origin), {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
        });

        const response = await handleLeaderboardApiRequest(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        const output = Buffer.from(await response.arrayBuffer());
        res.end(output);
      });
    },
  };
}

export default defineConfig({
  plugins: [leaderboardApiPlugin()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
  },
});
