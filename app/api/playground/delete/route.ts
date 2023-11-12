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
  // should turn this into middle ware

  const jsonSchema = z.object({
    id: z.number(),
  });

  const { id } = jsonSchema.parse(await request.json());
  const playground = await prisma.playground.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    msg: "Deleted playground: " + playground.id,
    status: 200,
    playgroundId: playground.id,
  });
}
