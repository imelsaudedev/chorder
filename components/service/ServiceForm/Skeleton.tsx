import PageHeader from "@/components/common/PageHeader";
import SaveButtonSet from "@/components/common/SaveButtonSet";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { ServiceInfoFormSkeleton } from "./ServiceInfoFormSkeleton";
import ServiceUnitListFormSkeleton from "./ServiceUnitListForm/Skeleton";

export default function ServiceFormSkeleton() {
  const t = useTranslations("Messages");

  const searchParams = useSearchParams().toString();
  const pathname = usePathname().replace("/edit", "");
  const cancelUrl = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  return (
    <div>
      <PageHeader
        title={t("editService")}
        actions={<SaveButtonSet cancelUrl={cancelUrl} enabled={false} />}
        variant="edit"
      />
      <ServiceInfoFormSkeleton />
      <ServiceUnitListFormSkeleton />
    </div>
  );
}
