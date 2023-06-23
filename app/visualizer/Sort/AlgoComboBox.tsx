'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { algorithmsInfo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SetStateAction, useState } from 'react';
import {
  ALGORITHMS,
  AlgorithmInfo,
  Algorithms,
  SideBarContextState,
} from '@/lib/types';
import { Algorithm } from '@prisma/client';

type Props = {
  value: string | undefined;
  setValue: React.Dispatch<SetStateAction<string | undefined>>;
  defaultPlaceholder: string;
  algorithms: (Omit<Algorithm, 'createdAt'> & { createdAt: string })[];
};

export const isStringAlgorithm = (s: string): s is Algorithms => {
  return ALGORITHMS.includes(s as Algorithms);
};

export function AlgoComboBox({
  setValue,
  value,
  defaultPlaceholder,
  algorithms,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[125px]  bg-primary h-[30px] justify-between font-bold"
        >
          {(value
            ? algorithms.find((a) => a.id === value)?.title
            : defaultPlaceholder
          )?.slice(0, 8)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Sorting Algorithm..." />
          <CommandEmpty>No algorithm found.</CommandEmpty>
          <CommandGroup className="max-h-[350px] overflow-y-scroll">
            {algorithms.map((algo) => (
              <CommandItem
                key={algo.id}
                onSelect={(currentValue) => {
                  // if (!isStringAlgorithm(currentValue)) return;
                  // setValue(currentValue === value ? '' : currentValue);
                  setValue(algo.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === algo.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {algo.title.slice(0, 8)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
