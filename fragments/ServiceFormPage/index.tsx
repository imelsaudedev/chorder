import Main from '@/components/Main';
import SaveButtonSet from '@/components/SaveButtonSet';
import { Service } from '@/models/service';
import { Dispatch, SetStateAction, useState } from 'react';
import HeaderForm from './HeaderForm';
import ServiceForm from './ServiceForm';
import { postService } from '@/app/services/[service]/actions';

type SongFormProps = {
  service: Service;
  setWriteMode: Dispatch<SetStateAction<boolean>>;
};

export default function ServiceFormPage({ service, setWriteMode }: SongFormProps) {
  const [serializedService, setSerializedService] = useState(service.serialize());
  const submitService = postService.bind(null, serializedService);
  const updateService = () => {
    setSerializedService(service.serialize());
  };

  return (
    <form action={submitService}>
      <div>
        <HeaderForm service={service} updateService={updateService} />
        <SaveButtonSet canCancel={!service.isNew} enabled={service.isValid} setWriteMode={setWriteMode} />
      </div>
      <Main>
        <ServiceForm service={service} updateService={updateService} />
      </Main>
    </form>
  );
}
