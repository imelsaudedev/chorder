"use client";

import { useFetchServices } from "#api-client";
import ServiceList from "@/components/service/ServiceList";

export default function ClientServiceList() {
  const { services, isLoading } = useFetchServices();
  if (!services || isLoading) {
    return null;
  }
  return <ServiceList services={services} />;
}
