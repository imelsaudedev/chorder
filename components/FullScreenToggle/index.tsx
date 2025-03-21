import { useState } from 'react';
import { Minimize, Maximize, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FullscreenToggleProps = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function FullscreenToggle({ onPrevious, onNext }: FullscreenToggleProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar entrar em tela cheia: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error(`Erro ao sair do modo tela cheia: ${err.message}`);
      });
      setIsFullScreen(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-2 z-50">
      {isFullScreen && (
        <div className="flex gap-2">
          <Button variant="default" size="icon" onClick={onPrevious}>
            <ChevronUp size={24} />
          </Button>
          <Button variant="default" size="icon" onClick={onNext}>
            <ChevronDown size={24} />
          </Button>
        </div>
      )}
      <Button circle variant="secondary" size="square" rounded="full" onClick={toggleFullScreen}>
        {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </Button>
    </div>
  );
}
