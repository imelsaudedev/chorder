import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

type InfoFormProps = {
  fieldPrefix?: string;
};

export default function SongInfoForm({ fieldPrefix = "" }: InfoFormProps) {
  const t = useTranslations("SongData");
  const { control } = useFormContext();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4 bg-secondary/10 border-b border-secondary/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`${fieldPrefix}song.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <Input placeholder={t("titlePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${fieldPrefix}song.artist`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("artist")}</FormLabel>
              <FormControl>
                <Input placeholder={t("artistPlaceholder")} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
