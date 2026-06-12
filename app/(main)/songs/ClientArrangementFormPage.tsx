"use client";

import ArrangementForm from "@/components/song/ArrangementForm";
import { SongMeta } from "@/components/song/SongMetaModal";
import { ClientArrangement } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

type ClientArrangementFormPageProps = {
  arrangement?: ClientArrangement | null;
  defaultMeta?: SongMeta;
  defaultTagIds?: number[];
};

export default function ClientArrangementEditPage({
  arrangement,
  defaultMeta,
  defaultTagIds,
}: ClientArrangementFormPageProps) {
  const router = useRouter();

  const handleSaved = async (arrangement: ClientArrangement) => {
    if (!arrangement?.song?.slug || !arrangement?.id) {
      console.error("Arrangement or song slug is missing", arrangement);
      return;
    }
    if (defaultTagIds && defaultTagIds.length > 0) {
      await fetch(`/api/songs/${arrangement.song.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: defaultTagIds }),
      });
    }
    router.push(`/songs/${arrangement.song!.slug}?arrangement=${arrangement.id}`);
  };

  return (
    <Suspense>
      <ArrangementForm
        arrangement={arrangement ?? null}
        defaultMeta={defaultMeta}
        onSaved={handleSaved}
      />
    </Suspense>
  );
}
