import { ClientService } from "@/prisma/models";
import { useMemo } from "react";

export type UnitTiming = {
  startTime: Date;
  endTime: Date;
};

export type SectionTiming = {
  startTime: Date;
  endTime: Date;
  units: UnitTiming[];
};

export function useServiceTimeline(service: ClientService): SectionTiming[] {
  return useMemo(() => {
    const sections = service.sections ?? [];
    const result: SectionTiming[] = [];
    let cursor = new Date(service.date);

    for (const section of sections) {
      const sectionStart = new Date(cursor);
      const unitTimings: UnitTiming[] = [];

      for (const unit of section.units ?? []) {
        const unitStart = new Date(cursor);
        const durationMs = (unit.durationMin ?? 0) * 60_000;
        cursor = new Date(cursor.getTime() + durationMs);
        unitTimings.push({ startTime: unitStart, endTime: new Date(cursor) });
      }

      result.push({
        startTime: sectionStart,
        endTime: new Date(cursor),
        units: unitTimings,
      });
    }

    return result;
  }, [service.date, service.sections]);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
