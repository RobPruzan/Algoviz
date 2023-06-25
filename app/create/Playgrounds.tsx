'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlaygrounds } from '@/lib/utils';
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
