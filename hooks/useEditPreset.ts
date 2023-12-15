import { QueryPreset } from "@/app/editor/use-get-joined-algos";
import { DateToString } from "@/lib/types";
import { Algorithm, Preset } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGetAlgorithmsQuery } from "./useGetAlgorithmsQuery";
import { useGetPresets } from "./useGetPresets";

export const useEditPreset = () => {
  const queryClient = useQueryClient();
  const editPresetMutation = useMutation({
    mutationFn: ({ newPreset }: { newPreset: QueryPreset }) => {
      queryClient.cancelQueries(["presets"]);
      queryClient.setQueryData<ReturnType<typeof useGetPresets>["data"]>(
        ["presets"],
        (prev) => {
          return {
            presets:
              prev?.presets.map((preset) => {
                if (preset.id === newPreset.id) {
                  return newPreset;
                }
                return preset;
              }) ?? [],
          };
        }
      );
      return axios.post("/api/algo/edit", {
        newPreset,
      });
    },
    onError: () => {
      console.log("wah wah");
    },
  });

  return editPresetMutation;
};
