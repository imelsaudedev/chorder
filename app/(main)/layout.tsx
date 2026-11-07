import NavBar from "@/components/common/NavBar";
import UserNav from "@/components/common/UserNav";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-100vw flex">
      {/* Sidebar fixa */}
      <NavBar userNav={<UserNav />} />

      {/* Conteúdo principal com deslocamento para a direita em telas grandes */}
      <div className="flex flex-col grow ml-0 sm:ml-20 max-w-full">
        {children}
      </div>
    </div>
  );
}
