import DatePicker from '@/components/DatePicker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import messages from '@/i18n/messages';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormSchema } from './schema';

type InfoFormProps = {
  form: UseFormReturn<ServiceFormSchema>;
};

export default function InfoForm({ form }: InfoFormProps) {
  return (
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="worshipLeader"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-secondary mb-0">{messages.serviceData.worshipLeader}</FormLabel>
            <FormControl>
              <Input placeholder={messages.serviceData.worshipLeaderPlaceholder} {...field} />
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
            <FormLabel className="text-secondary mb-0">{messages.serviceData.date}</FormLabel>
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
            <FormLabel className="text-secondary mb-0">{messages.serviceData.title}</FormLabel>
            <FormControl>
              <Input placeholder={messages.serviceData.titlePlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
