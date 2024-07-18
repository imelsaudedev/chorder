'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';

type ComboBoxItem = {
  label: string;
  value: string;
};

type ComboBoxResponsiveProps = {
  value: string;
  options: ComboBoxItem[];
  label?: string;
  className?: string;
  id?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  hideCurrentValue?: boolean;
};

export function ComboBoxResponsive({
  value,
  options,
  className,
  id,
  onChange,
  placeholder,
  hideCurrentValue,
}: ComboBoxResponsiveProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedItem, setSelectedItem] = useState<string>(value);
  const selectedLabel = useMemo(
    () => options.find((option) => option.value === selectedItem)?.label,
    [options, selectedItem]
  );

  const handleChange = useCallback(
    (value: string) => {
      setSelectedItem(value);
      setOpen(false);
      if (onChange) {
        onChange(value);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (value !== selectedItem) {
      setSelectedItem(value);
    }
  }, [value, selectedItem]);

  const buttonClassName = ['min-w-[150px]', 'justify-between', className].filter(Boolean).join(' ');

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={buttonClassName} id={id}>
            {selectedLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ItemList
            options={options}
            onChange={handleChange}
            placeholder={placeholder}
            selectedValue={selectedItem}
            hideCurrentValue={hideCurrentValue}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className={buttonClassName} id={id}>
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <ItemList
            options={options}
            onChange={handleChange}
            placeholder={placeholder}
            selectedValue={selectedItem}
            hideCurrentValue={hideCurrentValue}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ItemList({
  options,
  selectedValue,
  hideCurrentValue,
  onChange,
  placeholder,
}: {
  options: ComboBoxItem[];
  selectedValue?: string;
  hideCurrentValue?: boolean;
  onChange: (item: string) => void;
  placeholder: string;
}) {
  const filteredOptions = useMemo(
    () => options.filter((option) => hideCurrentValue && option.value !== selectedValue),
    [hideCurrentValue, options, selectedValue]
  );
  return (
    <Command>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {filteredOptions.map((option) => (
            <CommandItem
              key={option.value}
              value={option.label}
              onSelect={() => {
                onChange(option.value);
              }}
            >
              {option.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
