import { prisma } from "@/lib/prisma";
import { MainEditor } from "./MainEditor";
import { EditPage } from "./EditPage";
import getQueryClient from "@/lib/getQueryClient";
import { Hydrate, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  AlgoContextProvider,
  CurrentCodeContextProvider,
} from "./algo-context";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth-options";

export default async function Editor() {
  const queryClient = getQueryClient();
  const session = await getServerSession(authOptions);
  await Promise.all([
    queryClient.prefetchQuery(["getallAlgorithms"], () =>
      prisma.algorithm.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          userId: session?.user.id
        }
      })
    ),
    queryClient.prefetchQuery(["presets"], async () => ({
      presets: await prisma.preset.findMany(),
      where: {
        userId: session?.user.id
      }
    })),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="h-full w-full  px-5 py-8">
      <CurrentCodeContextProvider>
        <AlgoContextProvider>
          <Hydrate state={dehydratedState}>
            <EditPage />
          </Hydrate>
        </AlgoContextProvider>
      </CurrentCodeContextProvider>
    </div>
  );
}
