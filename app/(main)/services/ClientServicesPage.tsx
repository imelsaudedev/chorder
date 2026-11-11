"use client";

import FloatingAddLink from "@/components/common/FloatingAddLink";
import { useTranslations } from "next-intl";
import ClientServiceList from "./ClientServiceList";
import { useNewService } from "./NewServiceProvider";

export default function ClientServicesPage() {
  const t = useTranslations("Messages");
  const { openNewService } = useNewService();

  return (
    <>
      <ClientServiceList />

      {/* No tablet e no desktop a ação está no cabeçalho. */}
      <FloatingAddLink label={t("newService")} onClick={openNewService} mobileOnly />
    </>
  );
}
