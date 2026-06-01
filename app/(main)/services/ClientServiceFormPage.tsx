"use client";

import { useFetchService } from "@/app/api/api-client";
import ServiceForm from "@/components/service/ServiceForm";
import ServiceFormSkeleton from "@/components/service/ServiceForm/Skeleton";
import { ServiceMeta } from "@/components/service/ServiceMetaModal";
import { ClientService } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

type ClientServiceFormPageProps = {
  serviceSlug: string | null;
  defaultMeta?: ServiceMeta;
};

export default function ClientServiceFormPage({
  serviceSlug,
  defaultMeta,
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
      {!isLoading && (
        <ServiceForm
          service={service ?? null}
          defaultMeta={defaultMeta}
          onSaved={handleSaved}
        />
      )}
    </Suspense>
  );
}
