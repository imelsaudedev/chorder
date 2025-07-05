"use client";

import ServiceForm from "@/components/service/ServiceForm";
import { ClientService } from "@/prisma/models";
import { useRouter } from "next/navigation";

export default function ClientServiceEditPage({
  service,
}: {
  service: ClientService;
}) {
  const router = useRouter();

  const handleSaved = (service: ClientService) => {
    router.push(`/services/${service.slug}`);
  };

  if (!service) {
    return null;
  }

  return <ServiceForm service={service} onSaved={handleSaved} />;
}
