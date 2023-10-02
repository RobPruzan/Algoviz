'use client';
import React from 'react';
import { Button } from '../ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';

export const SignOutButton = () => {
  return (
    <Button
      aria-label="sign-out"
      variant="outline"
      // className="bg-secondary"
      onClick={() => signOut()}
    >
      Sign Out
    </Button>
  );
};

export const SignInButton = () => {
  const session = useSession();

  if (session.status === 'loading') {
    return (
      <Button className="w-20" variant="outline">
        ...
      </Button>
    );
  }

  if (session.status === 'authenticated') {
    return <SignOutButton />;
  }
  return (
    <Button aria-label="sign-in" variant="outline" onClick={() => signIn()}>
      Sign In
    </Button>
  );
};
