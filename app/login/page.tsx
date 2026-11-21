import { auth } from "@/auth";
import LoginView from "@/components/auth/LoginView";
import { getSafeCallbackUrl } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const safeCallbackUrl = getSafeCallbackUrl(searchParams.callbackUrl);
  const session = await auth();

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <LoginView
      callbackUrl={safeCallbackUrl}
      error={searchParams.error}
    />
  );
}
