'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
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
import { ALGORITHMS, AlgorithmInfo, Algorithms } from '@/lib/types';

const algorithmsInfo: AlgorithmInfo[] = [
  {
    value: 'merge sort',
    label: 'Merge Sort',
  },
  {
    value: 'quick sort',
    label: 'Quick Sort',
  },
];

type Props = {
  value: Algorithms | undefined;
  setValue: React.Dispatch<SetStateAction<Algorithms | undefined>>;
};

export const isStringAlgorithm = (s: string): s is Algorithms => {
  console.log('da string', s, ALGORITHMS.includes(s as Algorithms));
  return ALGORITHMS.includes(s as Algorithms);
};

export function AlgoComboBox({ setValue, value }: Props) {
  const [open, setOpen] = useState(false);
  console.log('the value', value);
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
                  console.log('currentValue', currentValue);
                  if (!isStringAlgorithm(currentValue)) return;
                  // setValue(currentValue === value ? '' : currentValue);
                  setValue(currentValue);
                  console.log('set value to', currentValue);
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
