"use client";

import { useFetchServicesList, useFetchTemplates } from "@/app/api/api-client";
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
import { ServiceProfile, serviceProfile } from "@/lib/service-profile";
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
const buildSchema = (titleRequired: boolean, titleMessage: string) => z.object({
  title: titleRequired ? z.string().min(1, titleMessage) : z.string(),
  worshipLeader: z.string().nullable(),
  preacher: z.string().nullable(),
  // Boolean(...) de propósito: um `value !== null` estreitaria o tipo de saída e separaria
  // entrada e saída do formulário.
  date: z.date().nullable().refine((value) => Boolean(value), "Escolha a data"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Escolha a hora"),
});

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

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
  isPersonal?: boolean;
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
  isPersonal = false,
  defaultValues,
  loading = false,
  onSave,
}: ServicePlanDrawerProps) {
  const t = useTranslations();
  const profile = serviceProfile(isPersonal ? "PERSONAL" : "CHURCH");
  // O resolver é criado uma vez; lê o perfil atual por aqui (a gaveta serve a perfis diferentes).
  const titleMessage = t("ServiceData.titleRequired");
  const schemaRef = useRef(buildSchema(profile.titleRequired, titleMessage));
  schemaRef.current = buildSchema(profile.titleRequired, titleMessage);

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
    resolver: (values, context, options) => zodResolver(schemaRef.current)(values, context, options),
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
    if (!isNew || !profile.suggestTitle || isTitleDirty.current) return;
    const suggested = buildServiceTitle(selectedTemplate?.name, dateValue ? new Date(dateValue) : null);
    // Sem data ainda não há sugestão: não valida um campo vazio que a pessoa nem chegou a ver.
    form.setValue("title", suggested, { shouldValidate: suggested !== "" });
  }, [dateValue, selectedTemplate, isNew, profile.suggestTitle]); // eslint-disable-line react-hooks/exhaustive-deps

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
    ? isPersonal
      ? t("Messages.newPersonalService")
      : t("Messages.newCommunityService")
    : t("Messages.editServiceData");
  const submitLabel = isNew ? t("Messages.continue") : t("Messages.save");

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      {/* overflow-x-hidden: o drawer (vaul) tem um ::after com 200% da largura para o gesto de
          arrastar; com overflow-y-auto ele viraria rolagem horizontal. */}
      <DrawerContent className="flex flex-col max-w-sm overflow-y-auto overflow-x-hidden">
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
                  profile={profile}
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
                <EditFields form={form} profile={profile} />
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

/** "(opcional)" ao lado do rótulo, para campos que o perfil não exige. */
function OptionalMark() {
  return <span className="font-normal text-muted-foreground"> (opcional)</span>;
}

/** Rótulo de quem conduz: "Dirigente" na igreja; "Quem conduz (opcional)" no pessoal. */
function LeaderLabel({ profile }: { profile: ServiceProfile }) {
  const t = useTranslations("ServiceData");
  return (
    <FormLabel>
      {profile.leader === "conduz" ? t("leaderPersonal") : t("worshipLeader")}
      {profile.leader === "conduz" && <OptionalMark />}
    </FormLabel>
  );
}

function useLeaderPlaceholder(profile: ServiceProfile) {
  const t = useTranslations("ServiceData");
  return profile.leader === "conduz" ? t("leaderPersonalPlaceholder") : t("worshipLeaderPlaceholder");
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
  profile: ServiceProfile;
  selectedTemplate: ClientServiceTemplate | null | undefined;
  onSelectTemplate: (t: ClientServiceTemplate | null) => void;
  onTitleChange: () => void;
  onTimeChange: () => void;
};

