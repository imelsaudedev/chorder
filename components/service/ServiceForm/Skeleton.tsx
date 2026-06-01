"use client";

import FormFooter from "@/components/common/FormFooter";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import ServiceUnitListFormSkeleton from "./ServiceUnitListForm/Skeleton";

export default function ServiceFormSkeleton() {
  const t = useTranslations("Messages");

  return (
    <div className="flex flex-col h-dvh">
      <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-secondary/20">
        <div className="flex items-center gap-2 min-w-0">
          <Text variant="heading-lg" className="text-muted-foreground truncate">
            {t("editService")}
          </Text>
          <Pencil className="w-4 h-4 shrink-0 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ServiceUnitListFormSkeleton />
      </div>

      <FormFooter
        disabled
        label={t("saveService")}
        cancelButton={
          <Button type="button" variant="outline" disabled>
            {t("cancel")}
          </Button>
        }
      />
    </div>
  );
}
