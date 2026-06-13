"use client";

import ServiceMetaModal, { ServiceMeta } from "@/components/service/ServiceMetaModal";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientService } from "@/prisma/models";
import { MoreVertical, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";

type ServiceListEntryProps = {
  service: ClientService;
  variant?: "default" | "card";
};

export default function ServiceListEntry({ service, variant = "default" }: ServiceListEntryProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [metaOpen, setMetaOpen] = useState(false);
  const [localService, setLocalService] = useState(service);
  const [saving, setSaving] = useState(false);
  const { mutate } = useSWRConfig();

  useEffect(() => { setLocalService(service); }, [service]);

  const serviceTitle = useMemo(
    () => localService.title?.trim() || t("Service.noTitle"),
    [localService.title, t]
  );
  const serviceDate = useMemo(
    () =>
      new Date(String(localService.date))
        .toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        })
        .replace(/^\w/, (c) => c.toUpperCase()),
    [locale, localService.date]
  );

  function handleMetaSave(values: ServiceMeta): false {
    setSaving(true);
    fetch(`/api/services/${localService.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((res) => {
      if (!res.ok) return;
      setLocalService((prev) => ({ ...prev, ...values }));
      setMetaOpen(false);
      mutate((key) => typeof key === "string" && key.startsWith("/api/services"));
    }).catch(() => {}).finally(() => setSaving(false));
    return false;
  }

  const hoverClass =
    variant === "card"
      ? "hover:bg-secondary/10"
      : "hover:bg-zinc-50";

  return (
    <li className={`relative flex items-center gap-1 py-2.5 px-2 -mx-2 rounded-md transition-colors group ${hoverClass}`}>
      {/* Overlay link — cobre tudo exceto o dropdown */}
      <a
        href={`/services/${localService.slug}`}
        className="absolute inset-0 z-0"
        aria-label={serviceTitle}
      />

      {/* Conteúdo — pointer-events-none para deixar o link passar */}
      <div className="relative z-10 flex-1 min-w-0 pointer-events-none">
        <p className="font-display font-semibold text-base lg:text-lg tracking-tight leading-snug lg:leading-tight text-primary truncate">
          {serviceTitle}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Text variant="caption" as="span" className="text-xs md:text-sm">
            {serviceDate}
          </Text>
          {localService.worshipLeader && (
            <>
              <Text variant="caption" as="span" className="text-xs md:text-sm">·</Text>
              <Text variant="caption" as="span" className="text-xs md:text-sm">
                {localService.worshipLeader}
              </Text>
            </>
          )}
        </div>
      </div>

      {/* Dropdown — z-10 para ficar acima do link overlay */}
      <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setMetaOpen(true)}>
              <Pencil size={14} className="mr-2" />
              {t("Messages.editServiceData")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ServiceMetaModal
        open={metaOpen}
        onOpenChange={setMetaOpen}
        isNew={false}
        defaultValues={{
          title: localService.title ?? "",
          worshipLeader: localService.worshipLeader ?? "",
          date: localService.date instanceof Date ? localService.date : new Date(String(localService.date)),
        }}
        onSave={handleMetaSave}
        loading={saving}
      />
    </li>
  );
}
