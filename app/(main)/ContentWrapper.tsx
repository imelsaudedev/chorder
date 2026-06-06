"use client";

import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = pathname.includes("/edit") || pathname.includes("/new");
  return (
    <div className={`flex flex-col grow max-w-full ${isFullPage ? "" : "lg:ml-20"}`}>
      {children}
    </div>
  );
}
