import Heading from "@components/Heading";
import { ServiceSongUnit } from "@/models/service-unit";
import ArrangementView from "../ArrangementViewPage/ArrangementView";
import { getSongUnitMap } from "@/models/song-arrangement";
import KeyButtonSet from "@/components/KeyButtonSet";
import { Button } from "@ui/button";
import { useState } from "react";
import { Mode } from "@/components/ModeButtonSet";
import { NotebookPen, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@ui/dropdown-menu";

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  columns: number;
  mode: Mode;
  order: number;
  density: "compact" | "normal";
};

export default function ServiceSongUnitView({
  unit,
  columns,
  mode,
  order,
  density,
}: ServiceSongUnitViewProps) {
  const [transpose, setTranspose] = useState(
    unit.song.arrangement.semitoneTranspose
  );
  const arrangement = unit.song.arrangement;

  return (
    <div className="w-full">
      <div
        className={`sticky top-0 bg-white/80 backdrop-blur-xs z-10 flex w-full flex-row justify-between items-center ${
          density === "compact"
            ? "py-2 md:py-1 lg:py-2"
            : "py-2 md:py-2 lg:py-4"
        }`}
      >
        {/* Título e Artista */}
        <div className="flex flex-col">
          <Heading level={2}>
            <span>{order}. </span>
            {unit.song.title}
          </Heading>
          {unit.song.artist && (
            <span
              className={`song-artist flex items-center text-zinc-600 gap-1 fullscreen-hidden ${
                density === "compact" ? "text-xs" : "text-sm sm:text-base"
              }`}
            >
              {" "}
              {unit.song.artist}
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

      <ArrangementView
        songUnitMap={getSongUnitMap(arrangement)}
        songKey={arrangement.key}
        columns={columns}
        transpose={transpose}
        mode={mode}
        density={density}
      />
    </div>
  );
}
