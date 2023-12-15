import { ArrayItem, DateToString } from "@/lib/types";
import { Algorithm } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGetAlgorithmsQuery } from "./useGetAlgorithmsQuery";

export const useEditAlgorithm = () => {
  const queryClient = useQueryClient();
  const editALgorithmMutation = useMutation({
    mutationFn: ({
      newAlgorithm,
    }: {
      newAlgorithm: Omit<Algorithm, "createdAt" | "isGodMode">;
    }) => {
      queryClient.cancelQueries(["getallAlgorithms"]);
      queryClient.setQueryData<
        Array<
          Omit<
            ArrayItem<ReturnType<typeof useGetAlgorithmsQuery>["data"]>,
            "createdAt" | "isGodMode"
          >
        >
      >(["getallAlgorithms"], (prev) => {
        return (
          prev?.map((algo) => {
            if (algo.id === newAlgorithm.id) {
              console.log("dub mode", newAlgorithm);
              return {
                ...newAlgorithm,
                language: newAlgorithm.language as "python",
              };
            }
            return algo;
          }) ?? []
        );
      });
      return axios.post("/api/algo/edit", {
        newAlgorithm,
      });
    },
  });

  return editALgorithmMutation;
};
