import { http, HttpResponse } from "msw";
import type { RankingEntry } from "../services/rankingService";

const ranking: RankingEntry[] = [
  { id: 1, playerName: "Captain Redwake", score: 9800 },
  { id: 2, playerName: "Mara Stormhook", score: 8450 },
  { id: 3, playerName: "Blackfin Briggs", score: 7200 },
  { id: 4, playerName: "Silas Saltbeard", score: 6100 },
  { id: 5, playerName: "Nell Tidewalker", score: 4900 },
];

export const handlers = [
  http.get("/api/ranking", () => HttpResponse.json(ranking)),
];
