import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (res: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: "Must be signed in",
      status: 401,
    });

  const dataSchema = z.object({
    circles: z.array(z.any()).optional(),
    lines: z.array(z.any()).optional(),
    validatorLens: z.array(z.any()).optional(),
    zoomAmount: z.number(),
    name: z.string(),
    type: z.string(),
    code: z.string().optional(),
    startNode: z.string().optional(),
  });

  const json = await res.json();

  const data = dataSchema.parse(json);

  await prisma.preset.create({
    data: {
      name: data.name,
      circles: data.circles ?? [],
      lines: data.lines ?? [],
      validatorLens: data.validatorLens,
      zoomAmount: data.zoomAmount,
      type: data.type,
      code: data.code,

      ...(data.startNode && { startNode: data.startNode }),
    },
  });

  return NextResponse.json({});
};
