import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitScore } from "../services/rankingService";

export function useSubmitScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitScore,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ranking"] }),
        queryClient.invalidateQueries({ queryKey: ["history"] }),
      ]);
    },
  });
}
