import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { ArrangementFormSchema } from './schema';

type InfoFormProps = {
  form: UseFormReturn<ArrangementFormSchema>;
};

export default function InfoForm({ form }: InfoFormProps) {
  const t = useTranslations('SongData');
  return (
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary mb-0">{t('title')}</FormLabel>
            <FormControl>
              <Input placeholder={t('titlePlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="artist"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary">{t('artist')}</FormLabel>
            <FormControl>
              <Input placeholder={t('artistPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary">{t('key')}</FormLabel>
            <FormControl>
              <Input placeholder={t('keyPlaceholder')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
