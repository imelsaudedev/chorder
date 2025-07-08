"use client";

import ArrangementForm from "@/components/song/ArrangementForm";
import { ClientArrangement } from "@/prisma/models";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function ClientArrangementEditPage({
  arrangement,
}: {
  arrangement?: ClientArrangement | null;
}) {
  const router = useRouter();

  const handleSaved = (arrangement: ClientArrangement) => {
    if (!arrangement.song?.slug || !arrangement.id) {
      console.error("Arrangement or song slug is missing", arrangement);
      return;
    }
    router.push(
      `/songs/${arrangement.song!.slug}?arrangement=${arrangement.id}`
    );
  };

  return (
    <Suspense>
      <ArrangementForm
        arrangement={arrangement ?? null}
        onSaved={handleSaved}
      />
    </Suspense>
  );
}
