"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type NavigationLoaderContextType = {
  navigateTo: (url: string) => void;
};

const NavigationLoaderContext = createContext<NavigationLoaderContextType | null>(null);

export function NavigationLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const navigateTo = useCallback((url: string) => {
    setIsLoading(true);
    setTimeout(() => router.push(url), 0);
  }, [router]);

  return (
    <NavigationLoaderContext.Provider value={{ navigateTo }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
    </NavigationLoaderContext.Provider>
  );
}

export function useNavigationLoader() {
  const ctx = useContext(NavigationLoaderContext);
  if (!ctx) throw new Error("useNavigationLoader must be used within NavigationLoaderProvider");
  return ctx;
}
