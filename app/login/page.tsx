import { auth, signIn } from "@/auth";
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

  const handleGoogleSignIn = async () => {
    "use server";
    await signIn("google", {
      redirectTo: searchParams.callbackUrl || "/services",
    });
  };

  const handleEmailSignIn = async (formData: FormData) => {
    "use server";
    await signIn("resend", formData);
  };

  return (
    <LoginView
      onGoogleSignIn={handleGoogleSignIn}
      onEmailSignIn={handleEmailSignIn}
    />
  );
}
