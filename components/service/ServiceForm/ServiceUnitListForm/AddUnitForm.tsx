import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function AddUnitFormSkeleton() {
  const t = useTranslations("Messages");

  return (
    <div className="rounded-lg break-inside-avoid p-4 mb-2 border border-border border-dashed bg-muted/40">
      <div className="group flex items-center gap-2 w-full cursor-pointer">
        <Button variant="outline" disabled>
          {t("loading")}
        </Button>
      </div>
    </div>
  );
}
