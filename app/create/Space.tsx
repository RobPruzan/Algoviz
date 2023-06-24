import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SerializedSpace } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Loader, LoaderIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { json } from 'stream/consumers';
import { z } from 'zod';

type Props = {
  space: SerializedSpace;
};

const Space = ({ space }: Props) => {
  const queryClient = useQueryClient();
  const deleteSpaceMutation = useMutation({
    mutationFn: async (spaceId: number) => {
      const json = await ky
        .delete(`${process.env.NEXT_PUBLIC_API_ROUTE}/space/delete`, {
          json: {
            id: spaceId,
          },
        })
        .json();
      const jsonSchema = z.object({
        spaceId: z.number(),
      });
      return jsonSchema.parse(json).spaceId;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedSpace[]>(['getSpaces'], (spaces) =>
        spaces?.filter((space) => space.id !== data)
      );
    },
  });

  return (
    <Card className="w-72 h-64  flex items-center justify-center">
      <div className="w-[70%] h-full flex items-center justify-end">
        {space.id}
        <Link href={`/visualizer?space-id=${space.id}`}>
          <Button variant={'outline'}>Join Space</Button>
        </Link>
      </div>
      <div className="w-[10%] h-full " />
      <div className="w-1/5 h-full flex flex-col">
        <div className="h-1/5 w-full">
          <Button
            onClick={async () => {
              await deleteSpaceMutation.mutateAsync(space.id);
              queryClient.invalidateQueries(['getSpaces']);
            }}
            variant={'ghost'}
          >
            {deleteSpaceMutation.isLoading ? (
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

export default Space;
