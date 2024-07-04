import DatePicker from '@/components/DatePicker';
import FormField from '@/components/FormField';
import FormLabel from '@/components/FormLabel';
import TextInput from '@/components/TextInput';
import messages from '@/i18n/messages';
import { Service } from '@/models/service';
import { ChangeEvent, useState } from 'react';

type HeaderFormProps = {
  service: Service;
  updateService: () => void;
};

export default function HeaderForm({ service, updateService }: HeaderFormProps) {
  const { title, handleChangeTitle } = useTitle(service, updateService);
  const { worshipLeader, handleChangeWorshipLeader } = useWorshipLeader(service, updateService);
  const { date, handleNewDate } = useDate(service, updateService);

  return (
    <div className="flex mx-4 gap-2">
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="worshipLeader">
          {messages.serviceData.worshipLeader}
        </FormLabel>
        <TextInput
          id="worshipLeader"
          placeholder={messages.serviceData.worshipLeaderPlaceholder}
          onChange={handleChangeWorshipLeader}
          defaultValue={worshipLeader || ''}
        />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="pickDate">
          {messages.serviceData.date}
        </FormLabel>
        <DatePicker date={date} setDate={handleNewDate} buttonProps={{ id: 'pickDate' }} />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="title">
          {messages.serviceData.title}
        </FormLabel>
        <TextInput
          id="title"
          placeholder={messages.serviceData.titlePlaceholder}
          onChange={handleChangeTitle}
          defaultValue={title}
        />
      </FormField>
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
