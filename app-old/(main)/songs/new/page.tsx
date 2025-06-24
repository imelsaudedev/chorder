"use client";

import { useRouter } from "next/navigation";
import ArrangementForm from "../ArrangementForm";
import { SongArrangementWithSong } from "@/prisma/models";

export default function NewSongPage({}) {
  const router = useRouter();
  const handleSaved = (arrangement: SongArrangementWithSong) => {
    router.push(
      `/songs/${arrangement.song.slug}?arrangement=${arrangement.id}`
    );
  };

  return <ArrangementForm onSaved={handleSaved} />;
}
