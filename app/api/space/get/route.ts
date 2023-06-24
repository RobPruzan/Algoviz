import { prisma } from '@/lib/prisma';
import { Space } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  console.log('got req');
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });

  console.log('incoming');
  const spaces = await prisma.space.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const tag = request.nextUrl.searchParams.get('tag');
  tag && revalidateTag(tag);

  console.log('the spaces', spaces);

  return NextResponse.json({
    status: 200,
    spaces,
    revalidated: true,
    now: Date.now(),
  });
}
