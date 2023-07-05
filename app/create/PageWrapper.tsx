import React from 'react';
import Playgrounds from './Playgrounds';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import getQueryClient from '@/lib/getQueryClient';
import { Hydrate, dehydrate } from '@tanstack/react-query';
import CreatePlayground from './CreatePlayground';
type Props = {};

const PageWrapper = async (props: Props) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect('/api/auth/signin');
  }
  const getPlaygrounds = async () =>
    await prisma.playground.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(['getPlaygrounds'], getPlaygrounds);
  const dehydratedState = dehydrate(queryClient);
  return (
    <div className="flex p-[30px] items-center justify-center  h-full overflow-y-scroll">
      <div className="w-[90%] h-full flex md:justify-start md:items-start flex-wrap space-y-5 space-x-5 items-center justify-center">
        <CreatePlayground />
        <Hydrate state={dehydratedState}>
          <Playgrounds />
        </Hydrate>
      </div>
    </div>
  );
};

export default PageWrapper;
