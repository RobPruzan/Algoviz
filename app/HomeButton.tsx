'use client';
import { Button } from '@/components/ui/button';
import { useGetPresets } from '@/hooks/useGetPresets';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';
import { twMerge } from 'tailwind-merge';

type Props = {};

const HomeButton = (props: Props) => {
  const path = usePathname();

  // temporary location to prefetch queries
  const getPresetsQuery = useGetPresets();
  const isHome = path === '/';
  return (
    <Link aria-label="home-button" href="/" className="mr-2">
      <Button className={isHome ? 'bg-accent' : ''} variant="outline">
        Home
      </Button>
    </Link>
  );
};

export default HomeButton;
