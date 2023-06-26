import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { P, match } from 'ts-pattern';

export async function PUT(request: NextRequest, context: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });
  const json = await request.json();
  const jsonSchema = z.object({
    playgroundID: z.number(),
    // going to need to do a big validation for this unfortunately
    circles: z.array(z.any()).optional(),
    lines: z.array(z.any()).optional(),
    zoomAmount: z.number(),

    // shapes: z.array(z.unknown())
  });
  const parsedJson = jsonSchema.parse(json);

  if (parsedJson.circles) {
    await prisma.playground.update({
      where: {
        id: parsedJson.playgroundID,
      },
      data: {
        circles: parsedJson.circles,
        zoomAmount: parsedJson.zoomAmount,
      },
    });
  }

  if (parsedJson.lines) {
    await prisma.playground.update({
      where: {
        id: parsedJson.playgroundID,
      },
      data: {
        lines: parsedJson.lines,
        zoomAmount: parsedJson.zoomAmount,
      },
    });
  }

  return NextResponse.json({
    msg: 'Successfully updated shapes',
    status: 200,
  });
}
