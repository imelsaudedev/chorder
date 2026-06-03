"use client";

import { useNavigationLoader } from "@/components/common/NavigationLoader";
import ServiceMetaModal from "@/components/service/ServiceMetaModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ClientServiceList from "./ClientServiceList";

export default function ClientServicesPage() {
  const t = useTranslations("Messages");
  const { navigateTo } = useNavigationLoader();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <ClientServiceList />

      <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8">
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="hidden sm:inline" />
          <span className="sm:hidden">
            <Plus />
          </span>
          <span className="hidden sm:inline">{t("newService")}</span>
        </Button>
      </div>

      <ServiceMetaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        isNew
        onSave={(values) => {
          const params = new URLSearchParams();
          if (values.title) params.set("title", values.title);
          if (values.worshipLeader) params.set("worshipLeader", values.worshipLeader);
          params.set("date", values.date.toISOString());
          navigateTo(`/services/new?${params.toString()}`);
        }}
      />
    </>
  );
}
