import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SerializedPlayground } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Edit, Loader, LoaderIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { json } from 'stream/consumers';
import { z } from 'zod';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
type Props = {
  playground: {
    userId: string;
    id: number;
    name: string;
  };
};

const Playground = ({ playground }: Props) => {
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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
    <Link href={`/visualizer?playground-id=${playground.id}`}>
      <Card className="w-72 h-64  flex items-center justify-center hover:bg-secondary cursor:pointer">
        <div className="w-[75%] h-full flex items-start justify-start ">
          <p className="m-5 font-bold text-2xl"> {playground.name}</p>
        </div>

        <div className="w-[25%] h-full flex flex-col items-end">
          <div className="h-1/5 w-1/2 flex justify-end">
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger onClick={() => console.log('dete')} asChild>
                <Button onClick={(e) => e.preventDefault()} variant={'ghost'}>
                  <Trash />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this playground?
                  </DialogTitle>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    onClick={async () => {
                      await deletePlaygroundMutation.mutateAsync(playground.id);
                      queryClient.invalidateQueries(['getPlaygrounds']);
                    }}
                    variant="outline"
                    type="submit"
                  >
                    {deletePlaygroundMutation.isLoading ? (
                      <LoaderIcon className="animate-spin" />
                    ) : (
                      <>Confirm Delete</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
              <DialogTrigger asChild>
                <Button
                  onClick={(e) => e.preventDefault()}
                  size={'icon'}
                  variant={'ghost'}
                >
                  <Edit className="mx-2" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit the playground</DialogTitle>
                  <DialogDescription>
                    {
                      'Enter the information about your algorithm. Click confirm save when done.'
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    value={playground.name}
                    id="name"
                    className="col-span-3"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" type="submit">
                    Confirm Edit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="h-4/5 w-full"></div>
        </div>
      </Card>
    </Link>
  );
};

export default Playground;
