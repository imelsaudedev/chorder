import KeyButtonSet from "@/app-old/lib/components/KeyButtonSet";
import { Skeleton } from "@/components-old/ui/skeleton";
import Heading from "@/components/common/Heading";
import { Button } from "@/components-old/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components-old/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  useArrangement,
  useDensity,
  useSong,
  useTranspose,
} from "@/app-old/(main)/songs/ArrangementViewer/ArrangementViewContext";

type ServiceArrangementHeaderProps = {
  order: number;
};

export default function ServiceArrangementHeader({
  order,
}: ServiceArrangementHeaderProps) {
  const { song } = useSong();
  const { arrangement } = useArrangement();
  const { transpose, setTranspose } = useTranspose();
  const { density } = useDensity();

  if (!song || !arrangement) {
    return (
      <div className="sticky top-0 bg-white/80 backdrop-blur-xs z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4">
        <Skeleton className="w-1/3 h-12 bg-gray-500" />
        <Skeleton className="w-16 h-12 bg-gray-200" />
      </div>
    );
  }

  return (
    <div
      className={`sticky top-0 bg-white/80 backdrop-blur-xs z-10 flex w-full flex-row justify-between items-center ${
        density === "compact" ? "py-2 md:py-1 lg:py-2" : "py-2 md:py-2 lg:py-4"
      }`}
    >
      {/* Título e Artista */}
      <div className="flex flex-col">
        <Heading level={2}>
          <span>{order}. </span>
          {song.title}
        </Heading>
        {song.artist && (
          <span
            className={`song-artist flex items-center text-zinc-600 gap-1 fullscreen-hidden ${
              density === "compact" ? "text-xs" : "text-sm sm:text-base"
            }`}
          >
            {" "}
            {song.artist}
          </span>
        )}
      </div>

      <div className="key-controls flex items-center gap-2 fullscreen-hidden">
        <div className="hidden md:flex">
          <KeyButtonSet
            originalKey={arrangement.key || ""}
            transpose={transpose}
            setTranspose={setTranspose}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="md:hidden flex" variant="ghost" size="icon">
              <MoreVertical size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem asChild>
              <KeyButtonSet
                originalKey={arrangement.key || ""}
                transpose={transpose}
                setTranspose={setTranspose}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
