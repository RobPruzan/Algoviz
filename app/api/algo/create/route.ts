import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const algoSchema = z.object({
    code: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.string(),
  });
  const json = await request.json();

  console.log('incoming json woo', json);
  const { code, title, description, type } = algoSchema.parse(json);
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({
      msg: 'Must be signed in',
      status: 401,
    });
  try {
    const algo = await prisma.algorithm.create({
      data: {
        code,
        title,
        description,
        userId: session.user.id,
        type,
      },
    });

    return NextResponse.json({
      msg: 'Successfully created new algo: ' + algo,
      status: 200,
    });
  } catch (e) {
    console.error('error is', e);
  }
}
