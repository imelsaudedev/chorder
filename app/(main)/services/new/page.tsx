import { buildSectionsFromTemplate } from "@/lib/template-utils";
import { retrieveTemplate } from "@/prisma/data";
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
  const { title, worshipLeader, preacher, date, templateId } =
    await searchParams;

  const template =
    templateId ? await retrieveTemplate(Number(templateId)) : null;

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
