import DatePicker from '@/components/DatePicker';
import messages from '@/i18n/messages';
import { Service } from '@/models/service';
import { ChangeEvent, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ServiceFormSchema } from './schema';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type InfoFormProps = {
  form: UseFormReturn<ServiceFormSchema>;
};

export default function InfoForm({ form }: InfoFormProps) {
  return (
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-0">
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
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary mb-0">{messages.serviceData.date}</FormLabel>
            <FormControl>
              <DatePicker {...field} buttonProps={{ id: 'pickDate' }} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-0">
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

function useTitle(service: Service, updateService: () => void) {
  const [title, setTitle] = useState(service.title);
  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    service.title = newTitle;
    updateService();
  };
  return { title, handleChangeTitle };
}

function useWorshipLeader(service: Service, updateService: () => void) {
  const [worshipLeader, setWorshipLeader] = useState(service.worshipLeader);
  const handleChangeWorshipLeader = (event: ChangeEvent<HTMLInputElement>) => {
    const newWorshipLeader = event.target.value;
    setWorshipLeader(newWorshipLeader);
    service.worshipLeader = newWorshipLeader;
    updateService();
  };
  return { worshipLeader, handleChangeWorshipLeader };
}

function useDate(service: Service, updateService: () => void) {
  const [date, setDate] = useState(service.date);
  const handleNewDate = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      service.date = newDate;
      updateService();
    }
  };
  return { date, handleNewDate };
}
