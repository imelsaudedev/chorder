"use client";

import { ClientServiceUnit } from "@/prisma/models";
import { X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { UNIT_CONFIG, ServiceUnitTypeValue } from "./unitConfig";
import {
  AvisosUnitForm,
  FalaUnitForm,
  LeituraUnitForm,
  SermaoUnitForm,
  UnitFormHandle,
} from "./ServiceItemForms";

type ServiceItemPanelProps = {
  unit: ClientServiceUnit;
  isNew: boolean;
  onUpdate: (changes: Partial<ClientServiceUnit>) => void;
  onDiscard: () => void;
  onClose: () => void;
};

// Cartão flutuante de edição, sempre visível ao lado da timeline no desktop
// (não cobre a tela, ao contrário do drawer usado no mobile e pra Música).
// `sticky top-4`: como fica dentro do mesmo contêiner que rola junto com a
// timeline, gruda no topo da área visível enquanto o conteúdo atrás rola —
// não usa `fixed` porque isso escaparia do fluxo e exigiria compensar o
// espaço manualmente na coluna da timeline.
//
// Expõe `discardIfBlank` via ref: diferente do drawer (que cobre a tela e só
// tem um jeito real de "sair"), aqui a timeline continua clicável com o
// painel aberto — o componente pai (ServicePlanEditor) chama isso antes de
// trocar pra outro item ou fechar, pra não deixar um item recém-criado e
// nunca preenchido perdido no plano.
const ServiceItemPanel = forwardRef<UnitFormHandle, ServiceItemPanelProps>(function ServiceItemPanel(
  { unit, isNew, onUpdate, onDiscard, onClose },
  ref
) {
  const config = UNIT_CONFIG[unit.type as ServiceUnitTypeValue];
  const formRef = useRef<UnitFormHandle>(null);

  useImperativeHandle(ref, () => ({
    discardIfBlank: () => formRef.current?.discardIfBlank(),
  }));

  return (
    <div className="sticky top-4 w-[380px] shrink-0 rounded-lg border border-zinc-200 bg-white shadow-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
        <span className="flex-1 text-sm font-semibold text-zinc-800">
          {config?.label ?? unit.type}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-4 max-h-[calc(100dvh-8rem)] overflow-y-auto">
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
      </div>
    </div>
  );
});

export default ServiceItemPanel;
