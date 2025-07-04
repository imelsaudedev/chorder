import PageHeader from "@/components/common/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

export default function ServiceHeaderSkeleton() {
  const t = useTranslations("Messages");

  return (
    <PageHeader
      backLinkHref="/services"
      backLinkText={t("services")}
      title={<Skeleton className="h-10 w-72 my-2 bg-primary" />}
      subtitle={<Skeleton className="h-6 w-1/3 bg-zinc-500" />}
    />
  );
}
