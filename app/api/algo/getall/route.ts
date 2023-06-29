import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  // const { code, name } = algoSchema.parse(await request.json());
  const session = await getServerSession(authOptions);
  const data = await prisma.algorithm.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // console.log('returned data', data);

  const res = NextResponse.json(data);
  return res;
}
