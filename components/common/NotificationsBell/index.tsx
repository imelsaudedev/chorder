import { getLiveUserAuth } from "@/lib/auth-guard";
import { getNotificationsForUser } from "@/lib/notifications";
import NotificationsBellView from "./NotificationsBellView";

export default async function NotificationsBell() {
  const live = await getLiveUserAuth();
  if (!live.authenticated) return null;

  const { items, unreadCount } = await getNotificationsForUser(live.userId).catch(
    () => ({ items: [], unreadCount: 0 })
  );

  return (
    <NotificationsBellView
      initialItems={items}
      initialUnreadCount={unreadCount}
    />
  );
}
