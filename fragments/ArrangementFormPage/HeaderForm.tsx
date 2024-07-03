import FormField from '@/components/FormField';
import FormLabel from '@/components/FormLabel';
import TextInput from '@/components/TextInput';
import messages from '@/i18n/messages';
import { Song } from '@/models/song';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

type HeaderFormProps = {
  song: Song;
  updateSong: () => void;
};

export default function HeaderForm({ song, updateSong }: HeaderFormProps) {
  const arrangement = song.getOrCreateCurrentArrangement();

  const [title, setTitle] = useState(song.title);
  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    song.title = newTitle;
    updateSong();
  };

  const [artist, setArtist] = useState(song.artist);
  const handleChangeArtist = (event: ChangeEvent<HTMLInputElement>) => {
    const newArtist = event.target.value;
    setArtist(newArtist);
    song.artist = newArtist;
    updateSong();
  };

  const [songKey, setSongKey] = useState(arrangement.key);
  const handleSongKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newKey = event.target.value;
    setSongKey(newKey);
    arrangement.key = newKey;
    updateSong();
  };

  return (
    <div className="flex mx-4 gap-2">
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="title">
          {messages.songData.title}
        </FormLabel>
        <TextInput
          id="title"
          placeholder={messages.songData.titlePlaceholder}
          onChange={handleChangeTitle}
          defaultValue={title}
        />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="artist">
          {messages.songData.artist}
        </FormLabel>
        <TextInput
          id="artist"
          placeholder={messages.songData.artistPlaceholder}
          onChange={handleChangeArtist}
          defaultValue={artist || ''}
        />
      </FormField>
      <FormField>
        <FormLabel className="text-purple-700" htmlFor="key">
          {messages.songData.key}
        </FormLabel>
        <TextInput
          id="key"
          placeholder={messages.songData.keyPlaceholder}
          onChange={handleSongKeyChange}
          defaultValue={songKey}
        />
      </FormField>
    </div>
  );
}
