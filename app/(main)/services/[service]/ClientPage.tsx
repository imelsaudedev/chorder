"use client";

import { useFetchService } from "#api-client";
import Main from "@/components/common/Main";
import ServiceConfigProvider, {
  useServiceConfig,
} from "@/components/config/ServiceConfig";
import ServiceHeader from "@/components/service/ServiceHeader";
import ServiceLiturgyView from "@/components/service/ServiceLiturgyView";
import ServiceView from "@/components/service/ServiceView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ClientPageProps = { serviceSlug: string };
export default function ClientPage({ serviceSlug }: ClientPageProps) {
  const { service } = useFetchService(serviceSlug);

  return (
    <ServiceConfigProvider>
      <div className="fullscreen-hidden">
        <ServiceHeader service={service} />
      </div>

      <Tabs defaultValue="liturgia" className="flex flex-col gap-0">
        <div className="fullscreen-hidden bg-zinc-50 border-b border-border px-4 sm:px-5 lg:px-8 pt-2 flex items-end">
          <TabsList className="bg-transparent h-auto p-0 gap-0.5 rounded-none items-end">
            <TabsTrigger
              value="liturgia"
              className="cursor-pointer h-auto flex-none rounded-t-md rounded-b-none px-4 py-1.5 text-sm font-medium border border-transparent text-zinc-500 shadow-none hover:text-zinc-700 hover:bg-zinc-100 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:border-border data-[state=active]:border-b-white data-[state=active]:-mb-px data-[state=active]:shadow-none"
            >
              Liturgia
            </TabsTrigger>
            <TabsTrigger
              value="cifras"
              className="cursor-pointer h-auto flex-none rounded-t-md rounded-b-none px-4 py-1.5 text-sm font-medium border border-transparent text-zinc-500 shadow-none hover:text-zinc-700 hover:bg-zinc-100 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:border-border data-[state=active]:border-b-white data-[state=active]:-mb-px data-[state=active]:shadow-none"
            >
              Cifras
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="liturgia" className="mt-0">
          <Main className="px-4 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-8">
            <ServiceLiturgyView service={service} />
          </Main>
        </TabsContent>

        <TabsContent value="cifras" className="mt-0">
          <MainWithDensity>
            <ServiceView service={service ?? null} />
          </MainWithDensity>
        </TabsContent>
      </Tabs>
    </ServiceConfigProvider>
  );
}

function MainWithDensity({ children }: { children: React.ReactNode }) {
  const { density } = useServiceConfig();
  return (
    <Main density={density} className="px-4 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-8">
      {children}
    </Main>
  );
}
