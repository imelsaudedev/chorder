import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canManageChurchServices } from "@/lib/permissions";
import { buildSectionsFromTemplate } from "@/lib/template-utils";
import { retrieveTemplate } from "@/prisma/data";
import type { ServiceScope } from "@prisma/client";
import { redirect } from "next/navigation";
import ClientServiceFormPage from "../ClientServiceFormPage";

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    worshipLeader?: string;
    preacher?: string;
    date?: string;
    templateId?: string;
    scope?: string;
  }>;
}) {
  const [{ title, worshipLeader, preacher, date, templateId, scope }, live] =
    await Promise.all([searchParams, getLiveUserAuth()]);

  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fservices%2Fnew");
  }

  const targetScope: ServiceScope =
    scope?.toLowerCase() === "personal" ? "PERSONAL" : "CHURCH";

  if (targetScope === "CHURCH" && !canManageChurchServices(live.roles)) {
    return <AccessDeniedView />;
  }

  const template = templateId ? await retrieveTemplate(Number(templateId)) : null;

  const defaultSections = template
    ? buildSectionsFromTemplate(template)
    : undefined;

  return (
    <ClientServiceFormPage
      serviceSlug={null}
      defaultMeta={{
        title: title ?? "",
        worshipLeader: worshipLeader ?? "",
        preacher: preacher ?? "",
        date: date ? new Date(date) : new Date(),
        sections: defaultSections,
        scope: targetScope,
      }}
    />
  );
}
