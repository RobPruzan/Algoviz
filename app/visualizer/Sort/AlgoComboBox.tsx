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

import { Algorithm } from '@prisma/client';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
  value: string | null;
  setValue: (value: string) => void;
  defaultPlaceholder: string;
  algorithms: (Omit<Algorithm, 'createdAt'> & { createdAt: string })[];
};

export function AlgoComboBox({
  setValue,
  value,
  defaultPlaceholder,
  algorithms,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={twMerge(
            'w-[125px] h-[30px] justify-between font-bold',
            className
          )}
        >
          {(value
            ? algorithms.find((a) => a.id === value)?.title
            : defaultPlaceholder ?? 'Select Algorithm'
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
