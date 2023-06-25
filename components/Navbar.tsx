'use client';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import ShareableLink from './ShareableLink';
import { ModeToggle } from './ui/mode-toggle';
import { SignInButton } from './Auth/AuthButtons';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

type Props = {};

const NavBar = (props: Props) => {
  const session = useSession();
  const pathname = usePathname();

  return (
    <nav className="w-screen pt-[10px] h-[15%] flex justify-end items-center px-[30px] ">
      <div className="w-3/6 flex justify-start items-center ">
        <Link href="/">
          <Button className="mr-2" variant="outline">
            Home
          </Button>
        </Link>
        {/* should make these proper protected routes */}
        {session.status === 'authenticated' && (
          <Link href="/create">
            <Button className="mx-2" variant="outline">
              Playgrounds
            </Button>
          </Link>
        )}
      </div>

      <div className="w-2/6  " />

      <div className="w-2/5 flex justify-end items-center">
        {/* {pathname === VISUALIZE_PATH && session.status === 'authenticated'}{' '} */}
        {
          <div className="mx-2 min-w-fit">
            <ShareableLink />
          </div>
        }
        <div className="mx-2">
          <ModeToggle />
        </div>
        <div className="ml-2">
          <SignInButton />
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
