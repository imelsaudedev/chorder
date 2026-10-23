import TemplateEditor from "@/components/template/TemplateEditor";
import { retrieveTemplate } from "@/prisma/data";
import { buildSectionsFromTemplate, getTemplateDefaultStartTime } from "@/lib/template-utils";
import { notFound } from "next/navigation";

export const metadata = { title: "Editar template" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await retrieveTemplate(parseInt(id));

  if (!template) return notFound();

  const sections = buildSectionsFromTemplate(template);
  const defaultStartTime = getTemplateDefaultStartTime(template) ?? "";

  return (
    <TemplateEditor
      id={template.id}
      name={template.name}
      defaultStartTime={defaultStartTime}
      sections={sections}
    />
  );
}
