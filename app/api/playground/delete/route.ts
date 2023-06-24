import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  console.log('got req');
  const session = await getServerSession(authOptions);
  if (!session?.user)
    // should turn this into middle ware
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });
  const jsonSchema = z.object({
    id: z.number(),
  });

  const { id } = jsonSchema.parse(await request.json());

  const playground = await prisma.playground.delete({
    where: {
      id,
    },
  });

  console.log('deleted playground', playground.id);

  return NextResponse.json({
    msg: 'Deleted playground: ' + playground.id,
    status: 200,
    playgroundId: playground.id,
  });
}
