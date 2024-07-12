import { ServiceFormSchema } from '@/forms/ServiceForm/schema';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { ControllerRenderProps } from 'react-hook-form';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type DatePickerProps = {
  buttonProps?: React.ComponentProps<typeof Button>;
} & Omit<ControllerRenderProps<ServiceFormSchema, 'date'>, 'ref'>;

export default function DatePicker({ buttonProps, value, disabled, onChange }: DatePickerProps) {
  const t = useTranslations('Messages');
  const format = useFormatter();
  const formattedDate = value ? (
    format.dateTime(value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  ) : (
    <span>{t('pickDate')}</span>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...(buttonProps || {})}
          variant={'outline'}
          className={cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar selected={value} onSelect={onChange} mode="single" disabled={disabled} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
