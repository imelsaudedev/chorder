"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { Search, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  providers: string[];
  createdAt: string;
};

interface UsersAdminClientProps {
  users: AdminUserRow[];
  currentUserId?: string | null;
  canManageRoles?: boolean;
}

function getInitials(name: string | null, email: string): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length > 0) {
    return parts
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return email.trim().slice(0, 2).toUpperCase() || "?";
}

export default function UsersAdminClient({
  users: initialUsers,
  currentUserId = null,
  canManageRoles = false,
}: UsersAdminClientProps) {
  const t = useTranslations("AdminUsers");
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [locale]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q))
    );
  }, [users, query]);

  const formatProvider = (provider: string) => {
    if (provider === "google") return t("providerGoogle");
    if (provider === "resend") return t("providerResend");
    return provider;
  };

  const handleToggleRole = async (user: AdminUserRow, checked: boolean) => {
    const nextRole: UserRole = checked ? "ADMIN" : "USER";
    const displayName = user.name || user.email;
    setPendingUserId(user.id);

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!res.ok) {
        toast.error(t("roleUpdateError"));
        return;
      }

      const updated: { id: string; role: UserRole } = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
      toast.success(
        updated.role === "ADMIN"
          ? t("roleUpdatedToAdmin", { user: displayName })
          : t("roleUpdatedToUser", { user: displayName })
      );
    } catch {
      toast.error(t("roleUpdateError"));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Text variant="caption" as="p">
            {t("subtitle")} · {t("totalCount", { count: users.length })}
          </Text>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-2">
          <Users
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <Text variant="heading-md" as="h2">
            {t("emptyTitle")}
          </Text>
          <Text variant="caption" as="p">
            {t("emptyDescription")}
          </Text>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Text variant="caption" as="p">
            {t("noResults", { query: query.trim() })}
          </Text>
        </div>
      ) : (
        <div className="@container overflow-clip rounded-xl border border-border bg-card shadow-xs max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0">
          {/* Header row (shown on wider containers) */}
          <div className="hidden @[560px]:grid @[560px]:grid-cols-[minmax(0,1fr)_8.5rem_7.5rem_7.5rem] items-center gap-x-4 bg-surface-subtle px-5 py-3 border-b border-border text-sm font-medium text-muted-foreground">
            <span>{t("columnUser")}</span>
            <span>{t("columnRole")}</span>
            <span>{t("columnProviders")}</span>
            <span className="text-right">{t("columnCreatedAt")}</span>
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((user) => {
              const isSelf = currentUserId !== null && user.id === currentUserId;
              const isPending = pendingUserId === user.id;
              const displayName = user.name || user.email;

              return (
                <li
                  key={user.id}
                  className="px-4 @[560px]:px-5 py-4 grid grid-cols-1 @[560px]:grid-cols-[minmax(0,1fr)_8.5rem_7.5rem_7.5rem] items-start @[560px]:items-center gap-3 @[560px]:gap-x-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? user.email}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-display font-semibold">
                        {getInitials(user.name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Text
                          variant="heading-sm"
                          as="p"
                          className="truncate"
                        >
                          {user.name || t("unnamed")}
                        </Text>
                        {isSelf && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({t("you")})
                          </span>
                        )}
                      </div>
                      <Text
                        variant="caption"
                        size="xs"
                        as="p"
                        className="truncate"
                      >
                        {user.email}
                      </Text>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 @[560px]:contents">
                    <div className="flex items-center gap-2">
                      {canManageRoles && !isSelf && (
                        <Switch
                          checked={user.role === "ADMIN"}
                          disabled={isPending}
                          aria-label={t("toggleAdminLabel", {
                            user: displayName,
                          })}
                          onCheckedChange={(checked) =>
                            void handleToggleRole(user, checked)
                          }
                        />
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          user.role === "ADMIN"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-surface-muted text-muted-foreground"
                        )}
                      >
                        {user.role === "ADMIN" ? t("roleAdmin") : t("roleUser")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {user.providers.length > 0 ? (
                        user.providers.map((provider) => (
                          <span
                            key={provider}
                            className="inline-flex items-center rounded-md bg-surface-subtle border border-border px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {formatProvider(provider)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    <Text
                      variant="caption"
                      size="xs"
                      className="ml-auto @[560px]:ml-0 @[560px]:text-right tabular-nums"
                    >
                      {dateFormatter.format(new Date(user.createdAt))}
                    </Text>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
