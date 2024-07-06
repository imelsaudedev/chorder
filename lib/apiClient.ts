export function fetchSongs() {
  return fetch('/api/songs')
    .then((res) => res.json())
    .then((obj) => obj.songs);
}
