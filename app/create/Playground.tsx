'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SerializedPlayground } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky from 'ky';
import { Edit, Loader, LoaderIcon, Trash } from 'lucide-react';
import Link from 'next/link';
import React, { ComponentProps, useState } from 'react';
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
import axios from 'axios';
type Props = {
  playground: {
    userId: string;
    id: number;
    name: string;
  };
} & ComponentProps<typeof Card>;

const Playground = ({ playground, ...props }: Props) => {
  const queryClient = useQueryClient();
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [newPlaygroundName, setNewPlaygroundName] = useState<string>();
  const [hoveringActionButton, setHoveringActionButton] = useState(false);
  const deletePlaygroundMutation = useMutation({
    mutationFn: async (playgroundId: number) => {
      console.log('deleting playground', playgroundId);
      const json = (
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/playground/delete`,
          {
            id: playgroundId,
          }
        )
      ).data;
      console.log('da json', json);
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
    onError: (e) => {
      console.log('goo ga', e);
    },
  });

  const editPlaygroundMutation = useMutation({
    mutationFn: async ({
      name,
      playgroundId,
    }: {
      playgroundId: number;
      name: string;
    }) => {
      const playground = (
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/playground/edit`,
          {
            id: playgroundId,
            name,
          }
        )
      ).data;

      console.log('responded json', playground);

      const playgroundSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      return playgroundSchema.parse(playground);
    },
    onSuccess: (data) => {
      queryClient.setQueryData<SerializedPlayground[]>(
        ['getPlaygrounds'],
        (playgrounds) =>
          playgrounds?.map((playground) => {
            if (playground.id === data.id) {
              return { ...playground, ...data };
            }
            return playground;
          })
      );
    },
  });

  return (
    <Link href={`/visualizer?playground-id=${playground.id}`}>
      <Card
        {...props}
        className={`w-72 h-64  flex items-center justify-center ${
          hoveringActionButton ? '' : 'hover:bg-secondary'
        }  cursor:pointer`}
      >
        <div className="w-[75%] h-full flex items-start justify-start ">
          <p className="m-5 font-bold text-2xl"> {playground.name}</p>
        </div>

        <div className="w-[25%] h-full flex flex-col items-end">
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="h-1/5 w-1/2 flex justify-end"
          >
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
              <DialogTrigger asChild>
                <Button
                  onMouseLeave={() => {
                    setHoveringActionButton(false);
                  }}
                  onMouseEnter={() => {
                    setHoveringActionButton(true);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDelete(true);
                  }}
                  variant={'ghost'}
                >
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
                    onClick={async (e) => {
                      // e.stopPropagation();
                      await deletePlaygroundMutation.mutateAsync(playground.id);
                      queryClient.invalidateQueries(['getPlaygrounds']);
                      setOpenDelete(false);
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
                  onMouseLeave={() => {
                    setHoveringActionButton(false);
                  }}
                  onMouseEnter={() => {
                    setHoveringActionButton(true);
                  }}
                  onClick={() => {
                    setOpenEdit(true);
                  }}
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
                    onChange={(e) => {
                      setNewPlaygroundName(e.target.value);
                    }}
                    value={newPlaygroundName ?? playground.name}
                    id="name"
                    className="col-span-3"
                  />
                </div>

                <DialogFooter>
                  <Button
                    onClick={async () => {
                      if (!newPlaygroundName) return;
                      await editPlaygroundMutation.mutateAsync({
                        playgroundId: playground.id,
                        name: newPlaygroundName,
                      });
                      setNewPlaygroundName(undefined);
                      setOpenEdit(false);
                    }}
                    variant="outline"
                    type="submit"
                  >
                    {editPlaygroundMutation.isLoading ? (
                      <>
                        <LoaderIcon className="animate-spin" />
                      </>
                    ) : (
                      <>Confirm Edit</>
                    )}
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
