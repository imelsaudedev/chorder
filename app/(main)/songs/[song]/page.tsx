import { retrieveSong } from "@/prisma/data";
import { Metadata } from "next";
import ClientPage from "./ClientPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ song: string }>;
}): Promise<Metadata> {
  const { song: songSlug } = await params;
  const song = await retrieveSong(songSlug);
  return { title: song?.title ?? "Música" };
}

export default async function SongPage({
  params,
  searchParams,
}: {
  params: Promise<{ song: string }>;
  searchParams?: Promise<{ arrangement?: number }>;
}) {
  const { song: songSlug } = await params;
  const arrangementId = (await searchParams)?.arrangement;

  return <ClientPage songSlug={songSlug} arrangementId={arrangementId} />;
}
