import Main from "@/components/common/Main";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function AccessDeniedView() {
  const t = await getTranslations("Auth");

  return (
    <Main>
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-xs space-y-4">
          <div
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger-subtle text-danger-text"
          >
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Text variant="heading-lg" as="h1">
              {t("accessDeniedTitle")}
            </Text>
            <Text variant="caption" as="p">
              {t("accessDeniedDescription")}
            </Text>
          </div>
          <div className="pt-2">
            <Button asChild variant="secondary">
              <Link href="/songs">{t("backToSongs")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Main>
  );
}
