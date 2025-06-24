"use client";

import { ServiceWithUnits } from "@/prisma/models";
import { useRouter } from "next/navigation";
import ServiceForm from "../../ServiceForm";

export default function ClientServiceEditPage({
  service,
}: {
  service: ServiceWithUnits;
}) {
  const router = useRouter();

  const handleSaved = (service: ServiceWithUnits) => {
    router.push(`/services/${service.slug}`);
  };

  if (!service) {
    return null;
  }

  return <ServiceForm service={service} onSaved={handleSaved} />;
}
