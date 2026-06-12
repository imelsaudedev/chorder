"use client";

import FullScreenToggle from "@/components/common/FullScreenToggle";
import { useServiceConfig } from "@/components/config/ServiceConfig";
import { ClientService, ClientServiceUnit } from "@/prisma/models";
import { Fragment, useEffect, useState } from "react";
import ServiceSongUnitView from "./ServiceSongUnitView";

type ServiceViewProps = {
  service: ClientService | null;
};
export default function ServiceView({ service }: ServiceViewProps) {
  const { density, fontSize, setFontSize } = useServiceConfig();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleFSChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  useEffect(() => {
    if (!isFullScreen) return;
    const handleKey = (e: KeyboardEvent) => {
      const total = songUnits.length;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentIndex((i) => Math.min(i + 1, total - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentIndex((i) => Math.max(i - 1, 0));
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen]);

  if (!service) return null;
  if (!service.units) throw new Error("Service units are not available");

  const songUnits = service.units.filter((u): u is ClientServiceUnit => u?.type === "SONG");
  const total = songUnits.length;
  const currentTitle = (songUnits[currentIndex]?.arrangement as { song?: { title?: string } } | undefined)?.song?.title ?? "";
  const sectionClass = density === "compact" ? "flex flex-col mx-auto gap-4" : "flex flex-col mx-auto gap-10";

  const handleToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      {isFullScreen ? (
        <div className="h-dvh overflow-y-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8" style={{ fontSize: `${fontSize}px` }}>
          {songUnits[currentIndex] && (
            <ServiceSongUnitView unit={songUnits[currentIndex]} />
          )}
        </div>
      ) : (
        <section className={sectionClass} style={{ fontSize: `${fontSize}px` }}>
          {service.units.map((unit, index) => (
            <Fragment key={index}>
              {unit?.type === "SONG" && (
                <ServiceSongUnitView unit={unit as ClientServiceUnit} />
              )}
            </Fragment>
          ))}
        </section>
      )}

      <FullScreenToggle
        isFullScreen={isFullScreen}
        currentIndex={currentIndex}
        total={total}
        currentTitle={currentTitle}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, total - 1))}
        onToggle={handleToggle}
      />
    </>
  );
}
