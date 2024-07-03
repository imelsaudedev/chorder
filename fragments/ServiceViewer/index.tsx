'use client';

import { SerializedService, Service } from '@/models/service';
import { useRef, useState } from 'react';
import ServiceFormPage from '../ServiceFormPage';
import ServiceViewPage from '../ServiceViewPage';

type ServiceViewerProps = {
  service: SerializedService;
  initialWriteMode: boolean;
};

export default function ServiceViewer({ service: serializedService, initialWriteMode }: ServiceViewerProps) {
  const serviceRef = useRef(() => Service.deserialize(serializedService));
  const service = serviceRef.current();
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  if (writeMode) return <ServiceFormPage service={service} setWriteMode={setWriteMode} />;
  else return <ServiceViewPage service={service} setWriteMode={setWriteMode} />;
}
