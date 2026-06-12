import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { NextRequest } from "next/server";

const ALLOWED_TYPES = ["audio/mpeg", "audio/mp4", "audio/aac", "audio/x-m4a"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_SIZE_BYTES,
      }),
      onUploadCompleted: async () => {},
    });
    return Response.json(jsonResponse);
  } catch (error) {
    return new Response(String(error), { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { url } = await request.json();
  if (!url) {
    return new Response("URL não fornecida", { status: 400 });
  }
  await del(url);
  return new Response(null, { status: 204 });
}
