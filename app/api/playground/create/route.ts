import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('got req');
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });

  console.log('incoming');
  const playground = await prisma.playground.create({
    data: {
      circles: [],
      lines: [],
      pencil: [],
      userId: session.user.id,
      name: 'Untitled',
      zoomAmount: 1,
    },
  });

  console.log('the new playground', playground);

  return NextResponse.json({
    msg: 'Successfully created new playground: ' + playground,
    status: 200,
    playground,
    // spaceId: space.id,
  });
}
