'use client';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

type Props = {};

const PlaygroundsButton = (props: Props) => {
  const session = useSession();
  return session.status === 'authenticated' ? (
    <Link href="/create">
      <Button className="mx-2" variant="outline">
        Playgrounds
      </Button>
    </Link>
  ) : null;
};

export default PlaygroundsButton;
