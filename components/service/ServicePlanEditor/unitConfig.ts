import {
  Bell,
  BookOpen,
  CircleEllipsis,
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
  | "SERMAO"
  | "OUTRO";

type UnitConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
};

export const UNIT_CONFIG: Record<ServiceUnitTypeValue, UnitConfig> = {
  SONG: {
    label: "Música",
    icon: Music,
    color: "text-unit-song",
  },
  FALA: {
    label: "Fala",
    icon: Mic2,
    color: "text-unit-fala",
  },
  LEITURA: {
    label: "Leitura",
    icon: BookOpen,
    color: "text-unit-leitura",
  },
  ORACAO: {
    label: "Oração",
    icon: Heart,
    color: "text-unit-oracao",
  },
  AVISOS: {
    label: "Avisos",
    icon: Bell,
    color: "text-unit-avisos",
  },
  SERMAO: {
    label: "Sermão",
    icon: MessageSquare,
    color: "text-unit-sermao",
  },
  // Item genérico (o que não cabe nos outros tipos): ícone neutro, sem cor de destaque.
  OUTRO: {
    label: "Outro",
    icon: CircleEllipsis,
    color: "text-unit-outro",
  },
};
