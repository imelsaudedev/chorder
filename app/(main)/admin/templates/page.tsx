import BackLink from "@/components/common/BackLink";
import Heading from "@/components/common/Heading";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import ClientPage from "./ClientPage";

export const metadata = { title: "Modelos de liturgia" };

// Mesma estrutura da página de liturgias: título, lista e botão flutuante de criar.
export default function TemplatesPage() {
  return (
    <>
      <div className="px-5 sm:px-8 lg:px-14 pt-6 sm:pt-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="mb-2"><BackLink href="/services" text="Liturgias" /></div>
        <Heading level={1}>Modelos de liturgia</Heading>
      </div>

      <Main>
        <ClientPage />
      </Main>

      <ScrollToTopButton />
    </>
  );
}
