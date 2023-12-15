import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGetAlgorithmsQuery } from "./useGetAlgorithmsQuery";

export const useDeleteAlgorithm = () => {
  const queryClient = useQueryClient();
  const deleteAlgorithmMutation = useMutation({
    mutationFn: (algoId: string) => {
      queryClient.cancelQueries(["presets"]);
      queryClient.setQueriesData<
        ReturnType<typeof useGetAlgorithmsQuery>["data"]
      >(["getallAlgorithms"], (prev) => {
        return prev?.filter((algo) => algo.id !== algoId);
      });
      return axios.post("/api/algo/delete", {
        id: algoId,
      });
    },
  });
  return deleteAlgorithmMutation;
};
