"use client";

import { useCreateOrUpdateService } from "@/app/api/api-client";
import { ClientService, ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
import { useCallback, useState } from "react";

export type DrawerState =
  | { type: "closed" }
  | { type: "add-unit"; sectionIndex: number }
  | { type: "edit-unit"; sectionIndex: number; unitIndex: number };

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

function withOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

export function usePlanEditor(initialService: ClientService) {
  const [service, setService] = useState<ClientService>(() => ({
    ...initialService,
    sections: initialService.sections ?? [],
    units: initialService.units ?? [],
  }));
  const [isDirty, setIsDirty] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>({ type: "closed" });

  const { createOrUpdateService, isMutating } = useCreateOrUpdateService(
    service.id ?? null
  );

  const mutate = useCallback((updater: (s: ClientService) => ClientService) => {
    setService(updater);
    setIsDirty(true);
  }, []);

  // --- Sections ---

  const addSection = useCallback(
    (section: Omit<ClientServiceSection, "order">) => {
      mutate((s) => ({
        ...s,
        sections: [
          ...(s.sections ?? []),
          { ...section, order: (s.sections?.length ?? 0) + 1, units: [] },
        ],
      }));
    },
    [mutate]
  );

  const updateSection = useCallback(
    (sectionIndex: number, changes: Partial<ClientServiceSection>) => {
      mutate((s) => {
        const sections = [...(s.sections ?? [])];
        sections[sectionIndex] = { ...sections[sectionIndex], ...changes };
        return { ...s, sections };
      });
    },
    [mutate]
  );

  const removeSection = useCallback(
    (sectionIndex: number) => {
      mutate((s) => ({
        ...s,
        sections: withOrders(
          (s.sections ?? []).filter((_, i) => i !== sectionIndex)
        ),
      }));
    },
    [mutate]
  );

  const moveSection = useCallback(
    (from: number, to: number) => {
      mutate((s) => ({
        ...s,
        sections: withOrders(reorder(s.sections ?? [], from, to)),
      }));
    },
    [mutate]
  );

  // --- Units ---

  const addUnit = useCallback(
    (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => {
      mutate((s) => {
        const sections = [...(s.sections ?? [])];
        const current = sections[sectionIndex];
        const units = current.units ?? [];
        sections[sectionIndex] = {
          ...current,
          units: [...units, { ...unit, order: units.length + 1 }],
        };
        return { ...s, sections };
      });
    },
    [mutate]
  );

  const updateUnit = useCallback(
    (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => {
      mutate((s) => {
        const sections = [...(s.sections ?? [])];
        const units = [...(sections[sectionIndex].units ?? [])];
        units[unitIndex] = { ...units[unitIndex], ...changes };
        sections[sectionIndex] = { ...sections[sectionIndex], units };
        return { ...s, sections };
      });
    },
    [mutate]
  );

  const removeUnit = useCallback(
    (sectionIndex: number, unitIndex: number) => {
      mutate((s) => {
        const sections = [...(s.sections ?? [])];
        sections[sectionIndex] = {
          ...sections[sectionIndex],
          units: withOrders(
            (sections[sectionIndex].units ?? []).filter((_, i) => i !== unitIndex)
          ),
        };
        return { ...s, sections };
      });
    },
    [mutate]
  );

  const moveUnit = useCallback(
    (
      fromSection: number,
      fromIndex: number,
      toSection: number,
      toIndex: number
    ) => {
      mutate((s) => {
        const sections = (s.sections ?? []).map((sec) => ({
          ...sec,
          units: [...(sec.units ?? [])],
        }));

        const unit = sections[fromSection].units[fromIndex];
        sections[fromSection].units.splice(fromIndex, 1);
        sections[toSection].units.splice(toIndex, 0, unit);

        sections[fromSection].units = withOrders(sections[fromSection].units);
        if (fromSection !== toSection) {
          sections[toSection].units = withOrders(sections[toSection].units);
        }

        return { ...s, sections };
      });
    },
    [mutate]
  );

  const loadTemplate = useCallback(
    (sections: ClientServiceSection[], startTime?: string) => {
      mutate((s) => {
        let date = s.date;
        if (startTime) {
          const [h, m] = startTime.split(":").map(Number);
          date = new Date(date);
          date.setHours(h, m, 0, 0);
        }
        return { ...s, date, sections };
      });
    },
    [mutate]
  );

  const updateServiceMeta = useCallback(
    (changes: Partial<Pick<ClientService, "title" | "worshipLeader" | "date" | "preacher">>) => {
      mutate((s) => ({ ...s, ...changes }));
    },
    [mutate]
  );

  const save = useCallback(async () => {
    const saved = await createOrUpdateService(service);
    setIsDirty(false);
    return saved;
  }, [service, createOrUpdateService]);

  return {
    service,
    isDirty,
    isSaving: isMutating,
    drawer,
    setDrawer,
    addSection,
    updateSection,
    removeSection,
    moveSection,
    addUnit,
    updateUnit,
    removeUnit,
    moveUnit,
    loadTemplate,
    updateServiceMeta,
    save,
  };
}
