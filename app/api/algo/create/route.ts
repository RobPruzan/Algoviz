import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/auth-options";

export async function POST(request: Request) {
  const algoSchema = z.object({
    code: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.string(),
    language: z.string(),
    algoID: z.string(),
    isGodMode: z.boolean(),
  });
  const json = await request.json();
  const { code, title, description, type, algoID, language, isGodMode } =
    algoSchema.parse(json);
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: "Must be signed in",
      status: 401,
    });
  try {
    const algo = await prisma.algorithm.create({
      data: {
        code,
        title,
        algoID,
        isGodMode,
        description,
        userId: session.user.id,
        type,
        language,
      },
    });

    return NextResponse.json({
      msg: "Successfully created new algo: " + algo,
      status: 200,
    });
  } catch (e) {
    console.error("error is", e);
  }
}
