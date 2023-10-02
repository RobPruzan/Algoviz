'use client';

import React from 'react';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
  className?: string;
};

const AdminNav = ({ className }: Props) => {
  const session = useSession();

  const path = usePathname();
  const isAdmin = path.split('/').includes('admin');

  return (
    session.data?.user.email === process.env.NEXT_PUBLIC_GOD_MODE && (
      <Link aria-label="admin" href="/admin">
        <Button
          className={twMerge([isAdmin ? 'mr-2 bg-accent' : 'mr-2', className])}
          variant="outline"
        >
          Admin
        </Button>
      </Link>
    )
  );
};

export default AdminNav;
