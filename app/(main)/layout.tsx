import NavBar from "@/components/common/NavBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import ContentWrapper from "./ContentWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="max-w-100vw flex">
        <NavBar />
        <ContentWrapper>{children}</ContentWrapper>
      </div>
    </TooltipProvider>
  );
}
