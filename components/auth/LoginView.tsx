"use client";

import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSafeCallbackUrl } from "@/lib/auth-utils";
import { MailCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const AUTH_ERROR_KEYS = {
  OAuthAccountNotLinked: "authErrorOAuthAccountNotLinked",
  AccessDenied: "authErrorAccessDenied",
  Verification: "authErrorVerification",
} as const;

interface LoginViewProps {
  callbackUrl?: string;
  error?: string;
  onGoogleSignIn?: () => Promise<void>;
  onEmailSignIn?: (formData: FormData) => Promise<void>;
}

export default function LoginView({
  callbackUrl = "/services",
  error: initialError,
  onGoogleSignIn,
  onEmailSignIn,
}: LoginViewProps) {
  const t = useTranslations("Auth");
  const tm = useTranslations("Messages");
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  const [pendingProvider, setPendingProvider] = useState<
    "google" | "email" | null
  >(null);
  const [errorCode, setErrorCode] = useState<string | null>(
    initialError ?? null
  );
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);

  const isBusy = pendingProvider !== null;

  const getErrorMessage = (code: string) => {
    const key = AUTH_ERROR_KEYS[code as keyof typeof AUTH_ERROR_KEYS];
    return key ? t(key) : t("authErrorGeneric");
  };

  const handleGoogleSignIn = async () => {
    if (isBusy) return;
    setErrorCode(null);
    setPendingProvider("google");
    try {
      if (onGoogleSignIn) {
        await onGoogleSignIn();
      } else {
        await signIn("google", { callbackUrl: safeCallbackUrl });
      }
    } catch {
      setErrorCode("Default");
    } finally {
      setPendingProvider(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isBusy) return;
    setErrorCode(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) return;

    setPendingProvider("email");
    try {
      if (onEmailSignIn) {
        await onEmailSignIn(formData);
        setMagicLinkEmail(email);
      } else {
        const res = await signIn("resend", {
          email,
          callbackUrl: safeCallbackUrl,
          redirect: false,
        });
        if (res?.error) {
          setErrorCode(res.error);
        } else {
          setMagicLinkEmail(email);
        }
      }
    } catch {
      setErrorCode("Default");
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-subtle relative overflow-hidden px-page py-12 font-sans">
      {/* Subtle brand ambiance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]"
      />

      <Card className="w-full max-w-md backdrop-blur-xl bg-card/90 border-border shadow-sm relative z-10">
        {magicLinkEmail ? (
          <>
            <CardHeader className="space-y-2 text-center pb-6">
              <div
                aria-hidden="true"
                className="mx-auto w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-3"
              >
                <MailCheck className="h-6 w-6" />
              </div>
              <Text variant="heading-lg" as="h1">
                {t("checkEmailTitle")}
              </Text>
              <Text variant="caption" as="p">
                {t("checkEmailDescription", { email: magicLinkEmail })}
              </Text>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="lg"
                type="button"
                className="w-full h-11 text-sm font-medium"
                onClick={() => setMagicLinkEmail(null)}
              >
                {t("backToLogin")}
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center pb-6">
              <div
                aria-hidden="true"
                className="mx-auto w-12 h-12 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center mb-3 shadow-xs"
              >
                <span className="font-display font-semibold text-2xl">C</span>
              </div>
              <Text variant="heading-lg" as="h1">
                {t("loginTitle")}
              </Text>
              <Text variant="caption" as="p">
                {t("loginSubtitle")}
              </Text>
            </CardHeader>
            <CardContent className="grid gap-6">
              {errorCode && (
                <div
                  role="alert"
                  className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger-text"
                >
                  {getErrorMessage(errorCode)}
                </div>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full h-11 text-sm font-medium"
                type="button"
                disabled={isBusy}
                onClick={handleGoogleSignIn}
              >
                <GoogleIcon className="mr-2 h-5 w-5" />
                {pendingProvider === "google"
                  ? t("signingIn")
                  : t("signInWithGoogle")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
                    {tm("or")}
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signInWithEmail")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    required
                    disabled={isBusy}
                    className="h-11 text-sm"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  type="submit"
                  disabled={isBusy}
                  className="w-full h-11 text-sm font-semibold"
                >
                  {pendingProvider === "email"
                    ? t("signingIn")
                    : t("sendMagicLink")}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      <Text
        variant="caption"
        size="xs"
        as="footer"
        className="mt-8 relative z-10"
      >
        © {new Date().getFullYear()} Chorder
      </Text>
    </div>
  );
}
