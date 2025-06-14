"use client";

import {
  ClientSong,
  SongArrangementWithSong,
  SongArrangementWithUnits,
} from "@/prisma/models";
import { useRouter } from "next/navigation";
import ArrangementForm from "../../ArrangementForm";

export default function ClientArrangementEditPage({
  song,
  arrangement,
}: {
  song: ClientSong;
  arrangement: SongArrangementWithUnits;
}) {
  const router = useRouter();

  const handleSaved = (arrangement: SongArrangementWithSong) => {
    router.push(
      `/songs/${arrangement.song.slug}?arrangement=${arrangement.id}`
    );
  };

  if (!song || !arrangement) {
    return null;
  }

  return (
    <ArrangementForm
      song={song}
      arrangement={arrangement}
      onSaved={handleSaved}
    />
  );
}
