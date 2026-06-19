"use client";

import { useFetchService } from "@/app/api/api-client";
import ServiceFormSkeleton from "@/components/service/ServiceForm/Skeleton";
import ServicePlanEditor from "@/components/service/ServicePlanEditor";
import { ClientService, ClientServiceSection, ServicePlan } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export type ServiceDefaultMeta = {
  title: string;
  worshipLeader: string | null;
  preacher?: string | null;
  date: Date;
  sections?: ClientServiceSection[];
};

type ClientServiceFormPageProps = {
  serviceSlug: string | null;
  defaultMeta?: ServiceDefaultMeta;
};

export default function ClientServiceFormPage({
  serviceSlug,
  defaultMeta,
}: ClientServiceFormPageProps) {
  const router = useRouter();
  const { service } = useFetchService(serviceSlug);

  const handleSaved = (saved: ClientService) => {
    router.push(`/services/${saved.slug}`);
  };

  const isLoading = !service && serviceSlug;

  const defaultSections: ClientServiceSection[] = defaultMeta?.sections?.length
    ? defaultMeta.sections
    : [{ type: "CULTO", label: "Culto", order: 1, units: [] }];

  const defaultPlan: ServicePlan = { startTime: null, sections: defaultSections };

  const initialService: ClientService | null = service ?? (defaultMeta ? {
    slug: "",
    title: defaultMeta.title,
    worshipLeader: defaultMeta.worshipLeader,
    preacher: defaultMeta.preacher ?? null,
    date: defaultMeta.date,
    isDeleted: false,
    units: [],
    plan: defaultPlan,
  } : null);


  return (
    <Suspense>
      {isLoading && <ServiceFormSkeleton />}
      {!isLoading && initialService && (
        <ServicePlanEditor service={initialService} onSaved={handleSaved} />
      )}
    </Suspense>
  );
}
