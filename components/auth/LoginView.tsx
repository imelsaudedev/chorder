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
import { Chrome } from "lucide-react";
import { useTranslations } from "next-intl";

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
              <Chrome className="mr-3 h-5 w-5 text-zinc-600 group-hover:scale-110 transition-transform" />
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
