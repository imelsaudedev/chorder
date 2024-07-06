import { RequiredArrangement, RequiredSlug, SongWith } from './song';

export type ServiceUnit = {
  type: string;
};

export type ServiceSongUnit = {
  type: 'SONG';
  song: SongWith<RequiredSlug & RequiredArrangement>;
  arrangementId: number;
};
