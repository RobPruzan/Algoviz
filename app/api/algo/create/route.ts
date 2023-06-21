import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  const algoSchema = z.object({
    code: z.string(),
    name: z.string(),
  });
  const { code, name } = algoSchema.parse(await request.json());
  const session = await getServerSession(authOptions);
  // console.log('incoming sesion', session);
  if (!session?.user) return;
  await prisma.algorithm.create({
    data: {
      code,
      name,
      userId: session.user.id,
    },
  });

  // console.log('after');
}
