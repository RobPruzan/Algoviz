'use client';
import React from 'react';
import { Button } from '../ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';

export const SignOutButton = () => {
  return (
    <Button className="bg-secondary" onClick={() => signOut()}>
      Sign Out
    </Button>
  );
};

export const SignInButton = () => {
  const session = useSession();

  if (session.status === 'loading') {
    return <>...</>;
  }

  if (session.status === 'authenticated') {
    return <SignOutButton />;
  }
  return (
    <Button className="bg-secondary" onClick={() => signIn()}>
      Sign In
    </Button>
  );
};
