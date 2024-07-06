'use client';

import { Service } from '@/models/service';
import { useState } from 'react';
import ServiceForm from '../../forms/ServiceForm';
import ServiceViewPage from '../ServiceViewPage';

type ServiceViewerProps = {
  service: Service;
  initialWriteMode: boolean;
};

export default function ServiceViewer({ service, initialWriteMode }: ServiceViewerProps) {
  const [writeMode, setWriteMode] = useState<boolean>(initialWriteMode);

  if (writeMode) return <ServiceForm service={service} setWriteMode={setWriteMode} />;
  else return <ServiceViewPage service={service} setWriteMode={setWriteMode} />;
}
