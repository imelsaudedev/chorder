"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutTemplate, MoreVertical } from "lucide-react";
import Link from "next/link";

// Menu da lista de liturgias. Hoje só leva à edição dos modelos de liturgia, que
// deixou de ter um item próprio no menu de navegação.
export default function ServicesPageMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 cursor-pointer"
          aria-label="Mais opções da lista de liturgias"
        >
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="min-h-11 cursor-pointer">
          <Link href="/admin/templates">
            <LayoutTemplate size={16} className="mr-2" />
            Editar modelos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
