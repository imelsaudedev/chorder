"use client";

import {
  canAccessAdmin,
  canEditSongs,
  canSeeUsageStats,
  canViewChurchServices,
} from "@/lib/permissions";
import type { UserRole } from "@prisma/client";
import { createContext, ReactNode, useContext, useMemo } from "react";

/**
 * O que a pessoa que está usando o app pode fazer, para as telas esconderem o que ela não pode usar
 * (em vez de mostrar botões desabilitados). Os perfis vêm do servidor (`getLiveUserAuth`, que já
 * considera a simulação de perfis do Admin). Isto só decide o que aparece: quem recusa de verdade é o
 * servidor, em cada rota.
 */
export type Viewer = {
  authenticated: boolean;
  roles: readonly UserRole[];
  isAdmin: boolean;
  /** Cria e edita músicas e arranjos. */
  canEditSongs: boolean;
  /** Abre os cultos da igreja sem link (Mídia, Louvor, Admin). */
  canViewChurchServices: boolean;
  /** Vê o uso das músicas em liturgias. */
  canSeeUsageStats: boolean;
};

export function buildViewer(authenticated: boolean, roles: readonly UserRole[] | null | undefined): Viewer {
  const safeRoles = authenticated ? (roles ?? []) : [];
  return {
    authenticated,
    roles: safeRoles,
    isAdmin: canAccessAdmin(safeRoles),
    canEditSongs: canEditSongs(safeRoles),
    canViewChurchServices: canViewChurchServices(safeRoles),
    canSeeUsageStats: canSeeUsageStats(safeRoles),
  };
}

// Sem provedor (testes, histórias), vale o mais restrito: visitante.
const ViewerContext = createContext<Viewer>(buildViewer(false, []));

export function ViewerProvider({
  authenticated,
  roles,
  children,
}: {
  authenticated: boolean;
  roles: readonly UserRole[];
  children: ReactNode;
}) {
  const key = roles.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const viewer = useMemo(() => buildViewer(authenticated, roles), [authenticated, key]);
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer(): Viewer {
  return useContext(ViewerContext);
}
