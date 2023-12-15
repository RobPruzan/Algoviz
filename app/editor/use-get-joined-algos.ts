import { useGetAlgorithmsQuery } from "@/hooks/useGetAlgorithmsQuery";
import { useGetPresets } from "@/hooks/useGetPresets";
import { ArrayItem, DateToString } from "@/lib/types";
import { Algorithm } from "@prisma/client";
import { useSession } from "next-auth/react";
export type GetPresetsData = ReturnType<typeof useGetPresets>["data"];
export type QueryPreset = ArrayItem<
  (GetPresetsData extends infer R | null | undefined
    ? R
    : { presets: Array<unknown> })["presets"]
>;

export const useGetJoinedAlgos = (): {
  joinedAlgos: Array<
    | (DateToString<Algorithm> & { type: "algo" })
    | (QueryPreset & { type: "preset" })
  >;
  revalidate: () => void;
} => {
  const algosQuery = useGetAlgorithmsQuery();
  const presetsQuery = useGetPresets();
  const user = useSession().data?.user;
  const revalidate = () => {
    algosQuery.refetch();
    presetsQuery.refetch();
  };
  if (!algosQuery.data)
    return {
      joinedAlgos: [],
      revalidate,
    };
  if (!presetsQuery.data)
    return {
      joinedAlgos: [],
      revalidate,
    };

  return {
    joinedAlgos: [
      ...algosQuery.data.map((a) => ({ ...a, type: "algo" as const })),
      ...(user?.email === process.env.NEXT_PUBLIC_GOD_MODE
        ? presetsQuery.data.presets
        : []
      ).map((p) => ({
        ...p,
        type: "preset" as const,
      })),
    ],
    revalidate,
  };
};
