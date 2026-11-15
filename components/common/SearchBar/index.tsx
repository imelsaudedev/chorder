import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import useForwardSlashToSearch from "./useForwardSlashToSearch";

type SearchBarProps = {
  defaultValue?: string;
  onSearch: (term: string) => void;
};

export default function SearchBar({ defaultValue, onSearch }: SearchBarProps) {
  useForwardSlashToSearch();

  const handleSearch = useDebouncedCallback(onSearch, 300);

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        className="rounded-full pl-9"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
