import Heading from "@/components/common/Heading";
import KeyButtonSet from "@/components/config/KeyButtonSet";
import { useSongConfig } from "@/components/config/SongConfig";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientArrangement } from "@/prisma/models";
import { MoreVertical } from "lucide-react";

type ServiceArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
  order: number;
};

export default function ServiceArrangementHeader({
  arrangement,
  order,
}: ServiceArrangementHeaderProps) {
  const { transpose, setTranspose, density } = useSongConfig();

  if (!arrangement) {
    return (
      <div className="sticky top-0 bg-white/80 backdrop-blur-xs z-10 flex w-full flex-row justify-between items-center py-2 md:py-2 lg:py-4">
        <Skeleton className="w-1/3 h-12 bg-gray-500" />
        <Skeleton className="w-16 h-12 bg-gray-200" />
      </div>
    );
  }

  if (!arrangement.song) {
    throw new Error("Arrangement song is not available");
  }

  return (
    <div
      className={`sticky top-0 bg-white/80 backdrop-blur-xs z-10 flex w-full flex-row justify-between items-center ${
        density === "compact" ? "py-2 md:py-1 lg:py-2" : "py-2 md:py-2 lg:py-4"
      }`}
    >
      <div className="flex flex-col">
        <Heading level={2}>
          <span>{order}. </span>
          {arrangement.song.title}
        </Heading>
        {arrangement.song.artist && (
          <span
            className={`flex items-center text-zinc-600 gap-1 fullscreen-hidden ${
              density === "compact" ? "text-xs" : "text-sm sm:text-base"
            }`}
          >
            {" "}
            {arrangement.song.artist}
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
