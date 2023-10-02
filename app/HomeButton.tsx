'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {};

const HomeButton = (props: Props) => {
  const path = usePathname();

  const isHome = path === '/';
  return (
    <Link href="/" className="mr-2">
      <Button className={isHome ? 'bg-accent' : ''} variant="outline">
        Home
      </Button>
    </Link>
  );
};

export default HomeButton;
