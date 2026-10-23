"use client";

import { useDeleteTemplate, useFetchTemplates } from "@/app/api/api-client";
import FloatingAddLink from "@/components/common/FloatingAddLink";
import Text from "@/components/common/Text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeTemplate } from "@/lib/template-utils";
import { ClientServiceTemplate } from "@/prisma/models";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mutate } from "swr";

type TemplateWithId = ClientServiceTemplate & { id: number };

// Mesmo desenho de uma linha da lista de liturgias: título, uma linha de resumo,
// link em toda a área da linha e menu ⋮ com as ações.
function TemplateEntry({ template }: { template: TemplateWithId }) {
  const router = useRouter();
  const { deleteTemplate, isDeleting } = useDeleteTemplate(template.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const href = `/admin/templates/${template.id}`;

  async function handleDelete() {
    await deleteTemplate();
    mutate("/api/templates");
    setConfirmOpen(false);
  }

  return (
    <li className="group relative -mx-2 flex items-center gap-1 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50">
      {/* Link sobre a linha inteira; o menu fica acima dele */}
      <a href={href} className="absolute inset-0 z-0 cursor-pointer" aria-label={template.name} />

      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold leading-snug tracking-tight text-primary lg:text-lg lg:leading-tight">
          {template.name}
        </p>
        <Text variant="caption" as="p" className="mt-0.5 truncate text-xs md:text-sm">
          {summarizeTemplate(template)}
        </Text>
      </div>

      {/* Em telas de toque não há hover, então o menu fica sempre visível */}
      <div className="relative z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 cursor-pointer"
              aria-label={`Ações do modelo ${template.name}`}
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="min-h-11 cursor-pointer" onSelect={() => router.push(href)}>
              <Pencil size={14} className="mr-2" />
              Editar modelo
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="min-h-11 cursor-pointer"
              onSelect={() => setConfirmOpen(true)}
            >
              <Trash2 size={14} className="mr-2" />
              Apagar modelo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar o modelo “{template.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Os cultos já criados a partir dele não mudam. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="cursor-pointer"
            >
              {isDeleting ? "Apagando…" : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {[55, 40, 65].map((width, i) => (
        <li key={i} className="flex flex-col gap-2 py-3.5">
          <Skeleton className="h-5" style={{ width: `${width}%` }} />
          <Skeleton className="h-4 w-1/3" />
        </li>
      ))}
    </ul>
  );
}

export default function ClientPage() {
  const { templates, isLoading } = useFetchTemplates();
  const list = (templates ?? []) as TemplateWithId[];

  return (
    <>
      {isLoading && <ListSkeleton />}

      {!isLoading && list.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum modelo criado ainda. Um modelo é um esqueleto de culto (seções, itens e
          durações) para começar uma liturgia nova mais rápido.
        </p>
      )}

      {!isLoading && list.length > 0 && (
        <ul className="divide-y divide-border">
          {list.map((template) => (
            <TemplateEntry key={template.id} template={template} />
          ))}
        </ul>
      )}

      <FloatingAddLink label="Novo modelo" href="/admin/templates/new" />
    </>
  );
}
