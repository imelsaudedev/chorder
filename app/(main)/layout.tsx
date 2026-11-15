import NavBar from "@/components/common/NavBar";
import UserNav from "@/components/common/UserNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import ContentWrapper from "./ContentWrapper";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="max-w-100vw flex">
        <div className="stage-mode-hidden">
          <NavBar userNav={<UserNav />} />
        </div>
        <ContentWrapper>{children}</ContentWrapper>
      </div>
    </TooltipProvider>
  );
}
