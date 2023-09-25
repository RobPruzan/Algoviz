'use client';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { ComponentProps } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
};

const PlaygroundsButton = ({ className }: Props) => {
  const session = useSession();
  return session.status === 'authenticated' ? (
    <Link href="/create">
      <Button className={twMerge(['mx-2', className])} variant="outline">
        Playgrounds
      </Button>
    </Link>
  ) : null;
};

export default PlaygroundsButton;
