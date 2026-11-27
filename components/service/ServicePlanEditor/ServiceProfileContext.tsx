"use client";

import { ServiceProfile, serviceProfile } from "@/lib/service-profile";
import { createContext, useContext } from "react";

const ServiceProfileContext = createContext<ServiceProfile>(serviceProfile("CHURCH"));

/** Perfil da liturgia em edição (Igreja ou Pessoal): o editor e seus menus se adaptam a ele. */
export const ServiceProfileProvider = ServiceProfileContext.Provider;

export function useServiceProfile(): ServiceProfile {
  return useContext(ServiceProfileContext);
}
