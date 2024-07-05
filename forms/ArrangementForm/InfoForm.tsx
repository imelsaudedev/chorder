import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import messages from '@/i18n/messages';
import { UseFormReturn } from 'react-hook-form';
import { ArrangementFormSchema } from './schema';

type InfoFormProps = {
  form: UseFormReturn<ArrangementFormSchema>;
};

export default function InfoForm({ form }: InfoFormProps) {
  return (
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary mb-0">{messages.songData.title}</FormLabel>
            <FormControl>
              <Input placeholder={messages.songData.titlePlaceholder} {...field} />
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
            <FormLabel className="text-secondary">{messages.songData.artist}</FormLabel>
            <FormControl>
              <Input placeholder={messages.songData.artistPlaceholder} {...field} />
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
            <FormLabel className="text-secondary">{messages.songData.key}</FormLabel>
            <FormControl>
              <Input placeholder={messages.songData.keyPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
