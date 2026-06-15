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
import { buildSectionsFromTemplate, getTemplateDefaultStartTime } from "@/lib/template-utils";
import { ClientServiceSection, ClientServiceTemplate } from "@/prisma/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

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
  templateId: number | null;
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

function suggestTitle(date: Date): string {
  return "Culto - " + format(date, "EEE, d MMM", { locale: ptBR });
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
      title: isNew ? suggestTitle(baseDate) : (defaultValues?.title ?? ""),
      worshipLeader: defaultValues?.worshipLeader ?? "",
      preacher: defaultValues?.preacher ?? "",
      date: baseDate,
      startTime: timeFromDate(baseDate),
    },
  });

  // undefined = user hasn't interacted yet (nothing highlighted)
  // null     = explicitly chose "sem template"
  // template = chose a specific template
  const [selectedTemplate, setSelectedTemplate] = useState<
    ClientServiceTemplate | null | undefined
  >(undefined);

  // Tracks whether the user manually edited the title (suppresses auto-suggest)
  const isTitleDirty = useRef(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      const d = defaultValues?.date ?? new Date();
      isTitleDirty.current = false;
      form.reset({
        title: isNew ? suggestTitle(d) : (defaultValues?.title ?? ""),
        worshipLeader: defaultValues?.worshipLeader ?? "",
        preacher: defaultValues?.preacher ?? "",
        date: d,
        startTime: timeFromDate(d),
      });
      setSelectedTemplate(undefined);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-suggest title when date changes (only in creation mode, only if not dirty)
  const dateValue = form.watch("date");
  useEffect(() => {
    if (!isNew || isTitleDirty.current) return;
    if (dateValue) {
      form.setValue("title", suggestTitle(new Date(dateValue)), {
        shouldValidate: true,
      });
    }
  }, [dateValue, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill startTime from template's defaultStartTime
  function handleTemplateSelect(tmpl: ClientServiceTemplate | null) {
    setSelectedTemplate(tmpl);
    if (tmpl) {
      const defaultTime = getTemplateDefaultStartTime(tmpl);
      if (defaultTime) {
        form.setValue("startTime", defaultTime, { shouldValidate: true });
      }
    }
  }

  function handleSubmit(values: FormValues) {
    const date = combineDateAndTime(values.date, values.startTime);

    const result = onSave({
      title: values.title,
      worshipLeader: values.worshipLeader || null,
      preacher: values.preacher || null,
      date,
      templateId: selectedTemplate?.id ?? null,
      templateSections: selectedTemplate
        ? buildSectionsFromTemplate(selectedTemplate)
        : null,
    });

    if (result !== false) onOpenChange(false);
  }

  const { isValid } = form.formState;
  const drawerTitle = isNew
    ? t("Messages.newService")
    : t("Messages.editServiceData");
  const submitLabel = isNew ? t("Messages.continue") : t("Messages.save");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex flex-col max-w-sm overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>{drawerTitle}</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1"
          >
            <div className="px-4 pb-2 flex-1 flex flex-col gap-5">
              {isNew ? (
                <CreationFields
                  form={form}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSelect}
                  onTitleChange={() => {
                    isTitleDirty.current = true;
                  }}
                />
              ) : (
                <EditFields form={form} />
              )}
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

// ---------------------------------------------------------------------------
// Creation fields: data → template → hora → título → dirigente
// ---------------------------------------------------------------------------

type CreationFieldsProps = {
  form: ReturnType<typeof useForm<FormValues>>;
  selectedTemplate: ClientServiceTemplate | null | undefined;
  onSelectTemplate: (t: ClientServiceTemplate | null) => void;
  onTitleChange: () => void;
};

function CreationFields({
  form,
  selectedTemplate,
  onSelectTemplate,
  onTitleChange,
}: CreationFieldsProps) {
  const t = useTranslations();
  return (
    <>
      {/* 1. Data */}
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

      {/* 2. Template */}
      <div>
        <p className="text-sm font-medium mb-2">Template</p>
        <TemplateSelector
          selected={selectedTemplate}
          onSelect={onSelectTemplate}
        />
      </div>

      {/* 3. Hora de início */}
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

      {/* 4. Título (auto-sugerido) */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("ServiceData.title")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("ServiceData.titlePlaceholder")}
                {...field}
                onChange={(e) => {
                  onTitleChange();
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 5. Dirigente */}
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Edit fields: título → data → hora → dirigente → pregador
// ---------------------------------------------------------------------------

type EditFieldsProps = {
  form: ReturnType<typeof useForm<FormValues>>;
};

function EditFields({ form }: EditFieldsProps) {
  const t = useTranslations();
  return (
    <>
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
    </>
  );
}

// ---------------------------------------------------------------------------
// Template selector
// ---------------------------------------------------------------------------

type TemplateSelectorProps = {
  selected: ClientServiceTemplate | null | undefined;
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
      {templates.map((tmpl) => {
        const isSelected = selected?.id === tmpl.id;
        return (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onSelect(tmpl)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-sm transition-colors text-left ${
              isSelected
                ? "border-emerald-500 bg-emerald-50"
                : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-zinc-300"
              }`}
            >
              {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isSelected ? "text-emerald-700" : "text-zinc-800"}`}>
                {tmpl.name}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {templateSummary(tmpl)}
              </p>
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-sm transition-colors ${
          selected === null
            ? "border-zinc-400 bg-zinc-50"
            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected === null ? "border-zinc-500 bg-zinc-500" : "border-zinc-300"
          }`}
        >
          {selected === null && (
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          )}
        </div>
        <span className={selected === null ? "text-zinc-700" : "text-zinc-500"}>
          Sem template
        </span>
      </button>
    </div>
  );
}

function templateSummary(tmpl: ClientServiceTemplate): string {
  const items = tmpl.items as {
    sections?: unknown[];
    defaultStartTime?: string;
  } | null;
  const sections = items?.sections ?? [];
  const time = items?.defaultStartTime ? ` · ${items.defaultStartTime}` : "";
  return `${sections.length} seções${time}`;
}

