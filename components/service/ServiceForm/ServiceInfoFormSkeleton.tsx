import DatePicker from "@/components/common/DatePicker";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export function ServiceInfoFormSkeleton() {
  const t = useTranslations("ServiceData");

  return (
    <div className="grow space-y-4 px-4 sm:px-6 lg:px-8 py-8 bg-indigo-50">
      <div className="flex flex-col space-y-0">
        <label className="text-primary mb-2">{t("title")}</label>
        <Input placeholder={t("titlePlaceholder")} disabled={true} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-start">
        <div className="flex flex-col space-y-0 w-full md:w-72">
          <label className="text-primary mb-2">{t("date")}</label>
          <DatePicker buttonProps={{ className: "w-full" }} disabled={true} />
        </div>

        <div className="flex flex-col space-y-0 w-full md:w-64">
          <label className="text-primary mb-2">{t("worshipLeader")}</label>
          <Input placeholder={t("worshipLeaderPlaceholder")} disabled={true} />
        </div>
      </div>
    </div>
  );
}
