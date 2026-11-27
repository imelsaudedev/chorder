"use client";

import { createContext, useContext } from "react";

const ServiceEditAccessContext = createContext(true);

/**
 * Se a pessoa pode editar a liturgia aberta (dona, compartilhada com permissão de editar, ou equipe
 * numa liturgia da igreja). Quem só visualiza não vê "Editar cifras". Fora do ServiceView vale true
 * (testes, histórias). O servidor é quem decide de verdade.
 */
export const ServiceEditAccessProvider = ServiceEditAccessContext.Provider;

export function useCanEditService(): boolean {
  return useContext(ServiceEditAccessContext);
}
