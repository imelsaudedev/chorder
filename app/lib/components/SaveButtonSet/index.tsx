import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@ui/button";

type SaveButtonSetProps = {
  cancelUrl?: string;
  enabled?: boolean;
};

export default function SaveButtonSet({
  cancelUrl,
  enabled = true,
}: SaveButtonSetProps) {
  const t = useTranslations("Messages");

  return (
    <div className="flex justify-end gap-2">
      {cancelUrl && (
        <Button variant="outline" asChild>
          <Link href={cancelUrl}>{t("cancel")}</Link>
        </Button>
      )}
      <Button type="submit" disabled={!enabled} variant="secondary">
        {t("save")}
      </Button>
    </div>
  );
}
