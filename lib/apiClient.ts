import { Song } from '@/models/song';

type FetchSongOptions = {
  excludeArrangements?: boolean;
  selectArrangement?: boolean;
};

export function fetchSongs(options?: FetchSongOptions) {
  let queries = [];
  if (options?.excludeArrangements) {
    queries.push('exclude-arrangements=true');
  }
  if (options?.selectArrangement) {
    queries.push('select-arrangement=true');
  }
  const query = queries.length > 0 ? `?${queries.join('&')}` : '';
  return fetch(`/api/songs${query}`)
    .then((res) => res.json())
    .then((obj) => obj.songs);
}

export function fetchSong(slug: string, options?: FetchSongOptions) {
  let queries = [`slug=${slug}`];
  if (options?.excludeArrangements) {
    queries.push('exclude-arrangements=true');
  }
  if (options?.selectArrangement) {
    queries.push('select-arrangement=true');
  }
  const query = queries.length > 0 ? `?${queries.join('&')}` : '';
  return fetch(`/api/songs${query}`)
    .then((res) => res.json())
    .then((obj) => obj.song);
}
