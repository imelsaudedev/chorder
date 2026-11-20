"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
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

interface LoginViewProps {
  onGoogleSignIn: () => Promise<void>;
  onEmailSignIn: (formData: FormData) => Promise<void>;
}

export default function LoginView({
  onGoogleSignIn,
  onEmailSignIn,
}: LoginViewProps) {
  const t = useTranslations("Auth");
  const tm = useTranslations("Messages");

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      {/* Background elements for glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md mx-4 backdrop-blur-2xl bg-white/80 border-zinc-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative z-10 border">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-zinc-900 to-zinc-500">
            {t("loginTitle")}
          </CardTitle>
          <CardDescription className="text-zinc-500 text-base">
            {t("loginSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <form action={() => onGoogleSignIn()}>
            <Button
              variant="outline"
              className="w-full py-6 text-base font-medium border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-300 group"
              type="submit"
            >
              <GoogleIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {t("signInWithGoogle")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/0 px-4 text-zinc-400 backdrop-blur-sm font-medium tracking-widest">
                {tm("or")}
              </span>
            </div>
          </div>

          <form action={onEmailSignIn} className="grid gap-4">
            <div className="grid gap-2.5">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-700 ml-1"
              >
                {t("signInWithEmail")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                className="py-6 border-zinc-200 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-base px-4"
              />
            </div>
            <Button className="w-full py-6 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] active:scale-[0.98]">
              {t("sendMagicLink")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Decorative footer text */}
      <div className="absolute bottom-8 text-zinc-400 text-sm font-medium">
        © {new Date().getFullYear()} Chorder
      </div>
    </div>
  );
}
