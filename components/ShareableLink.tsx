'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Button } from './ui/button';
import { usePathname, useSearchParams } from 'next/navigation';
import CopyButton from './CopyButton';
import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
const VISUALIZE_PATH = '/visualizer';

const PERMISSIONS = ['EDIT', 'READ-ONLY'] as const;
type Permissions = (typeof PERMISSIONS)[number];

const isPermission = (value: string): value is Permissions => {
  return PERMISSIONS.some((p) => p === value);
};

const ShareableLink = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useSession();

  const [permissions, setPermissions] = useState<Permissions>('EDIT');

  const generateLinkMutation = useMutation({
    mutationFn: async (permission: string) => {
      const json = await (
        await ky.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/playground/link/create`,
          {
            json: {
              permission,
              roomId: searchParams.get('playground-id'),
            },
          }
        )
      ).json();
      const urlSchema = z.object({
        url: z.string(),
      });
      const { url } = urlSchema.parse(json);
      console.log('returned url', url);
      return url;
    },
    onError: (e) => {
      console.log('da error', e);
    },
  });

  return pathname === VISUALIZE_PATH &&
    session.status === 'authenticated' &&
    Boolean(searchParams.get('playground-id')) ? (
    <div className="mx-2 min-w-fit">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Generate Sharable Link</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Those with link can</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={permissions}
              onValueChange={(v) => {
                isPermission(v) && setPermissions(v);
              }}
              defaultValue="comfortable"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={'EDIT'} id="r1" />
                <Label htmlFor="r1">Edit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={'READ-ONLY'} id="r2" />
                <Label htmlFor="r2">Read-only</Label>
              </div>
            </RadioGroup>
            <div className="grid grid-cols-4 items-center gap-4">
              <CopyButton
                isLoading={generateLinkMutation.isLoading}
                copyText={generateLinkMutation.data ?? ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                console.log('clickin');
                generateLinkMutation.mutate(permissions);
              }}
              variant="outline"
              type="submit"
            >
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ) : null;
};

export default ShareableLink;
