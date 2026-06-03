"use client";

import ResponsiveModal from "@/components/common/ResponsiveModal";
import DatePicker from "@/components/common/DatePicker";
import { Button } from "@/components/ui/button";
import { DrawerFooter } from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const serviceMetaSchema = z.object({
  title: z.string().min(1),
  worshipLeader: z.string().nullable(),
  date: z.coerce.date(),
});

export type ServiceMeta = z.infer<typeof serviceMetaSchema>;

function useServiceMetaSchema() {
  const t = useTranslations("SongForm");
  return z.object({
    title: z.string().min(1, t("cantBeEmpty")),
    worshipLeader: z.string().nullable(),
    date: z.coerce.date(),
  });
}

type ServiceMetaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<ServiceMeta>;
  onSave: (values: ServiceMeta) => void;
  isNew?: boolean;
};

export default function ServiceMetaModal({
  open,
  onOpenChange,
  defaultValues,
  onSave,
  isNew = false,
}: ServiceMetaModalProps) {
  const t = useTranslations();
  const schema = useServiceMetaSchema();

  const form = useForm<ServiceMeta>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      worshipLeader: defaultValues?.worshipLeader ?? "",
      date: defaultValues?.date ?? new Date(),
    },
  });

  const { isValid } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset({
        title: defaultValues?.title ?? "",
        worshipLeader: defaultValues?.worshipLeader ?? "",
        date: defaultValues?.date ?? new Date(),
      });
    }
  }, [open]);

  function handleSubmit(values: ServiceMeta) {
    onOpenChange(false);
    onSave(values);
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
                  <FormLabel>{t("ServiceData.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("ServiceData.titlePlaceholder")}
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
          </div>

          <DrawerFooter>
            <Button type="submit" variant="secondary" className="w-full" disabled={!isValid}>
              {submitLabel}
            </Button>
          </DrawerFooter>
        </form>
      </Form>
    </ResponsiveModal>
  );
}
