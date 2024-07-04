import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import messages from '@/i18n/messages';
import { Song } from '@/models/song';
import { ChangeEvent, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

type InfoFormProps = {
  song: Song;
  updateSong: () => void;
  form: UseFormReturn<{
    title: string;
    artist?: string | undefined;
    key?: string | undefined;
  }>;
};

export default function InfoForm({ song, updateSong, form }: InfoFormProps) {
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
    <div className="flex-grow space-y-2">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary mb-0">{messages.songData.title}</FormLabel>
            <FormControl>
              <Input placeholder={messages.songData.titlePlaceholder} {...field} onChangeCapture={handleChangeTitle} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="artist"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary">{messages.songData.artist}</FormLabel>
            <FormControl>
              <Input
                placeholder={messages.songData.artistPlaceholder}
                {...field}
                onChangeCapture={handleChangeArtist}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="text-secondary">{messages.songData.key}</FormLabel>
            <FormControl>
              <Input placeholder={messages.songData.keyPlaceholder} {...field} onChangeCapture={handleSongKeyChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
