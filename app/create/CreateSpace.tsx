'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SerializedSpace } from '@/lib/types';
import { serializedSpaceSchema } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';
import { z } from 'zod';

const CreateSpace = () => {
  const queryClient = useQueryClient();

  const createSpaceMutation = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const json = await ky
        .post(`${process.env.NEXT_PUBLIC_API_ROUTE}/space/create`)
        .json();

      const resSpaceSchema = z.object({
        space: serializedSpaceSchema,
      });

      console.log('incoming json', json);

      return resSpaceSchema.parse(json);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedSpace[]>(['getSpaces'], (spaces) =>
        spaces ? [data.space, ...spaces] : spaces
      );
    },
    // onSuccess: (data) => {
    //   queryClient.setQueryData(['getSpaces'], (spaces) => {});
    // },
  });
  return (
    <>
      <Card className="w-72 h-64 ml-5 mt-5 border-dashed flex items-center justify-center">
        <Button
          disabled={createSpaceMutation.isLoading}
          onClick={async () => {
            await createSpaceMutation.mutateAsync();
            // queryClient.invalidateQueries(['getSpaces']);
          }}
          variant="outline"
          className="flex items-center justify-evenly w-40"
        >
          <Plus size={20} />
          Create Space
        </Button>

        <div className="bg-gray-800 h-1/4"></div>
      </Card>
      {createSpaceMutation.isLoading && (
        <Card className="w-72 h-64 ml-5 mt-5 animate-pulse" />
      )}
      {/* <Button
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

      <div className="bg-gray-800 h-1/4"></div> */}
      {/* </Card> */}
    </>
  );
};

export default CreateSpace;
