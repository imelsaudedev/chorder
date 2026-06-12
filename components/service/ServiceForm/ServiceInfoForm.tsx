import DatePicker from "@/components/common/DatePicker";
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

export default function ServiceInfoForm() {
  const t = useTranslations("ServiceData");
  const { control } = useFormContext();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-4 bg-secondary/10 border-b border-secondary/20">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("title")}</FormLabel>
            <FormControl>
              <Input placeholder={t("titlePlaceholder")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col md:flex-row gap-4">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="w-full md:w-72">
              <FormLabel>{t("date")}</FormLabel>
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
          control={control}
          name="worshipLeader"
          render={({ field }) => (
            <FormItem className="w-full md:w-64">
              <FormLabel>{t("worshipLeader")}</FormLabel>
              <FormControl>
                <Input placeholder={t("worshipLeaderPlaceholder")} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
