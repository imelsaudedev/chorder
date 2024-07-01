'use client';

import useService from '@/hooks/useService';
import { SerializedService, Service } from '@/models/service';
import { useMemo, useState } from 'react';
import ServiceForm from '../ServiceForm';

type ServiceViewerProps = {
  service: SerializedService;
  initialWriteMode: boolean;
};

export default function ServiceViewer({ service: serializedService, initialWriteMode }: ServiceViewerProps) {
  const service = useMemo(() => Service.deserialize(serializedService), [serializedService]);
  const serviceData = useService(service);
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  if (writeMode) return <ServiceForm serviceData={serviceData} setWriteMode={setWriteMode} />;
  else return null;
}
