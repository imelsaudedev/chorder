import Main from "@/components/common/Main";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import { Link2Off, ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type AccessDeniedViewProps = {
  /** "page": área restrita a quem tem perfil. "link": liturgia aberta por link/endereço sem acesso. */
  variant?: "page" | "link";
  /** Só no variant "link": quem não entrou ganha o botão Entrar, voltando para esta mesma liturgia. */
  signInCallbackUrl?: string;
};

export default async function AccessDeniedView({ variant = "page", signInCallbackUrl }: AccessDeniedViewProps = {}) {
  const t = await getTranslations("Auth");
  const isLink = variant === "link";
  const Icon = isLink ? Link2Off : ShieldAlert;
  const description = isLink
    ? signInCallbackUrl
      ? t("linkUnavailableVisitorDescription")
      : t("linkUnavailableDescription")
    : t("accessDeniedDescription");

  return (
    <Main>
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-xs space-y-4">
          <div
            aria-hidden="true"
            className={
              isLink
                ? "mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                : "mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger-subtle text-danger-text"
            }
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Text variant="heading-lg" as="h1">
              {isLink ? t("linkUnavailableTitle") : t("accessDeniedTitle")}
            </Text>
            <Text variant="caption" as="p">
              {description}
            </Text>
          </div>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            {isLink && signInCallbackUrl && (
              <Button asChild variant="default">
                <Link href={`/login?callbackUrl=${encodeURIComponent(signInCallbackUrl)}`}>{t("signIn")}</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="/songs">{t("backToSongs")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </Main>
  );
}
