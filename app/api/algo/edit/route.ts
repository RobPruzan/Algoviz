import { algorithmSchema } from "@/app/zodSchemas";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(request: Request) {
  const editAlgoSchema = z.object({
    newAlgorithm: algorithmSchema,
  });

  const json = await request.json();
  const { newAlgorithm } = editAlgoSchema.parse(json);

  const session = await getServerSession(authOptions);

  if (!session?.user)
    return NextResponse.json({
      msg: "Must be signed in",
      status: 401,
    });

  try {
    const algo = await prisma.algorithm.update({
      where: {
        id: newAlgorithm.id,
      },
      data: {
        algoID: newAlgorithm.algoID,
        code: newAlgorithm.code,
        description: newAlgorithm.description,
        isGodMode: newAlgorithm.isGodMode,
        language: newAlgorithm.language,
        title: newAlgorithm.title,
      },
    });

    return NextResponse.json({
      algo,
      status: 200,
    });
  } catch (e) {
    console.error("error is", e);
  }
}
