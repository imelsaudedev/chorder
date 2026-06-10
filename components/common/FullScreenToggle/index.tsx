import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";

type FullScreenToggleProps = {
  isFullScreen: boolean;
  currentIndex: number;
  total: number;
  currentTitle?: string;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
};

export default function FullScreenToggle({
  isFullScreen,
  currentIndex,
  total,
  currentTitle,
  onPrev,
  onNext,
  onToggle,
}: FullScreenToggleProps) {
  if (isFullScreen) {
    return (
      <div className="fixed top-0 inset-x-0 h-12 z-50 flex items-center gap-2 px-2 bg-background/90 backdrop-blur-sm border-b border-border">
        <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentIndex === 0} className="shrink-0">
          <ChevronLeft size={20} />
        </Button>

        <div className="flex-1 flex flex-col items-center min-w-0">
          {currentTitle && (
            <span className="text-sm font-medium truncate max-w-full">{currentTitle}</span>
          )}
          <span className="text-xs text-muted-foreground tabular-nums select-none">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <Button variant="ghost" size="icon" onClick={onNext} disabled={currentIndex >= total - 1}>
            <ChevronRight size={20} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <Minimize size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
      <Button variant="secondary" onClick={onToggle} className="shadow-md rounded-full">
        <Maximize size={20} />
      </Button>
    </div>
  );
}
