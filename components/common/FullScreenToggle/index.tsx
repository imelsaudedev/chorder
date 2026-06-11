import Tag from "@/components/common/Tag";
import Text from "@/components/common/Text";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";

const FONT_MIN = 10;
const FONT_MAX = 32;

type FullScreenToggleProps = {
  isFullScreen: boolean;
  currentIndex: number;
  total: number;
  currentTitle?: string;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
};

export default function FullScreenToggle({
  isFullScreen,
  currentIndex,
  total,
  currentTitle,
  fontSize,
  onFontSizeChange,
  onPrev,
  onNext,
  onToggle,
}: FullScreenToggleProps) {
  if (isFullScreen) {
    return (
      <div className="fixed top-0 inset-x-0 h-12 z-50 flex items-center px-2 gap-1 bg-background/90 backdrop-blur-sm border-b border-border">
        {/* Controles + contador + título — tudo à esquerda */}
        <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentIndex === 0} className="shrink-0">
          <ChevronLeft size={20} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} disabled={currentIndex >= total - 1} className="shrink-0">
          <ChevronRight size={20} />
        </Button>
        <Tag variant="muted" size="xs" label={`${currentIndex + 1}/${total}`} className="shrink-0 tabular-nums select-none" />
        {currentTitle && (
          <Text variant="heading-sm" as="span" className="truncate ml-2">{currentTitle}</Text>
        )}

        {/* Fonte + Minimize — à direita */}
        <div className="flex items-center shrink-0 ml-auto">
          {onFontSizeChange && fontSize !== undefined && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFontSizeChange(Math.max(FONT_MIN, fontSize - 1))}
                disabled={fontSize <= FONT_MIN}
              >
                <ZoomOut size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFontSizeChange(Math.min(FONT_MAX, fontSize + 1))}
                disabled={fontSize >= FONT_MAX}
              >
                <ZoomIn size={18} />
              </Button>
            </>
          )}
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
