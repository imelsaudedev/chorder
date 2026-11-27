"use client";

import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  NotificationItem,
  NotificationsResponse,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface NotificationsBellViewProps {
  initialItems: NotificationItem[];
  initialUnreadCount: number;
}

const MAX_PREVIEW_USERS = 5;

export default function NotificationsBellView({
  initialItems,
  initialUnreadCount,
}: NotificationsBellViewProps) {
  const t = useTranslations("Notifications");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setItems(initialItems);
    setUnreadCount(initialUnreadCount);
  }, [initialItems, initialUnreadCount]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale]
  );

  const refreshNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data: NotificationsResponse = await res.json();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // ignore transient network errors on background refresh
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      void refreshNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (isUpdating || unreadCount === 0) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
      setUnreadCount(0);
    } catch {
      toast.error(t("markReadError"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkItemRead = async (item: NotificationItem) => {
    if (isUpdating || !item.unread) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: item.ids }),
      });
      if (!res.ok) throw new Error("Failed");
      setItems((prev) =>
        prev.map((curr) =>
          curr.id === item.id ? { ...curr, unread: false } : curr
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error(t("markReadError"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? t("bellAriaUnread", { count: unreadCount })
              : t("bellAria")
          }
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bell size={24} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              data-testid="notifications-unread-dot"
              className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background"
              aria-hidden="true"
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="top"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <Text variant="heading-sm" as="h3">
            {t("title")}
          </Text>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUpdating}
              onClick={handleMarkAllRead}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {t("markAllRead")}
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-border">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell
                className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60"
                aria-hidden="true"
              />
              <Text variant="caption" as="p">
                {t("empty")}
              </Text>
            </div>
          ) : (
            items.map((item) => {
              const users = item.users ?? [];
              const previewUsers = users.slice(0, MAX_PREVIEW_USERS);
              const remainingCount = Math.max(
                0,
                users.length - previewUsers.length
              );
              const href = item.href ?? "/admin/users?filter=unseen";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors",
                    item.unread ? "bg-surface-subtle/70" : "bg-card"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      item.unread
                        ? "bg-secondary/15 text-secondary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link
                      href={href}
                      onClick={() => {
                        setOpen(false);
                        // For NEW_USER_REGISTERED, keep unread so /admin/users?filter=unseen
                        // shows the unseen users until the admin marks them seen or edits roles.
                        if (item.type !== "NEW_USER_REGISTERED" && item.unread) {
                          void handleMarkItemRead(item);
                        }
                      }}
                      className="block group focus:outline-none"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:underline">
                        {t("newUsersTitle", { count: Math.max(1, users.length) })}
                      </p>

                      {previewUsers.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {previewUsers.map((u) => (
                            <li key={u.id} className="truncate">
                              {u.name
                                ? u.email
                                  ? `${u.name} (${u.email})`
                                  : u.name
                                : u.email || t("unnamed")}
                            </li>
                          ))}
                          {remainingCount > 0 && (
                            <li className="font-medium text-foreground/80">
                              {t("andMoreUsers", { count: remainingCount })}
                            </li>
                          )}
                        </ul>
                      )}

                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {dateFormatter.format(new Date(item.createdAt))}
                      </p>
                    </Link>
                  </div>

                  {item.unread && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isUpdating}
                      aria-label={t("markAsRead")}
                      title={t("markAsRead")}
                      onClick={() => void handleMarkItemRead(item)}
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
