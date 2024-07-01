import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import messages, { dateLocale } from '@/i18n/messages';

type DatePickerProps = {
  date: Date | undefined;
  setDate: (newDate: Date | undefined) => void;
  buttonProps?: React.ComponentProps<typeof Button>;
};

export default function DatePicker({ date, setDate, buttonProps }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...(buttonProps || {})}
          variant={'outline'}
          className={cn('w-[280px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: dateLocale }) : <span>{messages.messages.pickDate}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
