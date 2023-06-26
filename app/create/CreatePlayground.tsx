'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SerializedPlayground } from '@/lib/types';
import { serializedPlaygroundSchema } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React from 'react';
import { z } from 'zod';

const CreatePlayground = () => {
  const queryClient = useQueryClient();

  const createPlaygroundMutation = useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const json = await ky
        .post(`${process.env.NEXT_PUBLIC_API_ROUTE}/playground/create`)
        .json();

      const resPlaygroundSchema = z.object({
        playground: serializedPlaygroundSchema,
      });

      return resPlaygroundSchema.parse(json);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedPlayground[]>(
        ['getPlaygrounds'],
        (playground) =>
          playground ? [data.playground, ...playground] : playground
      );
    },
    // onSuccess: (data) => {
    //   queryClient.setQueryData(['getPlaygrounds'], (spaces) => {});
    // },
  });
  return (
    <>
      <Card className="w-72 h-64 ml-5 mt-5 border-dashed flex items-center justify-center">
        <Button
          disabled={createPlaygroundMutation.isLoading}
          onClick={async () => {
            await createPlaygroundMutation.mutateAsync();
            // queryClient.invalidateQueries(['getPlaygrounds']);
          }}
          variant="outline"
          className="flex items-center justify-evenly w-48"
        >
          <Plus size={20} />
          Create Playground
        </Button>

        <div className="bg-gray-800 h-1/4"></div>
      </Card>
      {createPlaygroundMutation.isLoading && (
        <Card className="w-72 h-64 ml-5 mt-5 animate-pulse" />
      )}
    </>
  );
};

export default CreatePlayground;
