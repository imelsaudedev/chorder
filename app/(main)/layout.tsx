import NavBar from "@/components/common/NavBar";
import ContentWrapper from "./ContentWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-100vw flex">
      <NavBar />
      <ContentWrapper>{children}</ContentWrapper>
    </div>
  );
}
