import { useGetAlgorithmsQuery } from "@/hooks/useGetAlgorithmsQuery";
import { useGetPresets } from "@/hooks/useGetPresets";
import { ArrayItem, DateToString } from "@/lib/types";
import { Algorithm } from "@prisma/client";
type GetPresetsData = ReturnType<typeof useGetPresets>["data"];
type QueryPreset = ArrayItem<
  (GetPresetsData extends infer R | null | undefined
    ? R
    : { presets: Array<unknown> })["presets"]
>;

export const useGetJoinedAlgos = (): Array<
  | (DateToString<Algorithm> & { type: "algo" })
  | (QueryPreset & { type: "preset" })
> => {
  const algosQuery = useGetAlgorithmsQuery();
  const presetsQuery = useGetPresets();

  if (!algosQuery.data) return [];
  if (!presetsQuery.data) return [];

  return [
    ...presetsQuery.data.presets.map((p) => ({
      ...p,
      type: "preset" as const,
    })),
    ...algosQuery.data.map((a) => ({ ...a, type: "algo" as const })),
  ];
};
