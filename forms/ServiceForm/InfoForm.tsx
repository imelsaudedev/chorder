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
    <div className="flex-grow space-y-4 pb-4 md:pb-6 lg:pb-8">
      {/* Título */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-primary mb-2">{t('title')}</FormLabel>
            <FormControl>
              <Input placeholder={t('titlePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Grid para Data e Worship Leader */}
      <div className="flex flex-col md:flex-row gap-4 justify-start">
        {/* Data */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-0 w-full md:w-72">
              {' '}
              {/* Largura fixa */}
              <FormLabel className="text-primary mb-2">{t('date')}</FormLabel>
              <FormControl>
                <DatePicker
                  buttonProps={{ id: 'pickDate', className: 'w-full' }} // Largura responsiva
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

        {/* Worship Leader */}
        <FormField
          control={form.control}
          name="worshipLeader"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-0 w-full md:w-64">
              {' '}
              {/* Largura fixa */}
              <FormLabel className="text-primary mb-2">{t('worshipLeader')}</FormLabel>
              <FormControl>
                <Input placeholder={t('worshipLeaderPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
