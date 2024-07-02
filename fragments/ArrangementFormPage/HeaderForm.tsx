import FormField from "@/components/FormField";
import FormLabel from "@/components/FormLabel";
import TextInput from "@/components/TextInput";
import messages from "@/i18n/messages";
import { ChangeEvent } from "react";

export default function HeaderForm({
  title,
  setTitle,
  artist,
  setArtist,
  songKey,
  setSongKey,
}: {
  title: string;
  setTitle: (newValue: string) => void;
  artist: string | null;
  setArtist: (newValue: string | null) => void;
  songKey: string;
  setSongKey: (key: string) => void;
}) {
  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleChangeArtist = (event: ChangeEvent<HTMLInputElement>) => {
    setArtist(event.target.value);
  };

  const handleSongKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSongKey(event.target.value);
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
          defaultValue={artist || ""}
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
