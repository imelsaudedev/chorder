import { getLiveUserAuth } from "@/lib/auth-guard";
import { canViewChurchServices } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function Home() {
  const live = await getLiveUserAuth();
  if (live.authenticated && canViewChurchServices(live.roles)) {
    redirect("/services");
  }
  redirect("/songs");
}
