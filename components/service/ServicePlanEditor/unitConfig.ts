import {
  Bell,
  BookOpen,
  Heart,
  MessageSquare,
  Mic2,
  Music,
  type LucideIcon,
} from "lucide-react";

export type ServiceUnitTypeValue =
  | "SONG"
  | "FALA"
  | "LEITURA"
  | "ORACAO"
  | "AVISOS"
  | "SERMAO";

type UnitConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
};

export const UNIT_CONFIG: Record<ServiceUnitTypeValue, UnitConfig> = {
  SONG: {
    label: "Música",
    icon: Music,
    color: "text-emerald-600",
  },
  FALA: {
    label: "Fala",
    icon: Mic2,
    color: "text-blue-500",
  },
  LEITURA: {
    label: "Leitura",
    icon: BookOpen,
    color: "text-amber-600",
  },
  ORACAO: {
    label: "Oração",
    icon: Heart,
    color: "text-pink-500",
  },
  AVISOS: {
    label: "Avisos",
    icon: Bell,
    color: "text-orange-500",
  },
  SERMAO: {
    label: "Sermão",
    icon: MessageSquare,
    color: "text-violet-600",
  },
};
