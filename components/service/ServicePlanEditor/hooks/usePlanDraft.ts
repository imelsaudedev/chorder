"use client";

import { readStorage, writeStorage } from "@/hooks/useLocalStorageState";
import { ClientService } from "@/prisma/models";
import { useCallback, useEffect, useRef, useState } from "react";

// Rascunho do roteiro guardado só neste aparelho. Protege o trabalho longo de
// uma aba fechada ou de uma queda de bateria sem tocar no banco (e sem expor um
// roteiro pela metade a quem consulta o culto).

const DRAFT_DELAY_MS = 500;

export type PlanDraft = {
  service: ClientService;
  // updatedAt do culto no servidor quando o rascunho começou; serve para
  // detectar que outra pessoa salvou depois.
  baseUpdatedAt: string | null;
  savedAt: number;
};

function removeStorage(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Armazenamento indisponível: nada a limpar.
  }
}

export function usePlanDraft(initial: ClientService, current: ClientService, isDirty: boolean) {
  const key = `rascunho-liturgia:${initial.slug || "novo"}`;
  const baseUpdatedAt = initial.updatedAt ? String(initial.updatedAt) : null;

  // Rascunho aguardando a decisão do usuário (recuperar ou descartar). Enquanto
  // existir, não gravamos por cima dele.
  const [pending, setPending] = useState<PlanDraft | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = readStorage<PlanDraft | null>(key, null);
    if (stored?.service) setPending(stored);
    setChecked(true);
  }, [key]);

  const latest = useRef({ current, isDirty, baseUpdatedAt, key, blocked: true });
  latest.current = { current, isDirty, baseUpdatedAt, key, blocked: !checked || !!pending };

  const write = useCallback(() => {
    const l = latest.current;
    if (!l.isDirty || l.blocked) return;
    writeStorage<PlanDraft>(l.key, {
      service: l.current,
      baseUpdatedAt: l.baseUpdatedAt,
      savedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!isDirty || !checked || pending) return;
    const id = setTimeout(write, DRAFT_DELAY_MS);
    return () => clearTimeout(id);
  }, [current, isDirty, checked, pending, write]);

  // Ao esconder a aba ou sair da página, grava na hora (o debounce pode não rodar).
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") write();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", write);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", write);
    };
  }, [write]);

  // Avisa antes de fechar a aba com alterações ainda não salvas no banco.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const clear = useCallback(() => {
    removeStorage(key);
    setPending(null);
  }, [key]);

  // Outra pessoa salvou o culto depois do início do rascunho.
  const conflict =
    !!pending && !!baseUpdatedAt && !!pending.baseUpdatedAt && pending.baseUpdatedAt !== baseUpdatedAt;

  return { pending, conflict, clear, dismiss: () => setPending(null) };
}
