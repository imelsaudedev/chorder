"use client";

import { useFetchService } from "#api-client";
import Main from "@/components/common/Main";
import ServiceConfigProvider, {
  useServiceConfig,
} from "@/components/config/ServiceConfig";
import ServiceHeader from "@/components/service/ServiceHeader";
import ServiceView from "@/components/service/ServiceView";

type ClientPageProps = { serviceSlug: string };
export default function ClientPage({ serviceSlug }: ClientPageProps) {
  const { service } = useFetchService(serviceSlug);

  return (
    <ServiceConfigProvider>
      <ServiceHeader service={service} />
      <MainWithDensity>
        <ServiceView service={service} />
      </MainWithDensity>
    </ServiceConfigProvider>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useServiceConfig();

  return (
    <Main density={density} className="py-4 sm:py-6 lg:py-8">
      {children}
    </Main>
  );
}
