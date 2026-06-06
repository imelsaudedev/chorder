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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ClientArrangement } from "@/prisma/models";
import AudioReferenceButton from "@/components/common/AudioReferenceButton";
import YoutubeReferenceButton from "@/components/common/YoutubeReferenceButton";
import { MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";

type ServiceArrangementHeaderProps = {
  arrangement: ClientArrangement | null;
  order: number;
  isEditing?: boolean;
  onToggleEdit?: () => void;
};

export default function ServiceArrangementHeader({
  arrangement,
  order,
  isEditing = false,
  onToggleEdit,
}: ServiceArrangementHeaderProps) {
  const { transpose, setTranspose, density } = useSongConfig();
  const t = useTranslations("ServiceView");

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
            {arrangement.song.artist}
          </span>
        )}
      </div>

      <div className="key-controls flex items-center gap-2 fullscreen-hidden">
        {arrangement.youtubeUrl && (
          <YoutubeReferenceButton
            youtubeUrl={arrangement.youtubeUrl}
            title={arrangement.song.title}
          />
        )}
        {arrangement.audioUrl && (
          <AudioReferenceButton
            audioUrl={arrangement.audioUrl}
            title={arrangement.song.title}
          />
        )}
        {onToggleEdit && (
          <div className="flex items-center gap-2">
            <Switch
              checked={isEditing}
              onCheckedChange={onToggleEdit}
              id={`edit-chords-${arrangement.id}`}
            />
            <Label
              htmlFor={`edit-chords-${arrangement.id}`}
              className="text-xs sm:text-sm cursor-pointer"
            >
              {t("editChords")}
            </Label>
          </div>
        )}
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
