'use client';

import { RequiredIsNew, Service, ServiceWith } from '@/models/service';
import { OptionalSlug } from '@/models/song';
import ServiceForm from '../../forms/ServiceForm';
import ServiceViewPage from '../ServiceViewPage';

type ServiceViewerProps = {
  service: ServiceWith<OptionalSlug & RequiredIsNew>;
  writeMode: boolean;
};

export default function ServiceViewer({ service, writeMode }: ServiceViewerProps) {
  if (writeMode) return <ServiceForm service={service} />;
  else if (service.slug) return <ServiceViewPage service={service as Service} />;
}
