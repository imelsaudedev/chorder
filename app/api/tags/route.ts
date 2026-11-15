import { retrieveTagGroups } from "@/prisma/data";
import { NextResponse } from "next/server";

export async function GET() {
  const tagGroups = await retrieveTagGroups();
  return NextResponse.json(tagGroups);
}
