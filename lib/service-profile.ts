import type { ServiceUnitTypeValue } from "@/components/service/ServicePlanEditor/unitConfig";
import type { ClientServiceSection, ServiceScope } from "@/prisma/models";

const ALL_ITEM_TYPES: ServiceUnitTypeValue[] = ["SONG", "FALA", "LEITURA", "ORACAO", "AVISOS", "SERMAO", "OUTRO"];

/**
 * Perfil de liturgia: o que muda na experiência conforme o tipo.
 *
 * - **Igreja** (`CHURCH`): culto ou evento da comunidade, com equipe, modelos, dirigente e pregador.
 * - **Pessoal** (`PERSONAL`): roteiro de uma pessoa para um grupo pequeno, uma célula ou uma playlist.
 *
 * O perfil sai do `scope` da liturgia; telas e formulários consultam este registro em vez de
 * espalhar `scope === "PERSONAL"` pelo código. Acrescentar um perfil é acrescentar uma entrada.
 */
export type ServiceProfile = {
  /** Título obrigatório. Sem ele, a liturgia aparece como "Sem título". */
  titleRequired: boolean;
  /** Sugere o título a partir do modelo e da data (só faz sentido onde há modelos). */
  suggestTitle: boolean;
  /** Campo Pregador. */
  showPreacher: boolean;
  /** Escolha de modelo ao criar. */
  showTemplates: boolean;
  /** Como o campo de quem conduz se chama: "dirigente" (obrigatório na cultura da igreja) ou "conduz" (opcional). */
  leader: "dirigente" | "conduz";
  /** Tipos de item que o menu "Adicionar item" oferece (itens de outros tipos já salvos continuam aparecendo). */
  itemTypes: ServiceUnitTypeValue[];
  /** Seção com que uma liturgia nova começa. */
  defaultSection: Pick<ClientServiceSection, "type" | "label">;
  /** A pessoa escolhe o tipo da seção (Pré-culto, Culto…). Sem isso, a seção é só um nome. */
  chooseSectionType: boolean;
  /** Avisa que salvou (liturgias da igreja têm o fluxo de rascunho e publicação, que já avisa). */
  toastOnSave: boolean;
};

export const SERVICE_PROFILES: Record<ServiceScope, ServiceProfile> = {
  CHURCH: {
    titleRequired: true,
    suggestTitle: true,
    showPreacher: true,
    showTemplates: true,
    leader: "dirigente",
    itemTypes: ALL_ITEM_TYPES,
    defaultSection: { type: "CULTO", label: "Culto" },
    chooseSectionType: true,
    toastOnSave: false,
  },
  PERSONAL: {
    titleRequired: false,
    suggestTitle: false,
    showPreacher: false,
    showTemplates: false,
    leader: "conduz",
    // Sem Avisos e Sermão: não fazem sentido num roteiro de grupo pequeno ou playlist.
    itemTypes: ["SONG", "LEITURA", "ORACAO", "FALA", "OUTRO"],
    defaultSection: { type: "ESPECIAL", label: "Roteiro" },
    chooseSectionType: false,
    toastOnSave: true,
  },
};

/** Perfil de uma liturgia (ou escopo). Sem escopo informado vale o da igreja. */
export function serviceProfile(scope: ServiceScope | null | undefined): ServiceProfile {
  return SERVICE_PROFILES[scope ?? "CHURCH"];
}
