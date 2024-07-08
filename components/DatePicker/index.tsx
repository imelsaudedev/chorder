import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import messages, { dateLocale } from '@/i18n/messages';
import { ControllerRenderProps } from 'react-hook-form';
import { ServiceFormSchema } from '@/forms/ServiceForm/schema';

type DatePickerProps = {
  buttonProps?: React.ComponentProps<typeof Button>;
} & Omit<ControllerRenderProps<ServiceFormSchema, 'date'>, 'ref'>;

export default function DatePicker({ buttonProps, value, disabled, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...(buttonProps || {})}
          variant={'outline'}
          className={cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP', { locale: dateLocale }) : <span>{messages.messages.pickDate}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar selected={value} onSelect={onChange} mode="single" disabled={disabled} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
