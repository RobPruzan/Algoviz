import React from 'react';
import Spaces from './Spaces';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import getQueryClient from '@/lib/getQueryClient';
import { Hydrate, dehydrate } from '@tanstack/react-query';
import CreateSpace from './CreateSpace';
type Props = {};

const PageWrapper = async (props: Props) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect('/api/auth/signin');
  }
  const getSpaces = async () =>
    await prisma.space.findMany({
      where: {
        userId: session.user.id,
      },
    });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(['getSpaces'], getSpaces);
  const dehydratedState = dehydrate(queryClient);
  return (
    <div className="flex p-[30px] items-center justify-center  h-full overflow-y-scroll">
      <div className="w-4/5 h-full flex justify-start items-start flex-wrap space-y-5 space-x-5">
        <CreateSpace />
        <Hydrate state={dehydratedState}>
          <Spaces />
        </Hydrate>
      </div>
    </div>
  );
};

export default PageWrapper;
