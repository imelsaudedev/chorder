import { SongUnitType } from '@/models/song-unit';

export const unitTypeColorClasses: {
  [type in SongUnitType]: {
    circleBackground: string;
    background: string;
    text: string;
    border: string;
  };
} = {
  INTRO: {
    circleBackground: 'bg-amber-400',
    background: 'bg-amber-50',
    text: 'text-amber-400',
    border: 'border-amber-200',
  },
  ENDING: {
    circleBackground: 'bg-amber-400',
    background: 'bg-amber-50',
    text: 'text-amber-400',
    border: 'border-amber-200',
  },
  VERSE: {
    circleBackground: 'bg-cyan-400',
    background: 'bg-cyan-50',
    text: 'text-cyan-400',
    border: 'border-cyan-200',
  },
  PRECHORUS: {
    circleBackground: 'bg-lime-400',
    background: 'bg-lime-50',
    text: 'text-lime-400',
    border: 'border-lime-200',
  },
  CHORUS: {
    circleBackground: 'bg-pink-400',
    background: 'bg-pink-50',
    text: 'text-pink-400',
    border: 'border-pink-200',
  },
  BRIDGE: {
    circleBackground: 'bg-purple-400',
    background: 'bg-purple-50',
    text: 'text-purple-400',
    border: 'border-purple-200',
  },
  INTERLUDE: {
    circleBackground: 'bg-teal-400',
    background: 'bg-teal-50',
    text: 'text-teal-400',
    border: 'border-teal-200',
  },
  SOLO: {
    circleBackground: 'bg-emerald-400',
    background: 'bg-emerald-50',
    text: 'text-emerald-400',
    border: 'border-emerald-200',
  },
  BLOCK: {
    circleBackground: 'bg-slate-400',
    background: 'bg-slate-50',
    text: 'text-slate-400',
    border: 'border-slate-200',
  },
};
