import { auth } from "@/auth";
import LoginView from "@/components/auth/LoginView";
import { redirect } from "next/navigation";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (session) {
    redirect(searchParams.callbackUrl || "/services");
  }

  return <LoginView callbackUrl={searchParams.callbackUrl || "/services"} />;
}
