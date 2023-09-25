'use client';

import React from 'react';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
};

const AdminNav = ({ className }: Props) => {
  const session = useSession();

  return (
    session.data?.user.email === process.env.NEXT_PUBLIC_GOD_MODE && (
      <Link href="/admin">
        <Button className={twMerge(['mr-2', className])} variant="outline">
          Admin
        </Button>
      </Link>
    )
  );
};

export default AdminNav;
