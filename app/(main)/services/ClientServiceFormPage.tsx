"use client";

import { useFetchService } from "@/app/api/api-client";
import ServiceFormSkeleton from "@/components/service/ServiceForm/Skeleton";
import ServicePlanEditor from "@/components/service/ServicePlanEditor";
import type { ServiceLeaderEntry } from "@/lib/service-leaders";
import { serviceProfile } from "@/lib/service-profile";
import { ClientService, ClientServiceSection, ServicePlan, ServiceScope } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export type ServiceDefaultMeta = {
  title: string;
  worshipLeader: string | null;
  leaders?: ServiceLeaderEntry[];
  preacher?: string | null;
  preacherId?: string | null;
  date: Date;
  sections?: ClientServiceSection[];
  scope?: ServiceScope;
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
    : [{ id: crypto.randomUUID(), ...serviceProfile(defaultMeta?.scope).defaultSection, order: 1, units: [] }];

  const defaultPlan: ServicePlan = { startTime: null, sections: defaultSections };

  const initialService: ClientService | null = service ?? (defaultMeta ? {
    slug: "",
    title: defaultMeta.title,
    worshipLeader: defaultMeta.worshipLeader,
    leaders: defaultMeta.leaders ?? [],
    preacher: defaultMeta.preacher ?? null,
    preacherId: defaultMeta.preacherId ?? null,
    date: defaultMeta.date,
    isDeleted: false,
    scope: defaultMeta.scope ?? "CHURCH",
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
