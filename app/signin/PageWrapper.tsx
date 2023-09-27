import React from 'react';
import SignIn from './SignIn';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

type Props = {};

const PageWrapper = () => {
  const transform = authOptions.providers.find((p) => p.id === 'google')!;

  return <SignIn googleProvider={{ id: transform.id, name: transform.name }} />;
};

export default PageWrapper;
