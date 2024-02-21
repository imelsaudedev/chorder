import { UnitType } from "@/models/unit";

export const unitTypeColorClasses: {
  [type in UnitType]: {
    circleBackground: string;
    background: string;
    text: string;
    border: string;
  };
} = {
  SONG_INTRO: {
    circleBackground: "bg-orange-400",
    background: "bg-orange-100",
    text: "text-orange-50",
    border: "border-orange-400",
  },
  SONG_ENDING: {
    circleBackground: "bg-amber-400",
    background: "bg-amber-100",
    text: "text-amber-50",
    border: "border-amber-400",
  },
  SONG_VERSE: {
    circleBackground: "bg-cyan-400",
    background: "bg-cyan-100",
    text: "text-cyan-50",
    border: "border-cyan-400",
  },
  SONG_PRECHORUS: {
    circleBackground: "bg-fuchsia-400",
    background: "bg-fuchsia-100",
    text: "text-fuchsia-50",
    border: "border-fuchsia-400",
  },
  SONG_CHORUS: {
    circleBackground: "bg-violet-400",
    background: "bg-violet-100",
    text: "text-violet-50",
    border: "border-violet-400",
  },
  SONG_BRIDGE: {
    circleBackground: "bg-pink-400",
    background: "bg-pink-100",
    text: "text-pink-50",
    border: "border-pink-400",
  },
  SONG_INTERLUDE: {
    circleBackground: "bg-indigo-400",
    background: "bg-indigo-100",
    text: "text-indigo-50",
    border: "border-indigo-400",
  },
  SONG_SOLO: {
    circleBackground: "bg-emerald-400",
    background: "bg-emerald-100",
    text: "text-emerald-50",
    border: "border-emerald-400",
  },
  SONG_BLOCK: {
    circleBackground: "bg-slate-400",
    background: "bg-slate-100",
    text: "text-slate-50",
    border: "border-slate-400",
  },
};
