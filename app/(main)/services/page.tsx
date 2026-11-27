import Main from "@/components/common/Main";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import { getLiveUserAuth } from "@/lib/auth-guard";
import {
  canAccessAdmin,
  canManageChurchServices,
  canViewChurchServices,
} from "@/lib/permissions";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import ClientServicesPage from "./ClientServicesPage";
import NewServiceProvider from "./NewServiceProvider";
import ServicesHeaderActions from "./ServicesHeaderActions";

// Quem não vê as liturgias da igreja só tem as próprias: a página se chama "Minhas liturgias".
export async function generateMetadata(): Promise<Metadata> {
  const [t, tService, live] = await Promise.all([
    getTranslations("Messages"),
    getTranslations("Service"),
    getLiveUserAuth(),
  ]);
  return { title: canViewChurchServices(live.roles) ? t("services") : tService("tabPersonal") };
}

export default async function ServiceListPage() {
  const [t, live] = await Promise.all([getTranslations(), getLiveUserAuth()]);
  if (!live.authenticated) {
    redirect("/login?callbackUrl=%2Fservices");
  }

  const canViewChurch = canViewChurchServices(live.roles);
  const canManageChurch = canManageChurchServices(live.roles);
  const isAdmin = canAccessAdmin(live.roles);

  return (
    <NewServiceProvider defaultScope={canViewChurch ? "CHURCH" : "PERSONAL"}>
      <PageTitleBlock
        title={canViewChurch ? t("Messages.services") : t("Service.tabPersonal")}
        actions={
          <ServicesHeaderActions
            canManageChurch={canManageChurch}
            isAdmin={isAdmin}
          />
        }
      />

      <Main>
        <ClientServicesPage
          canViewChurch={canViewChurch}
          canManageChurch={canManageChurch}
        />
      </Main>

      <ScrollToTopButton />
    </NewServiceProvider>
  );
}
