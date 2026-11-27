"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDisplayName } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { Loader2, Shield, Users, Video, Music } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface ProfileClientProps {
  user: {
    id: string;
    name: string | null;
    nickname: string | null;
    email: string;
    image: string | null;
    roles: UserRole[];
  };
}

function getInitials(name?: string | null, email?: string | null): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length > 0) {
    return parts
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  const emailTrimmed = email?.trim();
  if (emailTrimmed) {
    return emailTrimmed.slice(0, 2).toUpperCase();
  }
  return "?";
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const t = useTranslations("Profile");
  const router = useRouter();

  const [savedNickname, setSavedNickname] = useState<string>(user.nickname ?? "");
  const [nickname, setNickname] = useState<string>(user.nickname ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const displayName = getDisplayName({
    nickname: savedNickname || null,
    name: user.name,
  });
  const initials = getInitials(displayName, user.email);

  const trimmedInput = nickname.trim();
  const hasChanged = trimmedInput !== savedNickname.trim();

  const visibleTeamRoles: UserRole[] = [];
  if (user.roles.includes("WORSHIP")) visibleTeamRoles.push("WORSHIP");
  if (user.roles.includes("MEDIA")) visibleTeamRoles.push("MEDIA");
  if (user.roles.includes("ADMIN")) visibleTeamRoles.push("ADMIN");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving || !hasChanged) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmedInput || null }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data: { nickname: string | null } = await res.json();
      const nextNickname = data.nickname ?? "";
      setSavedNickname(nextNickname);
      setNickname(nextNickname);
      toast.success(
        nextNickname ? t("nicknameSaved") : t("nicknameCleared")
      );
      router.refresh();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    if (role === "WORSHIP") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
        >
          <Music className="size-3.5" aria-hidden="true" />
          {t("roleWorship")}
        </span>
      );
    }
    if (role === "MEDIA") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
        >
          <Video className="size-3.5" aria-hidden="true" />
          {t("roleMedia")}
        </span>
      );
    }
    if (role === "ADMIN") {
      return (
        <span
          key={role}
          className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-xs font-medium text-warning-text"
        >
          <Shield className="size-3.5" aria-hidden="true" />
          {t("roleAdmin")}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 ring-2 ring-border">
            <AvatarImage
              src={user.image ?? undefined}
              alt={displayName ?? user.email}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-base font-display font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {displayName ?? t("unnamed")}
            </h2>
            <Text variant="caption" as="p" className="truncate">
              {user.email}
            </Text>
            {savedNickname && user.name && savedNickname !== user.name && (
              <Text variant="caption" size="xs" as="p" className="truncate">
                {t("accountName", { name: user.name })}
              </Text>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">{t("rolesTitle")}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {visibleTeamRoles.length > 0 ? (
              visibleTeamRoles.map(renderRoleBadge)
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                )}
              >
                <Users className="size-3.5" aria-hidden="true" />
                {t("roleUser")}
              </span>
            )}
          </div>
          {visibleTeamRoles.length === 0 && (
            <Text variant="caption" size="xs" as="p" className="mt-2">
              {t("noTeamRolesHint")}
            </Text>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nickname">{t("nicknameLabel")}</Label>
            <Input
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("nicknamePlaceholder")}
              maxLength={60}
              disabled={isSaving}
              autoComplete="nickname"
            />
            <Text variant="caption" size="xs" as="p">
              {t("nicknameHint")}
            </Text>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" disabled={isSaving || !hasChanged}>
              {isSaving && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              )}
              {t("save")}
            </Button>
            {savedNickname && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setNickname("")}
              >
                {t("useOriginalName")}
              </Button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
