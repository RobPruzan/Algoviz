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

type Props = {
  value: Algorithms | undefined;
  setValue: React.Dispatch<SetStateAction<SideBarContextState>>;
};

export const isStringAlgorithm = (s: string): s is Algorithms => {
  return ALGORITHMS.includes(s as Algorithms);
};

export function AlgoComboBox({ setValue, value }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between font-bold"
        >
          {value
            ? algorithmsInfo.find((framework) => framework.value === value)
                ?.label
            : 'Sorting Algorithm...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Sorting Algorithm..." />
          <CommandEmpty>No algorithm found.</CommandEmpty>
          <CommandGroup>
            {algorithmsInfo.map((framework) => (
              <CommandItem
                key={framework.value}
                onSelect={(currentValue) => {
                  if (!isStringAlgorithm(currentValue)) return;
                  // setValue(currentValue === value ? '' : currentValue);
                  setValue((prev) => ({ ...prev, algorithm: currentValue }));
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === framework.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
