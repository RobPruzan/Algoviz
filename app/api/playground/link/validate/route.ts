import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Playground, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { P, match } from 'ts-pattern';
import { z } from 'zod';

type InsidePromise<T> = T extends Promise<infer TData> ? TData : T;

export async function POST(request: NextRequest) {
  console.log('got request for validate link', request);
  const pattern = await getCases(request);
  console.log('the pattern', pattern);

  switch (pattern.type) {
    case 'IS_OWNER':
      console.log('is owner');
      return NextResponse.json({
        msg: 'User owns playground',
        playground: pattern.data,
        status: 200,
      });
    case 'NO_VERIFICATION_NEEDED':
      console.log('is NO_VERIFICATION_NEEDED');
      return NextResponse.json({
        msg: 'No verification needed',
        status: 200,
        playground: null,
      });
    case 'VALID_LINK':
      console.log('is VALID_LINK');
      return NextResponse.json({
        msg: 'Successfully validated link',
        playground: pattern.data,
        status: 200,
      });
    case 'DENIED':
      console.log('is DENied');
      return NextResponse.json({
        msg: 'Does not have access to playground',
        status: 401,
        playground: null,
      });
    case 'NO_PLAYGROUND_FOUND':
      console.log('is playground seen (found');
      return NextResponse.json({
        msg: 'No playground found',
        status: 400,
        playground: null,
      });
  }
}
