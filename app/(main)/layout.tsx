import { ViewerProvider } from "@/components/auth/ViewerProvider";
import NavBar from "@/components/common/NavBar";
import NotificationsBell from "@/components/common/NotificationsBell";
import UserNav from "@/components/common/UserNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getLiveUserAuth } from "@/lib/auth-guard";
import { canAccessAdmin } from "@/lib/permissions";
import ContentWrapper from "./ContentWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const live = await getLiveUserAuth();
  const isAuthenticated = live.authenticated;
  const isAdmin = canAccessAdmin(live.roles);

  return (
    <ViewerProvider authenticated={isAuthenticated} roles={live.roles}>
      <TooltipProvider>
        <div className="max-w-100vw flex">
          <div className="stage-mode-hidden">
            <NavBar
              userNav={<UserNav />}
              notificationsNav={<NotificationsBell />}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
            />
          </div>
          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </TooltipProvider>
    </ViewerProvider>
  );
}
