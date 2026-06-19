"use client";

import { useCreateTemplate, useUpdateTemplate } from "@/app/api/api-client";
import { DrawerState } from "@/components/service/ServicePlanEditor/hooks/usePlanEditor";
import { ClientServiceSection, ClientServiceUnit } from "@/prisma/models";
import { useCallback, useState } from "react";

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

function withOrders<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i + 1 }));
}

export function useTemplateEditor(initial: {
  id?: number;
  name: string;
  defaultStartTime: string;
  sections: ClientServiceSection[];
}) {
  const [name, setName] = useState(initial.name);
  const [defaultStartTime, setDefaultStartTime] = useState(initial.defaultStartTime);
  const [sections, setSections] = useState<ClientServiceSection[]>(initial.sections);
  const [isDirty, setIsDirty] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>({ type: "closed" });

  const { createTemplate, isCreating } = useCreateTemplate();
  const { updateTemplate, isUpdating } = useUpdateTemplate(initial.id ?? 0);

  const mutate = useCallback((updater: (s: ClientServiceSection[]) => ClientServiceSection[]) => {
    setSections(updater);
    setIsDirty(true);
  }, []);

  const addSection = useCallback(
    (section: Omit<ClientServiceSection, "order">) => {
      mutate((s) => [...s, { ...section, order: s.length + 1, units: [] }]);
    },
    [mutate]
  );

  const updateSection = useCallback(
    (sectionIndex: number, changes: Partial<ClientServiceSection>) => {
      mutate((s) => {
        const next = [...s];
        next[sectionIndex] = { ...next[sectionIndex], ...changes };
        return next;
      });
    },
    [mutate]
  );

  const removeSection = useCallback(
    (sectionIndex: number) => {
      mutate((s) => withOrders(s.filter((_, i) => i !== sectionIndex)));
    },
    [mutate]
  );

  const moveSection = useCallback(
    (from: number, to: number) => {
      mutate((s) => withOrders(reorder(s, from, to)));
    },
    [mutate]
  );

  const addUnit = useCallback(
    (sectionIndex: number, unit: Omit<ClientServiceUnit, "order">) => {
      mutate((s) => {
        const next = [...s];
        const current = next[sectionIndex];
        const units = current.units ?? [];
        next[sectionIndex] = { ...current, units: [...units, { ...unit, order: units.length + 1 }] };
        return next;
      });
    },
    [mutate]
  );

  const updateUnit = useCallback(
    (sectionIndex: number, unitIndex: number, changes: Partial<ClientServiceUnit>) => {
      mutate((s) => {
        const next = [...s];
        const units = [...(next[sectionIndex].units ?? [])];
        units[unitIndex] = { ...units[unitIndex], ...changes };
        next[sectionIndex] = { ...next[sectionIndex], units };
        return next;
      });
    },
    [mutate]
  );

  const removeUnit = useCallback(
    (sectionIndex: number, unitIndex: number) => {
      mutate((s) => {
        const next = [...s];
        next[sectionIndex] = {
          ...next[sectionIndex],
          units: withOrders((next[sectionIndex].units ?? []).filter((_, i) => i !== unitIndex)),
        };
        return next;
      });
    },
    [mutate]
  );

  const moveUnit = useCallback(
    (fromSection: number, fromIndex: number, toSection: number, toIndex: number) => {
      mutate((s) => {
        const next = s.map((sec) => ({ ...sec, units: [...(sec.units ?? [])] }));
        const unit = next[fromSection].units[fromIndex];
        next[fromSection].units.splice(fromIndex, 1);
        next[toSection].units.splice(toIndex, 0, unit);
        next[fromSection].units = withOrders(next[fromSection].units);
        if (fromSection !== toSection) {
          next[toSection].units = withOrders(next[toSection].units);
        }
        return next;
      });
    },
    [mutate]
  );

  const save = useCallback(async (): Promise<ClientServiceSection & { id?: number } | undefined> => {
    const items = { defaultStartTime, sections };
    let result;
    if (initial.id) {
      result = await updateTemplate({ name, items });
    } else {
      result = await createTemplate({ name, items });
    }
    setIsDirty(false);
    return result as unknown as ClientServiceSection & { id?: number };
  }, [name, defaultStartTime, sections, initial.id, createTemplate, updateTemplate]);

  return {
    name,
    setName: (v: string) => { setName(v); setIsDirty(true); },
    defaultStartTime,
    setDefaultStartTime: (v: string) => { setDefaultStartTime(v); setIsDirty(true); },
    sections,
    isDirty,
    isSaving: isCreating || isUpdating,
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
    save,
  };
}