/** Rótulo "Sugestão" e, abaixo dele, atalhos de um toque (chips do sistema: Button soft), acima do campo. */
function Suggestions({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5 pb-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function CreationFields({
  form,
  profile,
  selectedTemplate,
  onSelectTemplate,
  onTitleChange,
  onTimeChange,
}: CreationFieldsProps) {
  const t = useTranslations();
  const leaderPlaceholder = useLeaderPlaceholder(profile);
  // Mesma consulta (e cache) da lista de liturgias do mesmo tipo.
  const { services } = useFetchServicesList(profile.showTemplates ? "church" : "personal");

  // Liturgias existentes, para avisar quando o dia escolhido já tem uma.
  const existingServices = useMemo<{ slug: string; title: string | null; date: Date }[]>(
    () =>
      (Array.isArray(services) ? services : [])
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
  // Horários de início mais usados nas liturgias deste tipo (até 3): um toque preenche.
  const timeSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const service of services ?? []) {
      // O horário mora na data da liturgia (hora local). 00:00 é "sem horário" (cultos importados só com o dia).
      const time = timeFromDate(new Date(String(service.date)));
      if (time !== "00:00") counts.set(time, (counts.get(time) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([time]) => time)
      .sort();
  }, [services]);
  const sameDayServices = dateValue
    ? existingServices.filter((service) => isSameDay(service.date, new Date(dateValue)))
    : [];

  return (
    <>
      {/* 1. Modelo (só nos perfis que têm modelos) */}
      {profile.showTemplates && (
        <div>
          <p className="text-sm font-medium mb-2">Modelo</p>
          <TemplateSelector selected={selectedTemplate} onSelect={onSelectTemplate} />
        </div>
      )}

      {/* 2. Data */}
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("ServiceData.date")}</FormLabel>
            <Suggestions label={t("ServiceData.suggestion")}>
              <Button
                type="button"
                variant="soft"
                size="sm"
                aria-pressed={!!dateValue && isSameDay(new Date(dateValue), sunday)}
                onClick={() => form.setValue("date", sunday, { shouldValidate: true, shouldDirty: true })}
              >
                {!!dateValue && isSameDay(new Date(dateValue), sunday) && <Check className="size-3.5" aria-hidden />}
                {sundayLabel}
              </Button>
            </Suggestions>
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
            {timeSuggestions.length > 0 && (
              <Suggestions label={t("ServiceData.suggestion")}>
                {timeSuggestions.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant="soft"
                    size="sm"
                    aria-pressed={timeValue === time}
                    onClick={() => {
                      onTimeChange();
                      form.setValue("startTime", time, { shouldValidate: true, shouldDirty: true });
                    }}
                  >
                    {timeValue === time && <Check className="size-3.5" aria-hidden />}
                    {time}
                  </Button>
                ))}
              </Suggestions>
            )}
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
            <FormLabel>
              {t("ServiceData.title")}
              {!profile.titleRequired && <OptionalMark />}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={
                  profile.suggestTitle ? "Aparece depois de escolher a data" : t("ServiceData.titlePlaceholderPersonal")
                }
                {...field}
                className="h-11"
                onChange={(e) => {
                  onTitleChange();
                  field.onChange(e);
                }}
              />
            </FormControl>
            {profile.suggestTitle && (
              <p className="text-xs text-muted-foreground">
                Sugerido pelo modelo e pela data. Pode editar.
              </p>
            )}
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
            <LeaderLabel profile={profile} />
            <FormControl>
              <Input
                placeholder={leaderPlaceholder}
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
  profile: ServiceProfile;
};

function EditFields({ form, profile }: EditFieldsProps) {
  const t = useTranslations();
  const leaderPlaceholder = useLeaderPlaceholder(profile);
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("ServiceData.title")}
              {!profile.titleRequired && <OptionalMark />}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={profile.titleRequired ? t("ServiceData.titlePlaceholder") : t("ServiceData.titlePlaceholderPersonal")}
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
            <LeaderLabel profile={profile} />
            <FormControl>
              <Input
                placeholder={leaderPlaceholder}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {profile.showPreacher && (
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
      )}
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


