import { Song } from '@/models/song';

export function fetchSongs() {
  return fetch('/api/songs')
    .then((res) => res.json())
    .then((obj) => obj.songs)
    .then((serializedSongs) => serializedSongs.map(Song.deserialize));
}
