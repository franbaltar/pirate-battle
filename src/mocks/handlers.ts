import { http, HttpResponse } from "msw";
import type {
  MatchHistoryEntry,
  RankingEntry,
  SubmitScoreInput,
} from "../services/rankingService";

const ranking: RankingEntry[] = [
  { id: 1, playerName: "Captain Redwake", score: 9800 },
  { id: 2, playerName: "Mara Stormhook", score: 8450 },
  { id: 3, playerName: "Blackfin Briggs", score: 7200 },
  { id: 4, playerName: "Silas Saltbeard", score: 6100 },
  { id: 5, playerName: "Nell Tidewalker", score: 4900 },
];

const history: MatchHistoryEntry[] = [
  {
    id: 1,
    playerName: "Captain Redwake",
    score: 9800,
    playedAt: "2026-10-06T18:42:00.000Z",
  },
  {
    id: 2,
    playerName: "Mara Stormhook",
    score: 8450,
    playedAt: "2026-10-05T14:17:00.000Z",
  },
  {
    id: 3,
    playerName: "Blackfin Briggs",
    score: 7200,
    playedAt: "2026-10-04T21:03:00.000Z",
  },
  {
    id: 4,
    playerName: "Silas Saltbeard",
    score: 6100,
    playedAt: "2026-10-03T09:36:00.000Z",
  },
  {
    id: 5,
    playerName: "Nell Tidewalker",
    score: 4900,
    playedAt: "2026-10-02T16:51:00.000Z",
  },
];

export const handlers = [
  http.get("/api/ranking", () => HttpResponse.json(ranking)),
  http.get("/api/history", () => HttpResponse.json(history)),
  http.post("/api/scores", async ({ request }) => {
    const scoreData = (await request.json()) as SubmitScoreInput;
    return HttpResponse.json(scoreData, { status: 201 });
  }),
];
