import DatePicker from '@/components/DatePicker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormSchema } from './schema';
import { useTranslations } from 'next-intl';

type InfoFormProps = {
  form: UseFormReturn<ServiceFormSchema>;
};

export default function InfoForm({ form }: InfoFormProps) {
  const t = useTranslations('ServiceData');
  return (
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="worshipLeader"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-secondary mb-0">{t('worshipLeader')}</FormLabel>
            <FormControl>
              <Input placeholder={t('worshipLeaderPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-secondary mb-0">{t('date')}</FormLabel>
            <FormControl>
              <DatePicker
                buttonProps={{ id: 'pickDate' }}
                disabled={field.disabled}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-secondary mb-0">{t('title')}</FormLabel>
            <FormControl>
              <Input placeholder={t('titlePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
