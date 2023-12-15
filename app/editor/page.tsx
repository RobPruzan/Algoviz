import { prisma } from "@/lib/prisma";
import { MainEditor } from "./MainEditor";
import { EditPage } from "./EditPage";
import getQueryClient from "@/lib/getQueryClient";
import { Hydrate, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { AlgoContextProvider } from "./algo-context";

export default async function Editor() {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(["getallAlgorithms"], () =>
      prisma.algorithm.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    ),
    queryClient.prefetchQuery(["presets"], async () => ({
      presets: await prisma.preset.findMany(),
    })),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="h-full w-full mt-5 p-5 ">
      <AlgoContextProvider>
        <Hydrate state={dehydratedState}>
          <EditPage />
        </Hydrate>
      </AlgoContextProvider>
    </div>
  );
}
