import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);

  const data = await prisma.algorithm.findMany({
    where: {
      OR: [{ userId: session?.user.id }, { isGodMode: true }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const res = NextResponse.json(
    data.map((d) => ({ ...d, algoID: d.algoID ?? "default" }))
  );

  return res;
}
