import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components-old/ui/form";
import { Input } from "@/components-old/ui/input";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { ArrangementFormSchema } from "./schema";

export default function InfoForm() {
  const t = useTranslations("SongData");
  const { control } = useFormContext<ArrangementFormSchema>();

  return (
    <div className="grow px-4 sm:px-6 lg:px-8 py-8 bg-indigo-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-primary mb-2">{t("title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("titlePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="artist"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-primary mb-2">{t("artist")}</FormLabel>
              <FormControl>
                <Input placeholder={t("artistPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
