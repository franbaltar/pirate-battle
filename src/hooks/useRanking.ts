import { useQuery } from "@tanstack/react-query";
import { getRanking } from "../services/rankingService";

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: getRanking,
  });
}
