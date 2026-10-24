"use client";

import { useFetchServices, useFetchTemplates } from "@/app/api/api-client";
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
import {
  buildSectionsFromTemplate,
  getTemplateDefaultStartTime,
  summarizeTemplate,
} from "@/lib/template-utils";
import { buildServiceTitle, nextSunday } from "@/lib/service-schedule";
import { ClientServiceSection, ClientServiceTemplate } from "@/prisma/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

// Data e hora começam vazias na criação (a pessoa precisa escolher), então a data
// aceita nulo e a obrigatoriedade fica na validação.
const schema = z.object({
  title: z.string().min(1),
  worshipLeader: z.string().nullable(),
  preacher: z.string().nullable(),
  // Boolean(...) de propósito: um `value !== null` estreitaria o tipo de saída e separaria
  // entrada e saída do formulário.
  date: z.date().nullable().refine((value) => Boolean(value), "Escolha a data"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Escolha a hora"),
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

export default function ServicePlanDrawer({
  open,
  onOpenChange,
  isNew = false,
  defaultValues,
  loading = false,
  onSave,
}: ServicePlanDrawerProps) {
  const t = useTranslations();

  // Criação: data, hora e título começam vazios. Edição: os valores do culto.
  const initialValues = (): FormValues => {
    const date = isNew ? null : (defaultValues?.date ?? new Date());
    return {
      title: isNew ? "" : (defaultValues?.title ?? ""),
      worshipLeader: defaultValues?.worshipLeader ?? "",
      preacher: defaultValues?.preacher ?? "",
      date,
      startTime: date ? timeFromDate(date) : "",
    };
  };

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: initialValues(),
  });

  // undefined = user hasn't interacted yet (nothing highlighted)
  // null     = explicitly chose "sem template"
  // template = chose a specific template
  const [selectedTemplate, setSelectedTemplate] = useState<
    ClientServiceTemplate | null | undefined
  >(undefined);

  // Tracks whether the user manually edited the title (suppresses auto-suggest)
  const isTitleDirty = useRef(false);

  // O horário do modelo é adotado ao escolher o modelo. Este sinal diz que o horário atual
  // veio dele (e não foi editado), para poder ser limpo se trocarem para um modelo sem horário.
  const timeFromTemplate = useRef(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      isTitleDirty.current = false;
      timeFromTemplate.current = false;
      form.reset(initialValues());
      setSelectedTemplate(undefined);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Título sugerido (só na criação e enquanto a pessoa não o editar): nome do modelo +
  // referência no calendário. O horário do modelo vira um atalho de hora, não é
  // preenchido sozinho: data e hora precisam ser escolhidas.
  const dateValue = form.watch("date");
  useEffect(() => {
    if (!isNew || isTitleDirty.current) return;
    form.setValue(
      "title",
      buildServiceTitle(selectedTemplate?.name, dateValue ? new Date(dateValue) : null),
      { shouldValidate: true }
    );
  }, [dateValue, selectedTemplate, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTemplateSelect(tmpl: ClientServiceTemplate | null) {
    setSelectedTemplate(tmpl);
    const templateTime = tmpl ? getTemplateDefaultStartTime(tmpl) : null;
    if (templateTime) {
      // Modelo com horário de início: adota, sem oferecer outros horários.
      form.setValue("startTime", templateTime, { shouldValidate: true, shouldDirty: true });
      timeFromTemplate.current = true;
    } else if (timeFromTemplate.current) {
      // O horário anterior veio de outro modelo: sem horário agora, a pessoa precisa escolher.
      form.setValue("startTime", "", { shouldValidate: true, shouldDirty: true });
      timeFromTemplate.current = false;
    }
  }

  function handleSubmit(values: FormValues) {
    const date = combineDateAndTime(values.date as Date, values.startTime);

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
                  onTimeChange={() => {
                    timeFromTemplate.current = false;
                  }}
                />
              ) : (
                <EditFields form={form} />
              )}
            </div>

            <DrawerFooter>
              {isNew && (!dateValue || !form.watch("startTime")) && (
                <p className="text-center text-xs text-muted-foreground">
                  Escolha a data e a hora para continuar.
                </p>
              )}
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
// Creation fields: modelo → data e hora → título → dirigente
//
// A ordem segue as dependências: o modelo sugere o horário e compõe o título, então vem
// primeiro. Data e hora começam vazias e são obrigatórias; os atalhos são escolhas de um
// toque (próximos dias de culto, horários usados antes), não valores preenchidos.
// ---------------------------------------------------------------------------

type CreationFieldsProps = {
  form: ReturnType<typeof useForm<FormValues>>;
  selectedTemplate: ClientServiceTemplate | null | undefined;
  onSelectTemplate: (t: ClientServiceTemplate | null) => void;
  onTitleChange: () => void;
  onTimeChange: () => void;
};

function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer inline-flex h-10 items-center rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
        selected
          ? "border-ring bg-ring/10 text-foreground"
          : "border-border text-muted-foreground hover:border-ring hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CreationFields({
  form,
  selectedTemplate,
  onSelectTemplate,
  onTitleChange,
  onTimeChange,
}: CreationFieldsProps) {
  const t = useTranslations();
  const { services } = useFetchServices();

  // Liturgias existentes, para avisar quando o dia escolhido já tem uma.
  const existingServices = useMemo<{ slug: string; title: string | null; date: Date }[]>(
    () =>
      (Array.isArray(services) ? services : [])
        .filter((service: { isDeleted?: boolean }) => !service.isDeleted)
        .map((service: { slug: string; title?: string | null; date: string | Date }) => ({
          slug: service.slug,
          title: service.title ?? null,
          date: new Date(String(service.date)),
        })),
    [services]
  );
  // Os cultos são prioritariamente dominicais: o único atalho de data é o próximo domingo
  // do calendário (hoje, se for domingo).
  const sunday = useMemo(() => nextSunday(), []);
  const templateTime = selectedTemplate ? getTemplateDefaultStartTime(selectedTemplate) : null;

  const dateValue = form.watch("date");
  const timeValue = form.watch("startTime");
  const sundayLabel = `${isSameDay(sunday, new Date()) ? "Hoje" : "Próximo domingo"} · ${format(sunday, "d/MM", { locale: ptBR })}`;
  const sameDayServices = dateValue
    ? existingServices.filter((service) => isSameDay(service.date, new Date(dateValue)))
    : [];

  return (
    <>
      {/* 1. Modelo */}
      <div>
        <p className="text-sm font-medium mb-2">Modelo</p>
        <TemplateSelector selected={selectedTemplate} onSelect={onSelectTemplate} />
      </div>

      {/* 2. Data */}
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("ServiceData.date")}</FormLabel>
            <div className="flex flex-wrap gap-1.5">
              <ChoiceChip
                selected={!!dateValue && isSameDay(new Date(dateValue), sunday)}
                onClick={() => form.setValue("date", sunday, { shouldValidate: true, shouldDirty: true })}
              >
                {sundayLabel}
              </ChoiceChip>
            </div>
            <FormControl>
              <DatePicker
                buttonProps={{ className: "w-full h-11" }}
                disabled={field.disabled}
                onChange={(date) => field.onChange(date ?? null)}
                value={field.value ?? undefined}
              />
            </FormControl>
            {sameDayServices.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Já existe uma liturgia neste dia:{" "}
                {sameDayServices.map((service, index) => (
                  <Fragment key={service.slug}>
                    {index > 0 && ", "}
                    <a href={`/services/${service.slug}`} className="cursor-pointer underline">
                      {service.title?.trim() || "Sem título"}
                    </a>
                  </Fragment>
                ))}
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 3. Hora de início: o modelo, quando tem horário, define; sem ele a pessoa escolhe */}
      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hora de início</FormLabel>
            <FormControl>
              <Input
                type="time"
                {...field}
                className="h-11 w-32"
                onChange={(e) => {
                  onTimeChange();
                  field.onChange(e);
                }}
              />
            </FormControl>
            {templateTime && timeValue === templateTime && (
              <p className="text-xs text-muted-foreground">Horário definido pelo modelo.</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 4. Título (sugerido a partir do modelo e da data) */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("ServiceData.title")}</FormLabel>
            <FormControl>
              <Input
                placeholder="Aparece depois de escolher a data"
                {...field}
                className="h-11"
                onChange={(e) => {
                  onTitleChange();
                  field.onChange(e);
                }}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              Sugerido pelo modelo e pela data. Pode editar.
            </p>
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
                className="h-11"
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
                value={field.value ?? undefined}
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
    return <p className="text-xs text-muted-foreground">Carregando modelos...</p>;
  }

  if (templates.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhum modelo cadastrado.</p>;
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
            className={`cursor-pointer flex items-center gap-3 px-3 min-h-11 py-2.5 rounded-md border text-sm transition-colors text-left ${
              isSelected
                ? "border-ring bg-muted/50"
                : "border-border hover:border-ring hover:bg-muted/50"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? "border-ring bg-ring"
                  : "border-border"
              }`}
            >
              {isSelected && <Check className="w-2.5 h-2.5 text-background" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isSelected ? "text-foreground" : "text-foreground"}`}>
                {tmpl.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summarizeTemplate(tmpl)}
              </p>
            </div>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`cursor-pointer flex items-center gap-3 px-3 min-h-11 py-2.5 rounded-md border text-sm transition-colors ${
          selected === null
            ? "border-ring bg-muted/50"
            : "border-border hover:border-ring hover:bg-muted/50"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected === null ? "border-ring bg-ring" : "border-border"
          }`}
        >
          {selected === null && (
            <Check className="w-2.5 h-2.5 text-background" strokeWidth={3} />
          )}
        </div>
        <span className={selected === null ? "text-foreground" : "text-muted-foreground"}>
          Sem modelo
        </span>
      </button>
    </div>
  );
}


