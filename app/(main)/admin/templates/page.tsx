import Main from "@/components/common/Main";
import ClientPage from "./ClientPage";

export const metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <Main>
      <div className="max-w-2xl mx-auto py-8">
        <ClientPage />
      </div>
    </Main>
  );
}
