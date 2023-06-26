import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });

  const playgrounds = await prisma.playground.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      userId: true,
      name: true,
      createdAt: true,
    },
  });

  const tag = request.nextUrl.searchParams.get('tag');
  tag && revalidateTag(tag);

  return NextResponse.json({
    status: 200,
    playgrounds,
    revalidated: true,
    now: Date.now(),
  });
}
