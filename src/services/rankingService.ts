import { api } from "./api";

export type RankingEntry = {
  id: number;
  playerName: string;
  score: number;
};

export type MatchHistoryEntry = {
  id: number;
  playerName: string;
  score: number;
  playedAt: string;
};

export async function getRanking(): Promise<RankingEntry[]> {
  const response = await api.get<RankingEntry[]>("/ranking");
  return response.data;
}

export async function getHistory(): Promise<MatchHistoryEntry[]> {
  const response = await api.get<MatchHistoryEntry[]>("/history");
  return response.data;
}

export type SubmitScoreInput = {
  playerName: string;
  score: number;
};

export async function submitScore(
  input: SubmitScoreInput,
): Promise<SubmitScoreInput> {
  const response = await api.post<SubmitScoreInput>("/scores", input);
  return response.data;
}
