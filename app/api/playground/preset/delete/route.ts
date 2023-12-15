import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { z } from "zod";

import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({
      msg: "Must be signed in",
      status: 401,
    });
  }

  const jsonSchema = z.object({
    id: z.string(),
  });

  const { id } = jsonSchema.parse(await request.json());
  const preset = await prisma.preset.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    preset,
    status: 200,
  });
}
