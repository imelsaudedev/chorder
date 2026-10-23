import TemplateEditor from "@/components/template/TemplateEditor";

export const metadata = { title: "Novo modelo" };

export default function NewTemplatePage() {
  return (
    <TemplateEditor
      name=""
      defaultStartTime=""
      sections={[]}
    />
  );
}
