'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';

import ky from 'ky';
import { z } from 'zod';
import { getSpaces } from '@/lib/utils';
import { DeleteIcon, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Space from './Space';

const Spaces = () => {
  const spacesQuery = useQuery({
    queryKey: ['getSpaces'],
    queryFn: getSpaces,
  });

  return (
    <>
      {spacesQuery.data?.map((space) => (
        <Space key={space.id} space={space} />
      ))}
    </>
  );
};

export default Spaces;
