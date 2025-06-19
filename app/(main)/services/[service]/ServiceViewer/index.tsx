"use client";

import { ServiceSongUnit } from "@/prisma/models";
import FullScreenToggle from "@components/FullScreenToggle";
import AdjustmentIcon from "@components/icons/AdjustmentIcon";
import Main from "@components/Main";
import PageHeader from "@components/PageHeader";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { Button } from "@ui/button";
import { Collapsible, CollapsibleTrigger } from "@ui/collapsible";
import { Calendar, MicVocal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useMemo, useRef, useState } from "react";
import { deleteServiceAction } from "../actions";
import ServiceActionMenu from "./ServiceActionMenu";
import ServiceConfig from "./ServiceConfig";
import ServiceSongUnitView from "./ServiceSongUnitView";
import { useDensity, useFontSize, useService } from "./ServiceViewContext";

export default function ServiceViewPage() {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { service } = useService();
  const { density } = useDensity();
  const { fontSize } = useFontSize();

  const locale = useLocale();

  const serviceTitle = useMemo(
    () => service?.title?.trim() || t("Service.noTitle"),
    [service?.title, t]
  );

  if (!service) {
    return null;
  }

  const units = service.units;
  const deleteCurrentService = deleteServiceAction.bind(null, service.slug);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
    .format(new Date(service.date))
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/ de ([a-z])/, (m, c) => ` de ${c.toUpperCase() + m.slice(5)}`);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < units.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const subtitle = (
    <div className="flex flex-row items-center gap-4 leading-tight">
      <span className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        {formattedDate}
      </span>
      {service.worshipLeader && (
        <span className="flex items-center gap-1">
          <MicVocal className="w-4 h-4" />
          <span className="hidden sm:block">{t("Service.ledBy")}</span>
          {service.worshipLeader}
        </span>
      )}
    </div>
  );

  return (
    <Collapsible>
      <PageHeader
        backLinkHref="/services"
        backLinkText={t("Messages.services")}
        title={serviceTitle}
        subtitle={subtitle}
        actions={
          <div className="flex gap-2 items-center md:self-end">
            <ServiceActionMenu deleteService={deleteCurrentService} />
            {/* O botão de configuração agora está dentro do Collapsible */}
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                <AdjustmentIcon />
                <span className="sr-only">{t("Messages.toggleConfig")}</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        }
      />

      <CollapsibleContent>
        <ServiceConfig />
      </CollapsibleContent>

      <Main density={density} className="py-4 sm:py-6 lg:py-8">
        <section
          className={`flex flex-col mx-auto ${
            density === "compact" ? "gap-2 text-sm" : "gap-8 text-base"
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {units.map((unit, index) => (
            <Fragment key={index}>
              {unit?.type === "SONG" && (
                <div ref={(el) => (unitRefs.current[index] = el)}>
                  <ServiceSongUnitView
                    unit={unit as ServiceSongUnit}
                    order={index + 1}
                  />
                </div>
              )}
            </Fragment>
          ))}
        </section>
      </Main>

      <FullScreenToggle onPrevious={handlePrevious} onNext={handleNext} />
    </Collapsible>
  );
}
