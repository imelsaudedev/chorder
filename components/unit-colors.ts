import { UnitType } from "@/models/unit";

export const unitTypeColorClasses: {
  [type in UnitType]: {
    circleBackground: string;
    background: string;
    text: string;
    border: string;
  };
} = {
  INTRO: {
    circleBackground: "bg-orange-400",
    background: "bg-orange-100",
    text: "text-orange-50",
    border: "border-orange-400",
  },
  ENDING: {
    circleBackground: "bg-amber-400",
    background: "bg-amber-100",
    text: "text-amber-50",
    border: "border-amber-400",
  },
  VERSE: {
    circleBackground: "bg-cyan-400",
    background: "bg-cyan-100",
    text: "text-cyan-50",
    border: "border-cyan-400",
  },
  PRECHORUS: {
    circleBackground: "bg-fuchsia-400",
    background: "bg-fuchsia-100",
    text: "text-fuchsia-50",
    border: "border-fuchsia-400",
  },
  CHORUS: {
    circleBackground: "bg-violet-400",
    background: "bg-violet-100",
    text: "text-violet-50",
    border: "border-violet-400",
  },
  BRIDGE: {
    circleBackground: "bg-pink-400",
    background: "bg-pink-100",
    text: "text-pink-50",
    border: "border-pink-400",
  },
  INTERLUDE: {
    circleBackground: "bg-indigo-400",
    background: "bg-indigo-100",
    text: "text-indigo-50",
    border: "border-indigo-400",
  },
  SOLO: {
    circleBackground: "bg-emerald-400",
    background: "bg-emerald-100",
    text: "text-emerald-50",
    border: "border-emerald-400",
  },
  NEUTRAL: {
    circleBackground: "bg-slate-400",
    background: "bg-slate-100",
    text: "text-slate-50",
    border: "border-slate-400",
  },
};
