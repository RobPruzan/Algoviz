import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SerializedPlayground } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Loader, LoaderIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { json } from 'stream/consumers';
import { z } from 'zod';

type Props = {
  playground: {
    userId: string;
    id: number;
    name: string;
  };
};

const Playground = ({ playground }: Props) => {
  const queryClient = useQueryClient();
  const deletePlaygroundMutation = useMutation({
    mutationFn: async (playgroundId: number) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const json = await ky
        .post(`${process.env.NEXT_PUBLIC_API_ROUTE}/playground/delete`, {
          json: {
            id: playgroundId,
          },
        })
        .json();
      const jsonSchema = z.object({
        playgroundId: z.number(),
      });
      return jsonSchema.parse(json).playgroundId;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedPlayground[]>(
        ['getPlaygrounds'],
        (playgrounds) =>
          playgrounds?.filter((playground) => playground.id !== data)
      );
    },
  });

  return (
    <Card className="w-72 h-64  flex items-center justify-center">
      <div className="w-[75%] h-full flex items-center justify-end">
        {playground.id}
        <Link href={`/visualizer?playground-id=${playground.id}`}>
          <Button variant={'outline'}>Join Playground</Button>
        </Link>
      </div>

      <div className="w-[25%] h-full flex flex-col items-end">
        <div className="h-1/5 w-full flex justify-end">
          <Button
            onClick={async () => {
              await deletePlaygroundMutation.mutateAsync(playground.id);
              queryClient.invalidateQueries(['getPlaygrounds']);
            }}
            variant={'ghost'}
          >
            {deletePlaygroundMutation.isLoading ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <Trash />
            )}
          </Button>
        </div>
        <div className="h-4/5 w-full"></div>
      </div>
    </Card>
  );
};

export default Playground;
