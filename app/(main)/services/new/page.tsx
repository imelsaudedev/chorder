import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canManageChurchServices } from "@/lib/permissions";
import { buildSectionsFromTemplate } from "@/lib/template-utils";
import { retrieveTemplate } from "@/prisma/data";
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
  }>;
}) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fservices%2Fnew");
  }
  if (!canManageChurchServices(live.roles)) {
    return <AccessDeniedView />;
  }

  const { title, worshipLeader, preacher, date, templateId } =
    await searchParams;

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
      }}
    />
  );
}
