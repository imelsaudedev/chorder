import {
  AlarmClock,
  Bell,
  Book,
  BookOpen,
  Heart,
  MessageSquare,
  Mic2,
  Music,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ServiceUnitTypeValue =
  | "SONG"
  | "PRELUDIO"
  | "FALA"
  | "LEITURA"
  | "ORACAO"
  | "AVISOS"
  | "SERMAO"
  | "ESPECIAL"
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
  PRELUDIO: {
    label: "Prelúdio",
    icon: AlarmClock,
    color: "text-zinc-400",
    isComplex: false,
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
    isComplex: false,
  },
  ORACAO: {
    label: "Oração",
    icon: Heart,
    color: "text-pink-500",
    isComplex: false,
  },
  AVISOS: {
    label: "Avisos",
    icon: Bell,
    color: "text-orange-500",
    isComplex: true,
  },
  SERMAO: {
    label: "Sermão",
    icon: MessageSquare,
    color: "text-violet-600",
    isComplex: false,
  },
  ESPECIAL: {
    label: "Especial",
    icon: Sparkles,
    color: "text-yellow-500",
    isComplex: false,
  },
  ENCERRAMENTO: {
    label: "Encerramento",
    icon: Book,
    color: "text-zinc-500",
    isComplex: false,
  },
};
