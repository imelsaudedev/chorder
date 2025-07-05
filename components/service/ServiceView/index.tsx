"use client";

import FullScreenToggle from "@/components/common/FullScreenToggle";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { useTranslations } from "next-intl";
import { Fragment, useRef } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};
export default function ServiceView({ service }: ServiceViewProps) {
  const t = useTranslations();
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { density, fontSize } = useServiceConfig();

  if (!service) {
    // TODO: SKELETON
    return null;
  }
  if (!service.units) {
    throw new Error("Service units are not available");
  }

  return (
    <>
      <section
        className={`flex flex-col mx-auto ${
          density === "compact" ? "gap-2 text-sm" : "gap-8 text-base"
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {service.units.map((unit, index) => (
          <Fragment key={index}>
            {unit?.type === "SONG" && (
              <div ref={(el) => (unitRefs.current[index] = el)}>
                <ServiceSongUnitView unit={unit as ClientServiceUnit} />
              </div>
            )}
          </Fragment>
        ))}
      </section>

      <FullScreenToggle unitRefs={unitRefs} />
    </>
  );
}
