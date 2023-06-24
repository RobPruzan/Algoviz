'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';
import { z } from 'zod';

const CreateSpace = () => {
  const createSpaceMutation = useMutation({
    mutationFn: async () => {
      const json = await ky
        .post(`${process.env.NEXT_PUBLIC_API_ROUTE}/space/create`)
        .json();
      const createSpaceSchema = z.object({
        spaceId: z.number(),
      });
      return createSpaceSchema.parse(json).spaceId;
    },
  });
  const queryClient = useQueryClient();
  return (
    <Card className="w-72 h-64 ml-5 mt-5 border-dashed flex items-center justify-center">
      <Button
        onClick={async () => {
          await createSpaceMutation.mutateAsync();
          queryClient.invalidateQueries(['getSpaces']);
        }}
        variant="outline"
        className="flex items-center justify-evenly w-40"
      >
        <Plus size={20} />
        Create Space
      </Button>

      <div className="bg-gray-800 h-1/4"></div>
    </Card>
  );
};

export default CreateSpace;
