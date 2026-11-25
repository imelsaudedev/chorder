"use client";

import FloatingAddLink from "@/components/common/FloatingAddLink";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import ClientServiceList from "./ClientServiceList";
import { useNewService } from "./NewServiceProvider";

type ClientServicesPageProps = {
  canViewChurch: boolean;
  canManageChurch: boolean;
};

export default function ClientServicesPage({
  canViewChurch,
  canManageChurch,
}: ClientServicesPageProps) {
  const t = useTranslations("Messages");
  const tService = useTranslations("Service");
  const { activeScope, setActiveScope, openNewService } = useNewService();

  const canCreateInCurrentTab =
    activeScope === "PERSONAL" || canManageChurch;

  return (
    <>
      {canViewChurch ? (
        <Tabs
          value={activeScope === "PERSONAL" ? "personal" : "church"}
          onValueChange={(v) =>
            setActiveScope(v === "personal" ? "PERSONAL" : "CHURCH")
          }
          className="flex flex-col gap-5"
        >
          <TabsList className="h-11 w-fit p-1 bg-muted/50">
            <TabsTrigger value="church" className="h-full px-4 cursor-pointer">
              <Building2 aria-hidden="true" />
              {tService("tabChurch")}
            </TabsTrigger>
            <TabsTrigger value="personal" className="h-full px-4 cursor-pointer">
              <User aria-hidden="true" />
              {tService("tabPersonal")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="church" className="mt-0">
            <ClientServiceList scope="church" />
          </TabsContent>

          <TabsContent value="personal" className="mt-0">
            <ClientServiceList scope="personal" />
          </TabsContent>
        </Tabs>
      ) : (
        <ClientServiceList scope="personal" />
      )}

      {/* No tablet e no desktop a ação está no cabeçalho. */}
      {canCreateInCurrentTab && (
        <FloatingAddLink
          label={t("newService")}
          onClick={() => openNewService(activeScope)}
          mobileOnly
        />
      )}
    </>
  );
}
