import { RequiredArrangement, SongWith } from './song';

export type ServiceUnit = {
  type: string;
};

export type ServiceSongUnit = {
  type: 'SONG';
  song: SongWith<RequiredArrangement>;
  arrangementId: number;
};
