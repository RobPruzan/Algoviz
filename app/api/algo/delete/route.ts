import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/auth-options";
import { NextRequest, NextResponse } from "next/server";

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
  const algorithm = await prisma.algorithm.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    algorithm,
    status: 200,
  });
}
