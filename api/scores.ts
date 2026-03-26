import type { IncomingMessage, ServerResponse } from "node:http";
import { handleNodeLeaderboardApi } from "../src/server/leaderboardApi";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await handleNodeLeaderboardApi(req, res);
}
