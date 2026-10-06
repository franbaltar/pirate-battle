import { api } from "./api";

export type RankingEntry = {
  id: number;
  playerName: string;
  score: number;
};

export async function getRanking(): Promise<RankingEntry[]> {
  const response = await api.get<RankingEntry[]>("/ranking");
  return response.data;
}
