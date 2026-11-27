import type { ServiceScope } from "@/prisma/models";

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
};

export const SERVICE_PROFILES: Record<ServiceScope, ServiceProfile> = {
  CHURCH: {
    titleRequired: true,
    suggestTitle: true,
    showPreacher: true,
    showTemplates: true,
    leader: "dirigente",
  },
  PERSONAL: {
    titleRequired: false,
    suggestTitle: false,
    showPreacher: false,
    showTemplates: false,
    leader: "conduz",
  },
};

/** Perfil de uma liturgia (ou escopo). Sem escopo informado vale o da igreja. */
export function serviceProfile(scope: ServiceScope | null | undefined): ServiceProfile {
  return SERVICE_PROFILES[scope ?? "CHURCH"];
}
