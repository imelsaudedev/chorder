"use client";

import ResponsiveModal from "@/components/common/ResponsiveModal";
import DatePicker from "@/components/common/DatePicker";
import { Button } from "@/components/ui/button";
import { DrawerFooter } from "@/components/ui/drawer";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PeopleField from "@/components/service/PeopleField";
import { Input } from "@/components/ui/input";
import { joinLeaderNames, leadersOf } from "@/lib/service-leaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceProfile } from "@/lib/service-profile";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const leadersSchema = z.array(z.object({ userId: z.string().nullable(), name: z.string() }));

/** O que o formulário edita; `worshipLeader` (texto) é derivado das pessoas ao salvar. */
export type ServiceMeta = {
  title: string;
  worshipLeader: string | null;
  leaders: z.infer<typeof leadersSchema>;
  date: Date;
};

function useServiceMetaSchema(titleRequired: boolean) {
  const t = useTranslations("SongForm");
  return z.object({
    title: titleRequired ? z.string().min(1, t("cantBeEmpty")) : z.string(),
    leaders: leadersSchema,
    date: z.coerce.date(),
  });
}

type FormValues = z.infer<ReturnType<typeof useServiceMetaSchema>>;

type ServiceMetaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<ServiceMeta>;
  onSave: (values: ServiceMeta) => void | false;
  isNew?: boolean;
  loading?: boolean;
  /** Liturgia pessoal: título opcional e "Quem conduz" no lugar de "Dirigente". */
  isPersonal?: boolean;
};

export default function ServiceMetaModal({
  open,
  onOpenChange,
  defaultValues,
  onSave,
  isNew = false,
  loading = false,
  isPersonal = false,
}: ServiceMetaModalProps) {
  const t = useTranslations();
  const profile = serviceProfile(isPersonal ? "PERSONAL" : "CHURCH");
  const schema = useServiceMetaSchema(profile.titleRequired);

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      leaders: leadersOf(defaultValues ?? {}),
      date: defaultValues?.date ?? new Date(),
    },
  });

  const { isValid } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset({
        title: defaultValues?.title ?? "",
        leaders: leadersOf(defaultValues ?? {}),
        date: defaultValues?.date ?? new Date(),
      });
    }
  }, [open]);

  function handleSubmit(values: FormValues) {
    const leaders = leadersOf({ leaders: values.leaders });
    const result = onSave({
      title: values.title,
      worshipLeader: joinLeaderNames(leaders.map((l) => l.name)),
      leaders,
      date: values.date,
    });
    if (result !== false) onOpenChange(false);
  }

  const modalTitle = isNew ? t("Messages.newService") : t("Messages.editServiceData");
  const submitLabel = isNew ? t("Messages.continue") : t("Messages.save");

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={modalTitle}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1">
          <div className="px-4 space-y-4 pb-2 flex-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("ServiceData.title")}
                    {!profile.titleRequired && <span className="font-normal text-muted-foreground"> (opcional)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={profile.titleRequired ? t("ServiceData.titlePlaceholder") : t("ServiceData.titlePlaceholderPersonal")}
                      autoFocus
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
              name="leaders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {profile.leader === "conduz" ? t("ServiceData.leaderPersonal") : t("ServiceData.worshipLeader")}
                    {profile.leader === "conduz" && (
                      <span className="font-normal text-muted-foreground"> (opcional)</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <PeopleField
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        profile.leader === "conduz"
                          ? t("ServiceData.leaderPersonalPlaceholder")
                          : t("ServiceData.worshipLeaderPlaceholder")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DrawerFooter>
            <Button type="submit" variant="secondary" className="w-full" disabled={!isValid || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
            </Button>
          </DrawerFooter>
        </form>
      </Form>
    </ResponsiveModal>
  );
}
