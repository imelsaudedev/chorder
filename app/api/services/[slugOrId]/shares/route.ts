import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { retrieveService } from "@/prisma/data";
import type { UserRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sharePostSchema = z.union([
  z.object({
    linkSharing: z.enum(["enable", "disable", "regenerate"]),
  }),
  z.object({
    email: z.string().trim().email(),
    permission: z.enum(["VIEW", "EDIT"]),
  }),
]);

async function loadOwnedPersonalService(
  slugOrId: string,
  userId: string,
  roles: readonly UserRole[]
) {
  const service = await retrieveService(slugOrId, { userId, roles });
  if (!service || !service.id) {
    return { ok: false as const, error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (service.scope !== "PERSONAL" || !service.isOwner) {
    return { ok: false as const, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, service };
}

async function listShares(serviceId: number) {
  const rows = await prisma.serviceShare.findMany({
    where: { serviceId },
    orderBy: { createdAt: "asc" },
    select: {
      userId: true,
      permission: true,
      user: { select: { name: true, email: true, image: true } },
    },
  });
  return rows.map((row) => ({
    userId: row.userId,
    permission: row.permission,
    name: row.user.name,
    email: row.user.email,
    image: row.user.image,
  }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const loaded = await loadOwnedPersonalService(slugOrId, live.userId, live.roles);
  if (!loaded.ok) return loaded.error;

  const shares = await listShares(loaded.service.id!);
  return NextResponse.json({
    shareToken: loaded.service.shareToken ?? null,
    shares,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const loaded = await loadOwnedPersonalService(slugOrId, live.userId, live.roles);
  if (!loaded.ok) return loaded.error;

  const parsed = sharePostSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const serviceId = loaded.service.id!;

  if ("linkSharing" in parsed.data) {
    let nextToken: string | null = loaded.service.shareToken ?? null;
    if (parsed.data.linkSharing === "disable") {
      nextToken = null;
    } else if (parsed.data.linkSharing === "regenerate" || !nextToken) {
      nextToken = randomBytes(24).toString("base64url");
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { shareToken: nextToken },
    });

    return NextResponse.json({
      shareToken: nextToken,
      shares: await listShares(serviceId),
    });
  }

  const targetUser = await prisma.user.findFirst({
    where: { email: { equals: parsed.data.email, mode: "insensitive" } },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (targetUser.id === live.userId) {
    return NextResponse.json({ error: "cannot_share_with_self" }, { status: 400 });
  }

  await prisma.serviceShare.upsert({
    where: {
      serviceId_userId: { serviceId, userId: targetUser.id },
    },
    create: {
      serviceId,
      userId: targetUser.id,
      permission: parsed.data.permission,
    },
    update: {
      permission: parsed.data.permission,
    },
  });

  return NextResponse.json({
    shareToken: loaded.service.shareToken ?? null,
    shares: await listShares(serviceId),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  const live = await getLiveUserAuth();
  if (!live.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slugOrId } = await params;
  const loaded = await loadOwnedPersonalService(slugOrId, live.userId, live.roles);
  if (!loaded.ok) return loaded.error;

  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await prisma.serviceShare.deleteMany({
    where: { serviceId: loaded.service.id!, userId },
  });

  return NextResponse.json({
    shareToken: loaded.service.shareToken ?? null,
    shares: await listShares(loaded.service.id!),
  });
}
