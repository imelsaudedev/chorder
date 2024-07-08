'use client';

import { RequiredIsNew, Service, ServiceWith } from '@/models/service';
import { OptionalSlug } from '@/models/song';
import { useState } from 'react';
import ServiceForm from '../../forms/ServiceForm';
import ServiceViewPage from '../ServiceViewPage';

type ServiceViewerProps = {
  service: ServiceWith<OptionalSlug & RequiredIsNew>;
  initialWriteMode: boolean;
};

export default function ServiceViewer({ service, initialWriteMode }: ServiceViewerProps) {
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  if (writeMode) return <ServiceForm service={service} setWriteMode={setWriteMode} />;
  else if (service.slug) return <ServiceViewPage service={service as Service} setWriteMode={setWriteMode} />;
}
