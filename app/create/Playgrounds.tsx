'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';

import ky from 'ky';
import { z } from 'zod';
import { getPlaygrounds } from '@/lib/utils';
import { DeleteIcon, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Playground from './Playground';

const Playgrounds = () => {
  const playgroundsQuery = useQuery({
    queryKey: ['getPlaygrounds'],
    queryFn: getPlaygrounds,
  });

  return (
    <>
      {playgroundsQuery.data?.map((playground) => (
        <Playground key={playground.id} playground={playground} />
      ))}
    </>
  );
};

export default Playgrounds;
