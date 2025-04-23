"use client";

import { Search } from "lucide-react";
import useForwardSlashToSearch from "@/hooks/useForwardSlashToSearch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchBar() {
  useForwardSlashToSearch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex items-center pr-8 h-10 w-full rounded-full border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Search className="w-4 h-4 ml-4 text-muted-foreground" />
      <input
        type="search"
        className="grow px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-hidden"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query") || ""}
      />
    </div>
  );
}
