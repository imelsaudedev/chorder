import { Button } from "@/components-old/ui/button";
import { ChevronDown, ChevronUp, Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type FullScreenToggleProps = {
  unitRefs: React.RefObject<(HTMLDivElement | null)[]>;
  onCurrentIndexChanged?: (index: number) => void;
};

export default function FullScreenToggle({
  unitRefs,
  onCurrentIndexChanged,
}: FullScreenToggleProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useFullScreen(setIsFullScreen);
  useObserveAll(unitRefs, setCurrentIndex);
  useCurrentIndexChanged(onCurrentIndexChanged, currentIndex);

  const onPrevious = useOnPrevious(unitRefs, currentIndex, setCurrentIndex);
  const onNext = useOnNext(unitRefs, currentIndex, setCurrentIndex);
  const toggleFullScreen = useToggleFullScreen(setIsFullScreen);

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

function useCurrentIndexChanged(
  onCurrentIndexChanged: ((index: number) => void) | undefined,
  currentIndex: number
) {
  useEffect(() => {
    if (onCurrentIndexChanged) {
      onCurrentIndexChanged(currentIndex);
    }
  }, [currentIndex, onCurrentIndexChanged]);
}

function useFullScreen(
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>
) {
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);
}

function useOnNext(
  unitRefs: React.RefObject<(HTMLDivElement | null)[]>,
  currentIndex: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
) {
  return useCallback(() => {
    if (unitRefs.current && currentIndex < unitRefs.current.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [unitRefs.current, currentIndex]);
}

function useOnPrevious(
  unitRefs: React.RefObject<(HTMLDivElement | null)[]>,
  currentIndex: number,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
) {
  return useCallback(() => {
    if (unitRefs.current && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      unitRefs.current[newIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [unitRefs.current, currentIndex]);
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

function createObserver(
  unitRefs: React.RefObject<(HTMLDivElement | null)[]>,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = unitRefs.current?.indexOf(
            entry.target as HTMLDivElement
          );
          if (index !== undefined && index !== -1) {
            setCurrentIndex(index);
          }
        }
      });
    },
    {
      root: null, // Use the viewport as the root
      threshold: 0.6,
    }
  );
}

function useObserveAll(
  unitRefs: React.RefObject<(HTMLDivElement | null)[]>,
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
) {
  useEffect(() => {
    const observer = createObserver(unitRefs, setCurrentIndex);
    const units = unitRefs.current || [];
    units.forEach((unit) => {
      if (unit) {
        observer.observe(unit);
      }
    });
    return () => {
      units.forEach((unit) => {
        if (unit) {
          observer.unobserve(unit);
        }
      });
    };
  }, [unitRefs]);
}

function useToggleFullScreen(
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>
) {
  return () => {
    if (!document.fullscreenElement) {
      enterFullScreen();
      setIsFullScreen(true);
    } else {
      exitFullScreen();
      setIsFullScreen(false);
    }
  };
}
