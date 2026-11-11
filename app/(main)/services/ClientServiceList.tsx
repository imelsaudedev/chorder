"use client";

import { useFetchServicesList } from "#api-client";
import ServiceList from "@/components/service/ServiceList";

export default function ClientServiceList() {
  const { services, isLoading } = useFetchServicesList();
  if (!services || isLoading) {
    return null;
  }
  return <ServiceList services={services} />;
}
