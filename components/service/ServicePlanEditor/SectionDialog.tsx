"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientServiceSection, SERVICE_SECTION_TYPES, ServiceSectionType } from "@/prisma/models";
import { useEffect, useState } from "react";
import { SECTION_TYPE_LABEL } from "./unitSummary";

export type SectionDialogValues = {
  label: string;
  type: ServiceSectionType;
};

type SectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Seção sendo editada; `null` para criar uma nova. */
  section: Pick<ClientServiceSection, "label" | "type"> | null;
  onSubmit: (values: SectionDialogValues) => void;
};

export default function SectionDialog({ open, onOpenChange, section, onSubmit }: SectionDialogProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ServiceSectionType>("ESPECIAL");

  // Recarrega os campos toda vez que o diálogo abre.
  useEffect(() => {
    if (!open) return;
    setLabel(section?.label ?? "");
    setType(section?.type ?? "ESPECIAL");
  }, [open, section]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ label: label.trim() || SECTION_TYPE_LABEL[type], type });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{section ? "Editar seção" : "Adicionar seção"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="section-label">Nome da seção</Label>
            <Input
              id="section-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={SECTION_TYPE_LABEL[type]}
              autoComplete="off"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="section-type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as ServiceSectionType)}>
              <SelectTrigger id="section-type" className="w-full cursor-pointer data-[size=default]:h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_SECTION_TYPES.map((value) => (
                  <SelectItem key={value} value={value} className="cursor-pointer">
                    {SECTION_TYPE_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" className="h-11">
              {section ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
