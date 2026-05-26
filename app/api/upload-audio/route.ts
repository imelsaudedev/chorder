import { put, del } from "@vercel/blob";
import { NextRequest } from "next/server";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/x-m4a"];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response("Arquivo não encontrado", { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response("Formato inválido. Use MP3, M4A ou AAC.", {
      status: 400,
    });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return new Response("Arquivo muito grande. Limite de 5MB.", { status: 400 });
  }

  const blob = await put(`audio/${Date.now()}-${file.name}`, file, {
    access: "public",
    contentType: file.type,
  });

  return new Response(JSON.stringify({ url: blob.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: NextRequest) {
  const { url } = await request.json();
  if (!url) {
    return new Response("URL não fornecida", { status: 400 });
  }
  await del(url);
  return new Response(null, { status: 204 });
}
