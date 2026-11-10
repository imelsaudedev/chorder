import BackLink from "@/components/common/BackLink";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import ClientPage from "./ClientPage";

export const metadata = { title: "Modelos de liturgia" };

// Mesma estrutura da página de liturgias: título, lista e botão flutuante de criar.
export default function TemplatesPage() {
  return (
    <>
      <PageTitleBlock
        backLink={<BackLink href="/services" text="Liturgias" />}
        title="Modelos de liturgia"
      />

      <Main>
        <ClientPage />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
