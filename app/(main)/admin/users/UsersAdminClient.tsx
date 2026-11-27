"use client";

import Text from "@/components/common/Text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";
import { CheckCheck, Search, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type AdminUserFilter = "all" | "unseen" | "no-roles";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];
  providers: string[];
  createdAt: string;
};

interface UsersAdminClientProps {
  users: AdminUserRow[];
  currentUserId?: string | null;
  canManageRoles?: boolean;
  unseenUserIds?: string[];
  initialFilter?: AdminUserFilter;
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

const EMPTY_IDS: string[] = [];

function hasNoAssignableRoles(roles: UserRole[]): boolean {
  return !ASSIGNABLE_ROLES.some((r) => roles.includes(r));
}

export default function UsersAdminClient({
  users: initialUsers,
  currentUserId = null,
  canManageRoles = false,
  unseenUserIds = EMPTY_IDS,
  initialFilter = "all",
}: UsersAdminClientProps) {
  const t = useTranslations("AdminUsers");
  const locale = useLocale();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AdminUserFilter>(initialFilter);
  const [unseenSet, setUnseenSet] = useState<Set<string>>(
    () => new Set(unseenUserIds)
  );
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setUnseenSet(new Set(unseenUserIds));
  }, [unseenUserIds]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [locale]
  );

  const noRolesCount = useMemo(
    () => users.filter((u) => hasNoAssignableRoles(u.roles)).length,
    [users]
  );

  const unseenCount = useMemo(
    () => users.filter((u) => unseenSet.has(u.id)).length,
    [users, unseenSet]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "unseen" && !unseenSet.has(u.id)) return false;
      if (filter === "no-roles" && !hasNoAssignableRoles(u.roles)) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q))
      );
    });
  }, [users, query, filter, unseenSet]);

  const formatProvider = (provider: string) => {
    if (provider === "google") return t("providerGoogle");
    if (provider === "resend") return t("providerResend");
    return provider;
  };

  const roleLabel = (role: AssignableRole) => {
    if (role === "ADMIN") return t("roleAdmin");
    if (role === "WORSHIP") return t("roleWorship");
    return t("roleMedia");
  };

  const handleMarkAllSeen = async () => {
    if (isMarkingSeen || unseenCount === 0) return;
    setIsMarkingSeen(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "NEW_USER_REGISTERED" }),
      });
      if (!res.ok) {
        toast.error(t("markSeenError"));
        return;
      }
      setUnseenSet(new Set());
      toast.success(t("allMarkedSeen"));
      router.refresh();
    } catch {
      toast.error(t("markSeenError"));
    } finally {
      setIsMarkingSeen(false);
    }
  };

  const handleToggleRole = async (
    user: AdminUserRow,
    role: AssignableRole,
    checked: boolean
  ) => {
    const currentAssignable = user.roles.filter((r): r is AssignableRole =>
      (ASSIGNABLE_ROLES as readonly string[]).includes(r)
    );
    const nextRoles = checked
      ? Array.from(new Set([...currentAssignable, role]))
      : currentAssignable.filter((r) => r !== role);

    const displayName = user.name || user.email;
    setPendingUserId(user.id);

    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(user.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roles: nextRoles }),
        }
      );

      if (!res.ok) {
        toast.error(t("roleUpdateError"));
        return;
      }

      const updated: { id: string; roles: UserRole[] } = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id ? { ...u, roles: updated.roles } : u
        )
      );
      toast.success(t("rolesUpdated", { user: displayName }));

      if (unseenSet.has(user.id)) {
        setUnseenSet((prev) => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
        void fetch("/api/notifications/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "NEW_USER_REGISTERED",
            entityIds: [user.id],
          }),
        }).then(() => router.refresh());
      }
    } catch {
      toast.error(t("roleUpdateError"));
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
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

      {users.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("filtersAria")}>
            <Button
              type="button"
              size="sm"
              variant={filter === "all" ? "secondary" : "outline"}
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              {t("filterAll", { count: users.length })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "unseen" ? "secondary" : "outline"}
              onClick={() => setFilter("unseen")}
              aria-pressed={filter === "unseen"}
            >
              {t("filterUnseen", { count: unseenCount })}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={filter === "no-roles" ? "secondary" : "outline"}
              onClick={() => setFilter("no-roles")}
              aria-pressed={filter === "no-roles"}
            >
              {t("filterNoRoles", { count: noRolesCount })}
            </Button>
          </div>

          {unseenCount > 0 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isMarkingSeen}
              onClick={handleMarkAllSeen}
            >
              <CheckCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t("markAllSeen")}
            </Button>
          )}
        </div>
      )}

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
            {query.trim()
              ? t("noResults", { query: query.trim() })
              : filter === "unseen"
                ? t("noUnseenUsers")
                : t("noUsersWithoutRoles")}
          </Text>
        </div>
      ) : (
        <div className="@container overflow-clip rounded-xl border border-border bg-card shadow-xs max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0">
          {/* Header row (shown on wider containers) */}
          <div className="hidden @[720px]:grid @[720px]:grid-cols-[minmax(0,1fr)_19rem_6.5rem_7rem] items-center gap-x-4 bg-surface-subtle px-5 py-3 border-b border-border text-sm font-medium text-muted-foreground">
            <span>{t("columnUser")}</span>
            <span>{t("columnRole")}</span>
            <span>{t("columnProviders")}</span>
            <span className="text-right">{t("columnCreatedAt")}</span>
          </div>

          <ul className="divide-y divide-border">
            {filtered.map((user) => {
              const isSelf = currentUserId !== null && user.id === currentUserId;
              const isPending = pendingUserId === user.id;
              const isUnseen = unseenSet.has(user.id);
              const displayName = user.name || user.email;
              const activeAssignableRoles = ASSIGNABLE_ROLES.filter((r) =>
                user.roles.includes(r)
              );

              return (
                <li
                  key={user.id}
                  className={cn(
                    "px-4 @[720px]:px-5 py-4 grid grid-cols-1 @[720px]:grid-cols-[minmax(0,1fr)_19rem_6.5rem_7rem] items-start @[720px]:items-center gap-3 @[720px]:gap-x-4",
                    isUnseen && "bg-surface-subtle/50"
                  )}
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
                        {isUnseen && (
                          <span className="inline-flex items-center rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold text-secondary shrink-0">
                            {t("newUserBadge")}
                          </span>
                        )}
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

                  <div className="flex flex-wrap items-center gap-3 @[720px]:contents">
                    <div className="flex flex-wrap items-center gap-3">
                      {canManageRoles ? (
                        ASSIGNABLE_ROLES.map((role) => {
                          const checked = user.roles.includes(role);
                          const lockSelfAdmin = isSelf && role === "ADMIN";
                          const label = roleLabel(role);
                          return (
                            <label
                              key={role}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground select-none"
                            >
                              <Switch
                                checked={checked}
                                disabled={isPending || lockSelfAdmin}
                                aria-label={t("toggleRoleLabel", {
                                  role: label,
                                  user: displayName,
                                })}
                                onCheckedChange={(next) =>
                                  void handleToggleRole(user, role, next)
                                }
                              />
                              <span
                                className={cn(
                                  checked
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {label}
                              </span>
                            </label>
                          );
                        })
                      ) : activeAssignableRoles.length > 0 ? (
                        activeAssignableRoles.map((role) => (
                          <span
                            key={role}
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              role === "ADMIN"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-surface-muted text-foreground"
                            )}
                          >
                            {roleLabel(role)}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-surface-muted text-muted-foreground">
                          {t("roleUser")}
                        </span>
                      )}
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
                      className="ml-auto @[720px]:ml-0 @[720px]:text-right tabular-nums"
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
