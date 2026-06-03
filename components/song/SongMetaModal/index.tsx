"use client";

import ResponsiveModal from "@/components/common/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

const songMetaSchema = z.object({
  title: z.string().min(1),
  artist: z.string().nullable(),
});

export type SongMeta = z.infer<typeof songMetaSchema>;

function useSongMetaSchema() {
  const t = useTranslations("SongForm");
  return z.object({
    title: z.string().min(1, t("cantBeEmpty")),
    artist: z.string().nullable(),
  });
}

type SongMetaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<SongMeta>;
  onSave: (values: SongMeta) => void;
  isNew?: boolean;
  loading?: boolean;
};

export default function SongMetaModal({
  open,
  onOpenChange,
  defaultValues,
  onSave,
  isNew = false,
  loading = false,
}: SongMetaModalProps) {
  const t = useTranslations();
  const schema = useSongMetaSchema();

  const form = useForm<SongMeta>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      artist: defaultValues?.artist ?? "",
    },
  });

  const { isValid } = form.formState;

  useEffect(() => {
    if (open) {
      form.reset({
        title: defaultValues?.title ?? "",
        artist: defaultValues?.artist ?? "",
      });
    }
  }, [open]);

  function handleSubmit(values: SongMeta) {
    onOpenChange(false);
    onSave(values);
  }

  const modalTitle = isNew ? t("Messages.newSong") : t("Messages.editSong");
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
                  <FormLabel>{t("SongData.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("SongData.titlePlaceholder")}
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
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("SongData.artist")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("SongData.artistPlaceholder")}
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
            <Button type="submit" variant="secondary" className="w-full" disabled={!isValid || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}
            </Button>
          </DrawerFooter>
        </form>
      </Form>
    </ResponsiveModal>
  );
}
