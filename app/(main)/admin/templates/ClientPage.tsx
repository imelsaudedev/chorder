"use client";

import { useDeleteTemplate, useFetchTemplates } from "@/app/api/api-client";
import { Button } from "@/components/ui/button";
import { ClientServiceTemplate } from "@/prisma/models";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { mutate } from "swr";

function TemplateEntry({ template }: { template: ClientServiceTemplate & { id: number } }) {
  const { deleteTemplate, isDeleting } = useDeleteTemplate(template.id);

  async function handleDelete() {
    if (!confirm(`Deletar o template "${template.name}"?`)) return;
    await deleteTemplate();
    mutate("/api/templates");
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <span className="flex-1 text-sm font-medium text-zinc-800">{template.name}</span>
      <Link href={`/admin/templates/${template.id}`}>
        <Button type="button" variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-800">
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-zinc-400 hover:text-red-500"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}

export default function ClientPage() {
  const { templates, isLoading } = useFetchTemplates();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Templates</h1>
        <Link href="/admin/templates/new">
          <Button type="button" variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Novo template
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <p className="text-sm text-zinc-400 py-12 text-center">
          Nenhum template criado ainda.
        </p>
      )}

      {!isLoading && templates.length > 0 && (
        <div className="rounded-lg border border-border px-4">
          {(templates as (ClientServiceTemplate & { id: number })[]).map((t) => (
            <TemplateEntry key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
