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
    <div className="grow space-y-4 px-4 sm:px-6 lg:px-8 py-8 bg-indigo-50">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem className="flex flex-col space-y-0">
            <FormLabel className="text-primary mb-2">{t("title")}</FormLabel>
            <FormControl>
              <Input placeholder={t("titlePlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col md:flex-row gap-4 justify-start">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-0 w-full md:w-72">
              <FormLabel className="text-primary mb-2">{t("date")}</FormLabel>
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
            <FormItem className="flex flex-col space-y-0 w-full md:w-64">
              {" "}
              <FormLabel className="text-primary mb-2">
                {t("worshipLeader")}
              </FormLabel>
              <FormControl>
                <Input placeholder={t("worshipLeaderPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
