"use client";

import FloatingAddLink from "@/components/common/FloatingAddLink";
import ServiceMetaModal from "@/components/service/ServiceMetaModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ClientServiceList from "./ClientServiceList";

export default function ClientServicesPage() {
  const t = useTranslations("Messages");
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <>
      <ClientServiceList />

      <FloatingAddLink label={t("newService")} onClick={() => setModalOpen(true)} />

      <ServiceMetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        loading={isNavigating}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          if (values.title) params.set("title", values.title);
          if (values.worshipLeader) params.set("worshipLeader", values.worshipLeader);
          params.set("date", values.date.toISOString());
          setIsNavigating(true);
          setTimeout(() => router.push(`/services/new?${params.toString()}`), 0);
          return false;
        }}
      />
    </>
  );
}
