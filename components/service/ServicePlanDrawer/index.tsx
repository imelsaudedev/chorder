"use client";

import { useFetchTemplates } from "@/app/api/api-client";
import DatePicker from "@/components/common/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClientServiceSection, ClientServiceTemplate } from "@/prisma/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  worshipLeader: z.string().nullable(),
  preacher: z.string().nullable(),
  date: z.coerce.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
});

type FormValues = z.infer<typeof schema>;

export type ServicePlanConfig = {
  title: string;
  worshipLeader: string | null;
  preacher: string | null;
  date: Date;
  templateSections: ClientServiceSection[] | null;
};

type ServicePlanDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isNew?: boolean;
  defaultValues?: {
    title?: string;
    worshipLeader?: string | null;
    preacher?: string | null;
    date?: Date;
  };
  loading?: boolean;
  onSave: (config: ServicePlanConfig) => void | false;
};

function timeFromDate(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
}

export default function ServicePlanDrawer({
  open,
  onOpenChange,
  isNew = false,
  defaultValues,
  loading = false,
  onSave,
}: ServicePlanDrawerProps) {
  const t = useTranslations();
  const baseDate = defaultValues?.date ?? new Date();

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      worshipLeader: defaultValues?.worshipLeader ?? "",
      preacher: defaultValues?.preacher ?? "",
      date: baseDate,
      startTime: timeFromDate(baseDate),
    },
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ClientServiceTemplate | null>(null);

  useEffect(() => {
    if (open) {
      const d = defaultValues?.date ?? new Date();
      form.reset({
        title: defaultValues?.title ?? "",
        worshipLeader: defaultValues?.worshipLeader ?? "",
        preacher: defaultValues?.preacher ?? "",
        date: d,
        startTime: timeFromDate(d),
      });
      setSelectedTemplate(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(values: FormValues) {
    const date = combineDateAndTime(values.date, values.startTime);

    const templateSections = selectedTemplate
      ? buildSectionsFromTemplate(selectedTemplate)
      : null;

    const result = onSave({
      title: values.title,
      worshipLeader: values.worshipLeader || null,
      preacher: values.preacher || null,
      date,
      templateSections,
    });

    if (result !== false) onOpenChange(false);
  }

  const { isValid } = form.formState;
  const title = isNew ? t("Messages.newService") : t("Messages.editServiceData");
  const submitLabel = isNew ? t("Messages.continue") : t("Messages.save");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex flex-col max-w-sm overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1"
          >
            <div className="px-4 space-y-4 pb-2 flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ServiceData.title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("ServiceData.titlePlaceholder")}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ServiceData.date")}</FormLabel>
                    <FormControl>
                      <DatePicker
                        buttonProps={{ className: "w-full" }}
                        disabled={field.disabled}
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="w-32" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="worshipLeader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("ServiceData.worshipLeader")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("ServiceData.worshipLeaderPlaceholder")}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preacher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pregador</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do pregador"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Template */}
              <div>
                <p className="text-sm font-medium mb-2">Template</p>
                <TemplateSelector
                  selected={selectedTemplate}
                  onSelect={setSelectedTemplate}
                />
              </div>
            </div>

            <DrawerFooter>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={!isValid || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  submitLabel
                )}
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}

// --- Template selector ---

type TemplateSelectorProps = {
  selected: ClientServiceTemplate | null;
  onSelect: (t: ClientServiceTemplate | null) => void;
};

function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const { templates, isLoading } = useFetchTemplates();

  if (isLoading) {
    return <p className="text-xs text-zinc-400">Carregando templates...</p>;
  }

  if (templates.length === 0) {
    return <p className="text-xs text-zinc-400">Nenhum template cadastrado.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
          selected === null
            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
            : "border-zinc-200 hover:border-zinc-300"
        }`}
      >
        <span>Sem template</span>
        {selected === null && <Check className="w-4 h-4" />}
      </button>

      {templates.map((tmpl) => (
        <button
          key={tmpl.id}
          type="button"
          onClick={() => onSelect(tmpl)}
          className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
            selected?.id === tmpl.id
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <div className="text-left">
            <p className="font-medium">{tmpl.name}</p>
            <p className="text-xs text-zinc-400">
              {templateSummary(tmpl)}
            </p>
          </div>
          {selected?.id === tmpl.id ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-zinc-300" />
          )}
        </button>
      ))}
    </div>
  );
}

function templateSummary(tmpl: ClientServiceTemplate): string {
  const items = tmpl.items as { sections?: unknown[] } | null;
  const sections = items?.sections ?? [];
  return `${sections.length} seções`;
}

// --- Template → sections mapping ---

type RawUnit = {
  type: string;
  label?: string | null;
  order?: number;
  durationMin?: number | null;
  metadata?: unknown;
};

type RawSection = {
  type: string;
  label: string;
  order?: number;
  units?: RawUnit[];
};

type TemplateItems = {
  sections?: RawSection[];
};

function buildSectionsFromTemplate(
  template: ClientServiceTemplate
): ClientServiceSection[] {
  const items = template.items as TemplateItems | null;
  return (items?.sections ?? []).map((s, i) => ({
    id: undefined,
    serviceId: undefined,
    type: s.type as ClientServiceSection["type"],
    label: s.label,
    order: i + 1,
    units: (s.units ?? []).map((u, j) => ({
      id: undefined,
      serviceId: undefined,
      type: u.type as import("@/prisma/models").ClientServiceUnit["type"],
      label: u.label ?? null,
      order: j + 1,
      durationMin: u.durationMin ?? null,
      metadata: u.metadata ?? null,
      arrangementId: null,
      semitoneTranspose: null,
      sectionId: null,
    })),
  }));
}
