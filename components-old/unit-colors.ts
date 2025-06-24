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
    circleBackground: 'bg-lime-300',
    background: 'bg-lime-50',
    text: 'text-lime-600',
    border: 'border-lime-200',
  },
  VERSE: {
    circleBackground: 'bg-cyan-400',
    background: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  PRECHORUS: {
    circleBackground: 'bg-orange-400',
    background: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  CHORUS: {
    circleBackground: 'bg-rose-500',
    background: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  BRIDGE: {
    circleBackground: 'bg-violet-500',
    background: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  INTERLUDE: {
    circleBackground: 'bg-amber-500',
    background: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  SOLO: {
    circleBackground: 'bg-fuchsia-600',
    background: 'bg-fuchsia-50',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
  },
  ENDING: {
    circleBackground: 'bg-lime-500',
    background: 'bg-lime-50',
    text: 'text-lime-700',
    border: 'border-lime-200',
  },
  BLOCK: {
    circleBackground: 'bg-zinc-400',
    background: 'bg-zinc-50',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
  },
};
