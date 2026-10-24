"use client";

import { createContext, useContext } from "react";
import { PlanMode } from "./unitSummary";

// Diz aos componentes da linha do tempo se estão mostrando um culto ("plan", o
// padrão) ou o esqueleto de um template ("template"). No template os itens não
// ficam "pendentes", e Música é só um espaço (sem escolher música). O
// TemplateEditor envolve a timeline e os formulários com este provedor.
const PlanModeContext = createContext<PlanMode>("plan");

export const PlanModeProvider = PlanModeContext.Provider;

export function usePlanMode(): PlanMode {
  return useContext(PlanModeContext);
}
