"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isTheme, Theme } from "@/lib/theme";
import { Check, LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "./ThemeProvider";

const OPTIONS: { value: Theme; icon: LucideIcon; labelKey: "themeSystem" | "themeLight" | "themeDark" }[] = [
  { value: "system", icon: Monitor, labelKey: "themeSystem" },
  { value: "light", icon: Sun, labelKey: "themeLight" },
  { value: "dark", icon: Moon, labelKey: "themeDark" },
];

function currentIcon(theme: Theme) {
  return (OPTIONS.find((o) => o.value === theme) ?? OPTIONS[1]).icon;
}

const ITEM_CLASS = "flex flex-col items-center text-sm text-muted-foreground cursor-pointer";

/** Barra lateral (sm+): ícone do tema atual que abre um menu com Sistema, Claro e Escuro. */
export function ThemeMenu() {
  const t = useTranslations("Messages");
  const { theme, setTheme } = useTheme();
  const Icon = currentIcon(theme);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={ITEM_CLASS} aria-label={t("theme")}>
        <Icon size={24} aria-hidden />
        <span className="text-xs">{t("theme")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => isTheme(v) && setTheme(v)}>
          {OPTIONS.map(({ value, icon: OptionIcon, labelKey }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptionIcon size={16} aria-hidden className="mr-2" />
              {t(labelKey)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Navegação de baixo (celular): quarto item "Tema", abre uma bottom sheet com as três opções. */
export function ThemeSheet() {
  const t = useTranslations("Messages");
  const { theme, setTheme } = useTheme();
  const Icon = currentIcon(theme);
  return (
    <Drawer>
      <DrawerTrigger className={ITEM_CLASS} aria-label={t("theme")}>
        <Icon size={24} aria-hidden />
        <span className="text-xs">{t("theme")}</span>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("theme")}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col px-4 pb-6">
          {OPTIONS.map(({ value, icon: OptionIcon, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className="flex items-center gap-3 h-12 px-2 rounded-md text-left cursor-pointer hover:bg-surface-muted"
            >
              <OptionIcon size={20} aria-hidden className="text-muted-foreground" />
              <span className="flex-1">{t(labelKey)}</span>
              {theme === value && <Check size={18} aria-hidden className="text-secondary" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
