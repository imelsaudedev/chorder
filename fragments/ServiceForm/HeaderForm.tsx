import DatePicker from '@/components/DatePicker';
import FormField from '@/components/FormField';
import FormLabel from '@/components/FormLabel';
import TextInput from '@/components/TextInput';
import messages from '@/i18n/messages';
import { ChangeEvent } from 'react';

type HeaderFormProps = {
  title: string;
  setTitle: (newValue: string) => void;
  worshipLeader: string | null;
  setWorshipLeader: (newValue: string | null) => void;
  date: Date;
  setDate: (newValue: Date) => void;
};

export default function HeaderForm({
  title,
  setTitle,
  worshipLeader,
  setWorshipLeader,
  date,
  setDate,
}: HeaderFormProps) {
  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleChangeWorshipLeader = (event: ChangeEvent<HTMLInputElement>) => {
    setWorshipLeader(event.target.value);
  };

  const handleNewDate = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return (
    <div className="flex mx-4 gap-2">
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="title">
          {messages.songData.title}
        </FormLabel>
        <TextInput
          id="title"
          placeholder={messages.songData.titlePlaceholder}
          onChange={handleChangeTitle}
          defaultValue={title}
        />
      </FormField>
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
    </div>
  );
}
