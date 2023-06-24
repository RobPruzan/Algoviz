import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('got req', request);
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });
  }
  // should turn this into middle ware

  console.log('cock');

  const jsonSchema = z.object({
    id: z.number(),
  });
  console.log('1');

  const { id } = jsonSchema.parse(await request.json());
  console.log('2');
  const playground = await prisma.playground.delete({
    where: {
      id,
    },
  });
  console.log('3');

  console.log('deleted playground', playground.id);

  return NextResponse.json({
    msg: 'Deleted playground: ' + playground.id,
    status: 200,
    playgroundId: playground.id,
  });
}
