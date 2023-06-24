import Spaces from './Spaces';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageWrapper from './PageWrapper';
import getQueryClient from '@/lib/getQueryClient';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
const page = () => {
  return (
    <>
      <PageWrapper />
    </>
  );
};

export default page;
