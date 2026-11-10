export const dynamic = "force-dynamic";

import PageTitleBlock from "@/components/common/PageTitleBlock";
import Main from "@/components/common/Main";
import prisma from "@/prisma/client";
import CatalogoClient from "./CatalogoClient";

export default async function AdminCatalogoPage() {
  const [songs, tagGroups] = await Promise.all([
    prisma.song.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        artist: true,
        lyrics: true,
        legacyId: true,
        isDeleted: true,
        _count: {
          select: {
            arrangements: { where: { isServiceArrangement: true } },
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            group: { select: { id: true, name: true, color: true } },
          },
        },
      },
    }),
    prisma.tagGroup.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        tags: { orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } },
      },
    }),
  ]);

  const mappedSongs = songs.map((s) => ({
    ...s,
    serviceCount: s._count.arrangements,
  }));

  return (
    <>
      <PageTitleBlock title="Catálogo" />
      <Main>
        <CatalogoClient songs={mappedSongs} tagGroups={tagGroups} />
      </Main>
    </>
  );
}
