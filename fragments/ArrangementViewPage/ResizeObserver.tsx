import useResizeObserver from '@react-hook/resize-observer';
import { RefObject } from 'react';

type ResizeObserverProps = {
  target: RefObject<HTMLElement>;
  onResize: (width: number, height: number) => void;
};

export default function ResizeObserver({ target, onResize }: ResizeObserverProps) {
  useResizeObserver(target, () => {
    const width = target.current?.clientWidth || 630;
    const height = target.current?.clientHeight || 630;
    onResize(width, height);
  });

  return null;
}
