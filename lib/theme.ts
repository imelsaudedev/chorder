export type Theme = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: unknown): value is Theme {
  return value === "system" || value === "light" || value === "dark";
}

/** `true` quando o tema escolhido (e, em "system", a preferência do sistema) é escuro. */
export function resolveIsDark(theme: Theme, systemPrefersDark: boolean): boolean {
  return theme === "dark" || (theme === "system" && systemPrefersDark);
}

/**
 * Script inline do `<head>`: aplica a classe `dark` antes da primeira pintura, para não piscar.
 * Mantém a mesma regra de `resolveIsDark`; tudo em try/catch (localStorage pode estar bloqueado).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="system"&&t!=="light"&&t!=="dark")t=${JSON.stringify(DEFAULT_THEME)};var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;
