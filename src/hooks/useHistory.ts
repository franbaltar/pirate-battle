import { useQuery } from "@tanstack/react-query";
import { getHistory } from "../services/rankingService";

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });
}
