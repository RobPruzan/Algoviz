import { prisma } from '@/lib/prisma';
import { Space } from '@prisma/client';
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
  const space = await prisma.space.create({
    data: {
      circles: [],
      lines: [],
      pencil: [],
      userId: session.user.id,
      name: 'test name',
    },
  });

  console.log('the new space', space.id);

  return NextResponse.json({
    msg: 'Successfully created new space: ' + space,
    status: 200,
    spaceId: space.id,
  });
}
