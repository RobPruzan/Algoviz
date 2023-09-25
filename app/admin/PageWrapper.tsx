'use client';
import React from 'react';
import ContentWrapper from '../visualizer/ContentWrapper';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

type Props = {};

const PageWrapper = (props: Props) => {
  const session = useSession();
  const { toast } = useToast();
  const router = useRouter();
  if (session.data?.user.email !== process.env.NEXT_PUBLIC_GOD_MODE) {
    toast({
      title: 'Non god detected',
      description: 'Non-gods cannot enter, you have been yoinked',
    });
    // redirect('/');
    router.push('/');
  }
  return <ContentWrapper data={null} />;
};

export default PageWrapper;
