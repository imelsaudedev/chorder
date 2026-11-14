"use client";

import { DEFAULT_THEME, isTheme, resolveIsDark, Theme, THEME_STORAGE_KEY } from "@/lib/theme";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeContextValue = { theme: Theme; setTheme: (theme: Theme) => void };

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

const MEDIA = "(prefers-color-scheme: dark)";

function applyClass(theme: Theme) {
  const dark = resolveIsDark(theme, window.matchMedia(MEDIA).matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  // Lê a escolha salva depois da hidratação (o script do <head> já aplicou a classe).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(stored)) setThemeState(stored);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return; // evita remover a classe do script do <head> antes de ler a escolha salva
    applyClass(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia(MEDIA);
    const onChange = () => applyClass("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, ready]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
