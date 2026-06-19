import TemplateEditor from "@/components/template/TemplateEditor";

export const metadata = { title: "Novo template" };

export default function NewTemplatePage() {
  return (
    <TemplateEditor
      name=""
      defaultStartTime=""
      sections={[]}
    />
  );
}
