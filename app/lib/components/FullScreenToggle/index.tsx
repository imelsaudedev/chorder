import { useEffect, useState } from "react";
import { Minimize, Maximize, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@ui/button";

type FullscreenToggleProps = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function FullscreenToggle({
  onPrevious,
  onNext,
}: FullscreenToggleProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      enterFullScreen();
      setIsFullScreen(true);
    } else {
      exitFullScreen();
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
      <Button
        variant="secondary"
        onClick={toggleFullScreen}
        className="shadow-md rounded-full"
      >
        {isFullScreen ? <Minimize size={24} /> : <Maximize size={24} />}
      </Button>
    </div>
  );
}

function exitFullScreen() {
  document.exitFullscreen().catch((err) => {
    console.error(`Error attempting to exit full-screen mode: ${err.message}`);
  });
}

function enterFullScreen() {
  document.documentElement.requestFullscreen().catch((err) => {
    console.error(
      `Error attempting to enable full-screen mode: ${err.message}`
    );
  });
}
