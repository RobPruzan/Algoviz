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
import { Dispatch, SetStateAction } from 'react';
import { Languages, languages } from '@/lib/language-snippets';

type Props = {
  // const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState('');
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  value: Languages;
  onSelect?: ((value: Languages) => void) | undefined;
};

export function LanguageComboBox({ open, setOpen, onSelect, value }: Props) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          // disabled
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] h-[30px] justify-between font-bold"
        >
          {value
            ? languages.find((language) => language.value === value)?.label
            : 'Language'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[175px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup className="max-h-[350px] overflow-y-scroll">
            {languages.map((language) => (
              <CommandItem
                key={language.value}
                onSelect={(sel) => onSelect?.(sel as Languages)}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value === language.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
