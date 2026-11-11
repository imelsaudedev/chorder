import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ClientServicesPage from "./ClientServicesPage";
import NewServiceProvider from "./NewServiceProvider";
import ServicesHeaderActions from "./ServicesHeaderActions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Messages");
  return { title: t("services") };
}

export default async function ServiceListPage() {
  const t = await getTranslations();

  return (
    <NewServiceProvider>
      <PageTitleBlock title={t("Messages.services")} actions={<ServicesHeaderActions />} />

      <Main>
        <ClientServicesPage />
      </Main>

      <ScrollToTopButton />
    </NewServiceProvider>
  );
}
