import { Search } from "lucide-react";
import useForwardSlashToSearch from "@/hooks/useForwardSlashToSearch";
import { useDebouncedCallback } from "use-debounce";

type SearchBarProps = {
  setQuery: (query: string) => void;
};

export default function SearchBar({ setQuery }: SearchBarProps) {
  useForwardSlashToSearch();

  const handleSearch = useDebouncedCallback((term: string) => {
    setQuery(term);
  }, 300);

  return (
    <div className="flex items-center pr-8 h-10 w-full rounded-full border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Search className="w-4 h-4 ml-4 text-muted-foreground" />
      <input
        type="search"
        className="grow px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-hidden"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
