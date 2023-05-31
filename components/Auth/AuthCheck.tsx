'use client';
import { useSession } from 'next-auth/react';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const AuthCheck = ({ children }: Props) => {
  // its get server session on server side
  const session = useSession();
  return (
    <div>
      {session.status === 'authenticated' ? (
        children
      ) : (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-4xl font-bold">Please Login</h1>
        </div>
      )}
    </div>
  );
};

export default AuthCheck;
