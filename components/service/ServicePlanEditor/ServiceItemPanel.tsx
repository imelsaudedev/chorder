"use client";

import { DrawerTitle } from "@/components/ui/drawer";
import { ClientServiceUnit } from "@/prisma/models";
import { ArrowLeft, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import {
  AvisosUnitForm,
  FalaUnitForm,
  LeituraUnitForm,
  SermaoUnitForm,
  SongSlotForm,
  UnitFormHandle,
} from "./ServiceItemForms";

// Casca visual comum do editor de item: cabeçalho com ícone do tipo, corpo e
// rodapé (fornecido por quem usa). No desktop é um cartão ao lado da timeline;
// no celular (variant "drawer") ocupa o conteúdo do drawer.
//
// Altura: o painel mora numa faixa ao lado da timeline (fora da área que rola)
// e herda a altura dela (`h-full` / `max-h-full`), então nunca passa por baixo
// do rodapé do editor.
export function PanelShell({
  title,
  iconType,
  tall = false,
  variant = "panel",
  onBack,
  onClose,
  children,
}: {
  title: string;
  iconType: ServiceUnitTypeValue;
  tall?: boolean;
  variant?: "panel" | "drawer";
  onBack?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const config = UNIT_CONFIG[iconType];
  const Icon = config?.icon;
  const isDrawer = variant === "drawer";

  const containerClass = isDrawer
    ? "flex min-h-0 flex-1 flex-col"
    : `flex w-[400px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg ${
        tall ? "h-full" : "max-h-full"
      }`;

  const titleClass = "flex-1 truncate text-sm font-semibold";

  return (
    <div className={containerClass}>
      <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          Icon && (
            <span className={`flex size-11 shrink-0 items-center justify-center ${config.color}`} aria-hidden="true">
              <Icon className="w-5 h-5" />
            </span>
          )
        )}
        {isDrawer ? (
          <DrawerTitle className={titleClass}>{title}</DrawerTitle>
        ) : (
          <h2 className={titleClass}>{title}</h2>
        )}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  );
}

type ServiceItemPanelProps = {
  unit: ClientServiceUnit;
  isNew: boolean;
  variant?: "panel" | "drawer";
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onDiscard: () => void;
  onClose: () => void;
};

// Painel de edição dos itens que não são música. Expõe `discardIfBlank` via
// ref: diferente do drawer (que cobre a tela e só tem um jeito real de
// "sair"), aqui a timeline continua clicável com o painel aberto — o
// componente pai (ServicePlanEditor) chama isso antes de trocar pra outro
// item ou fechar, pra não deixar um item recém-criado e nunca preenchido
// perdido no plano.
const ServiceItemPanel = forwardRef<UnitFormHandle, ServiceItemPanelProps>(function ServiceItemPanel(
  { unit, isNew, variant = "panel", onUpdate, onDiscard, onClose },
  ref
) {
  const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
  const formRef = useRef<UnitFormHandle>(null);

  useImperativeHandle(ref, () => ({
    discardIfBlank: () => formRef.current?.discardIfBlank(),
  }));

  return (
    <PanelShell
      title={config?.label ?? unit.type}
      iconType={unit.type as ServiceUnitTypeValue}
      variant={variant}
      onClose={onClose}
    >
      {unit.type === "SONG" && (
        <SongSlotForm
          ref={formRef}
          unit={unit}
          isNew={isNew}
          onUpdate={onUpdate}
          onDiscard={onDiscard}
          onDone={onClose}
        />
      )}
      {(unit.type === "FALA" || unit.type === "ORACAO") && (
        <FalaUnitForm
          ref={formRef}
          unit={unit}
          unitType={unit.type}
          isNew={isNew}
          onUpdate={onUpdate}
          onDiscard={onDiscard}
          onDone={onClose}
        />
      )}
      {unit.type === "LEITURA" && (
        <LeituraUnitForm
          ref={formRef}
          unit={unit}
          isNew={isNew}
          onUpdate={onUpdate}
          onDiscard={onDiscard}
          onDone={onClose}
        />
      )}
      {unit.type === "SERMAO" && (
        <SermaoUnitForm
          ref={formRef}
          unit={unit}
          isNew={isNew}
          onUpdate={onUpdate}
          onDiscard={onDiscard}
          onDone={onClose}
        />
      )}
      {unit.type === "AVISOS" && (
        <AvisosUnitForm
          ref={formRef}
          unit={unit}
          isNew={isNew}
          onUpdate={onUpdate}
          onDiscard={onDiscard}
          onDone={onClose}
        />
      )}
    </PanelShell>
  );
});

export default ServiceItemPanel;
