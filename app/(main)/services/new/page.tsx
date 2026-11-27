import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canManageChurchServices } from "@/lib/permissions";
import { buildSectionsFromTemplate } from "@/lib/template-utils";
import { retrieveTemplate } from "@/prisma/data";
import type { ServiceScope } from "@prisma/client";
import { redirect } from "next/navigation";
import { joinLeaderNames, normalizeLeaders, type ServiceLeaderEntry } from "@/lib/service-leaders";
import ClientServiceFormPage from "../ClientServiceFormPage";

/** Dirigentes vindos da gaveta pela URL (JSON). Qualquer coisa fora do formato vira lista vazia. */
function parseLeaders(raw: string | undefined): ServiceLeaderEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeLeaders(
      parsed.flatMap((item) =>
        item && typeof item.name === "string"
          ? [{ userId: typeof item.userId === "string" ? item.userId : null, name: item.name }]
          : []
      )
    );
  } catch {
    return [];
  }
}

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    leaders?: string;
    preacher?: string;
    preacherId?: string;
    date?: string;
    templateId?: string;
    scope?: string;
  }>;
}) {
  const [{ title, leaders: leadersParam, preacher, preacherId, date, templateId, scope }, live] =
    await Promise.all([searchParams, getLiveUserAuth()]);

  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fservices%2Fnew");
  }

  const targetScope: ServiceScope =
    scope?.toLowerCase() === "personal" ? "PERSONAL" : "CHURCH";

  if (targetScope === "CHURCH" && !canManageChurchServices(live.roles)) {
    return <AccessDeniedView />;
  }

  const leaders = parseLeaders(leadersParam);

  const template = templateId ? await retrieveTemplate(Number(templateId)) : null;

  const defaultSections = template
    ? buildSectionsFromTemplate(template)
    : undefined;

  return (
    <ClientServiceFormPage
      serviceSlug={null}
      defaultMeta={{
        title: title ?? "",
        worshipLeader: joinLeaderNames(leaders.map((l) => l.name)),
        leaders,
        preacher: preacher ?? "",
        preacherId: preacherId ?? null,
        date: date ? new Date(date) : new Date(),
        sections: defaultSections,
        scope: targetScope,
      }}
    />
  );
}
