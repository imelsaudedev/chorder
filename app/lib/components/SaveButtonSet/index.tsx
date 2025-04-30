import { useTranslations } from "next-intl";
import Link from "next/link";
import useHrefWithParams from "@/hooks/useHrefWithParams";
import { Button } from "@ui/button";

type SaveButtonSetProps = {
  canCancel: boolean;
  enabled?: boolean;
};

export default function SaveButtonSet({
  canCancel,
  enabled = true,
}: SaveButtonSetProps) {
  const t = useTranslations("Messages");
  const createHrefWithParam = useHrefWithParams();

  return (
    <div className="flex justify-end gap-2">
      {canCancel && (
        <Button variant="outline" asChild>
          <Link href={createHrefWithParam("edit", "false")}>{t("cancel")}</Link>
        </Button>
      )}
      <Button type="submit" disabled={!enabled} variant="secondary">
        {t("save")}
      </Button>
    </div>
  );
}
