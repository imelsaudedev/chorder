"use client";

import FloatingAddLink from "@/components/common/FloatingAddLink";
import ServicePlanDrawer, {
  ServicePlanConfig,
} from "@/components/service/ServicePlanDrawer";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ClientServiceList from "./ClientServiceList";

export default function ClientServicesPage() {
  const t = useTranslations("Messages");
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  function handleSave(config: ServicePlanConfig) {
    const params = new URLSearchParams();
    if (config.title) params.set("title", config.title);
    if (config.worshipLeader) params.set("worshipLeader", config.worshipLeader);
    if (config.preacher) params.set("preacher", config.preacher);
    if (config.templateId) params.set("templateId", String(config.templateId));
    params.set("date", config.date.toISOString());
    setIsNavigating(true);
    setTimeout(() => router.push(`/services/new?${params.toString()}`), 0);
    return false as const;
  }

  return (
    <>
      <ClientServiceList />

      <FloatingAddLink label={t("newService")} onClick={() => setDrawerOpen(true)} />

      <ServicePlanDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        isNew
        loading={isNavigating}
        onSave={handleSave}
      />
    </>
  );
}
