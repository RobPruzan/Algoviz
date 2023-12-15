import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGetPresets } from "./useGetPresets";

export const useDeletePreset = () => {
  const queryClient = useQueryClient();
  const deleteAlgorithmMutation = useMutation({
    mutationFn: (algoId: string) => {
      queryClient.cancelQueries(["presets"]);
      queryClient.setQueriesData<ReturnType<typeof useGetPresets>["data"]>(
        ["presets"],
        (prev) => {
          return {
            presets: prev?.presets.filter((algo) => algo.id !== algoId) ?? [],
          };
        }
      );
      return axios.post("/api/playground/preset/delete", {
        id: algoId,
      });
    },
  });
  return deleteAlgorithmMutation;
};
