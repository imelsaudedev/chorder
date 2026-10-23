"use client";

import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const isFullPage = pathname.includes("/edit") || pathname.includes("/new") ||
    (pathname.startsWith("/admin/templates/") && pathParts.length > 3);
  const isListPage = pathParts.length === 2;

  const marginClass = isFullPage ? "" : isListPage ? "sm:ml-20 pb-14 sm:pb-0" : "lg:ml-20";

  return (
    <div className={`flex flex-col grow max-w-full ${marginClass}`}>
      {children}
    </div>
  );
}
