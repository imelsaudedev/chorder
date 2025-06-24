import NavBar from "@/components/common/NavBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar fixa */}
      <NavBar />

      {/* Conteúdo principal com deslocamento para a direita em telas grandes */}
      <div className="flex flex-col grow ml-0 sm:ml-20">{children}</div>
    </div>
  );
}
