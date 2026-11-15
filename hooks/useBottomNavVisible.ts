"use client";

import { usePathname } from "next/navigation";

// Mesmo critério do NavBar: barra inferior só existe nas páginas de lista
// (/songs, /services — não em detalhe nem edição) e só no mobile (isso a
// própria barra resolve via sm:hidden). Extraído aqui porque a barra de
// mídia (MediaPlayerBar), global, precisa saber se tem navegação por cima
// de que escapar, sem duplicar a lógica de rota em dois lugares.
export function useBottomNavVisible(): boolean {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const isEditPage = pathname.includes("/edit") || pathname.endsWith("/new") ||
    (pathname.startsWith("/admin/templates/") && pathParts.length > 3);
  const isListPage = pathParts.length === 2;
  return isListPage && !isEditPage;
}
