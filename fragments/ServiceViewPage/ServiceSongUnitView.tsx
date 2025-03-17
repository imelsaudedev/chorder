import { ServiceSongUnit } from '@/models/service-unit';
import ArrangementView from '../ArrangementViewPage/ArrangementView';
import { getSongUnitMap } from '@/models/song-arrangement';
import KeyButtonSet from '@/components/KeyButtonSet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Mode } from '@/components/ModeButtonSet';
import { NotebookPen, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type ServiceSongUnitViewProps = {
  unit: ServiceSongUnit;
  columns: number;
  mode: Mode;
  order: number;
};

export default function ServiceSongUnitView({ unit, columns, mode, order }: ServiceSongUnitViewProps) {
  const [transpose, setTranspose] = useState(unit.song.arrangement.semitoneTranspose);
  const arrangement = unit.song.arrangement;

  return (
    <div className="w-full">
      <div className="sticky top-0 bg-white z-10 py-2 md:py-2 lg:py-4 flex w-full flex-row justify-between items-center">
        {/* Título e Artista */}
        <div className="flex flex-col">
          <h2 className="font-bold text-2xl leading-none tracking-tight text-black fullscreen">
            {order}. {unit.song.title}
          </h2>
          {unit.song.artist && (
            <span className="song-artist flex items-center gap-1 text-base text-slate-400 fullscreen-hidden">
              <NotebookPen size={16} />
              {unit.song.artist}
            </span>
          )}
        </div>

        {/* Controles e Menu Dropdown */}
        <div className="key-controls flex items-center gap-2 fullscreen-hidden">
          {/* Controles de Tom no Desktop/Tablet */}
          <div className="hidden md:flex">
            <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
          </div>

          {/* Menu Dropdown no Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="md:hidden flex" variant="ghost" size="icon">
                <MoreVertical size={24} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem asChild>
                <KeyButtonSet originalKey={arrangement.key || ''} transpose={transpose} setTranspose={setTranspose} />
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
      />
    </div>
  );
}
