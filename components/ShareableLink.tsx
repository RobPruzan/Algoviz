'use client';
import React from 'react';
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
import { usePathname } from 'next/navigation';
import CopyButton from './CopyButton';

const VISUALIZE_PATH = '/visualizer';

const ShareableLink = () => {
  const pathname = usePathname();

  return pathname === VISUALIZE_PATH ? (
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
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Edit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Read-only</Label>
            </div>
          </RadioGroup>
          <div className="grid grid-cols-4 items-center gap-4">
            {/* <Label htmlFor="username" className="text-right">
              Username
            </Label> */}
            {/* <Input id="username" value="@peduarte" className="col-span-3" /> */}

            <CopyButton copyText="" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="submit">
            Generate Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
};

export default ShareableLink;
