import useForwardSlashToSearch from '@/hooks/useForwardSlashToSearch';
import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  setValue: (value: string) => void;
};

export default function SearchBar({ value, setValue }: SearchBarProps) {
  useForwardSlashToSearch();

  return (
    <div className="flex items-center pr-8 h-10 w-full rounded-full border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <Search className="w-4 h-4 ml-4 text-muted-foreground" />
      <input
        type="search"
        className="flex-grow px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
