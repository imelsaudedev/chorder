import {
  Bell,
  Book,
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
  | "SERMAO"
  | "ENCERRAMENTO";

type UnitConfig = {
  label: string;
  icon: LucideIcon;
  color: string;
  isComplex: boolean;
};

export const UNIT_CONFIG: Record<ServiceUnitTypeValue, UnitConfig> = {
  SONG: {
    label: "Música",
    icon: Music,
    color: "text-emerald-600",
    isComplex: true,
  },
  FALA: {
    label: "Fala",
    icon: Mic2,
    color: "text-blue-500",
    isComplex: true,
  },
  LEITURA: {
    label: "Leitura",
    icon: BookOpen,
    color: "text-amber-600",
    isComplex: true,
  },
  ORACAO: {
    label: "Oração",
    icon: Heart,
    color: "text-pink-500",
    isComplex: true,
  },
  AVISOS: {
    label: "Avisos",
    icon: Bell,
    color: "text-orange-500",
    isComplex: false,
  },
  SERMAO: {
    label: "Sermão",
    icon: MessageSquare,
    color: "text-violet-600",
    isComplex: true,
  },
  ENCERRAMENTO: {
    label: "Encerramento",
    icon: Book,
    color: "text-zinc-500",
    isComplex: false,
  },
};
