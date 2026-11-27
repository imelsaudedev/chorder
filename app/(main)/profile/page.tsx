export const dynamic = "force-dynamic";

import Main from "@/components/common/Main";
import PageTitleBlock from "@/components/common/PageTitleBlock";
import { getLiveUserAuth } from "@/lib/auth-guard";
import prisma from "@/prisma/client";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const [t, live] = await Promise.all([
    getTranslations("Profile"),
    getLiveUserAuth(),
  ]);

  if (!live.authenticated) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: live.userId },
    select: {
      id: true,
      name: true,
      nickname: true,
      email: true,
      image: true,
      roles: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <>
      <PageTitleBlock title={t("title")} />
      <Main>
        <ProfileClient user={user} />
      </Main>
    </>
  );
}
