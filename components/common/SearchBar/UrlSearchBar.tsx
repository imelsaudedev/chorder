"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchBar from ".";

export default function UrlSearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <SearchBar
      defaultValue={searchParams.get("query") || ""}
      onSearch={handleSearch}
    />
  );
}
