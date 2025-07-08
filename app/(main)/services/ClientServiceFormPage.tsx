"use client";

import { useFetchService } from "@/app/api/api-client";
import ServiceForm from "@/components/service/ServiceForm";
import ServiceFormSkeleton from "@/components/service/ServiceForm/Skeleton";
import { ClientService } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

type ClientServiceFormPageProps = {
  serviceSlug: string | null;
};
export default function ClientServiceFormPage({
  serviceSlug,
}: ClientServiceFormPageProps) {
  const router = useRouter();
  const { service } = useFetchService(serviceSlug);

  const handleSaved = (service: ClientService) => {
    router.push(`/services/${service.slug}`);
  };

  const isLoading = !service && serviceSlug;
  return (
    <Suspense>
      {isLoading && <ServiceFormSkeleton />}
      {!isLoading && <ServiceForm service={service} onSaved={handleSaved} />}
    </Suspense>
  );
}
