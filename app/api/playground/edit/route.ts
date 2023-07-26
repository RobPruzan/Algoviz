import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });

  const json = await request.json();
  console.log('request data', json);

  const jsonSchema = z.object({
    id: z.number(),
    name: z.string(),
  });

  const parsedJson = jsonSchema.safeParse(json);

  console.log('parsed json', parsedJson);

  if (!parsedJson.success) {
    return NextResponse.json(null, {
      status: 400,
    });
  }

  const playground = await prisma.playground.update({
    where: {
      id: parsedJson.data.id,
    },
    data: {
      name: parsedJson.data.name,
    },
  });

  return NextResponse.json({
    msg: 'Successfully updated playground: ' + playground,
    status: 200,
    name: playground.name,
    id: playground.id,
  });
}
