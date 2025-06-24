import { Dispatch, SetStateAction, useCallback } from 'react';
import IncreaseDecreaseButtonSet from '../IncreaseDecreaseButtonSet';

const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 72;

type FontSizeButtonSetProps = {
  id?: string;
  fontSize: number;
  setFontSize: Dispatch<SetStateAction<number>>;
};

export default function FontSizeButtonSet({ id, fontSize, setFontSize }: FontSizeButtonSetProps) {
  const handleChangeFontSize = useCallback(
    (value: string) => {
      const newFontSize = Math.max(Math.min(parseInt(value), MAX_FONT_SIZE), MIN_FONT_SIZE);
      setFontSize(newFontSize);
    },
    [setFontSize]
  );
  const handleIncrease = useCallback(() => {
    setFontSize((prev) => (prev < MAX_FONT_SIZE ? prev + 1 : prev));
  }, [setFontSize]);
  const handleDecrease = useCallback(() => {
    setFontSize((prev) => (prev > MIN_FONT_SIZE ? prev - 1 : prev));
  }, [setFontSize]);

  return (
    <IncreaseDecreaseButtonSet
      id={id}
      stringValue={fontSize.toString()}
      setStringValue={handleChangeFontSize}
      increase={handleIncrease}
      decrease={handleDecrease}
      decreaseLabel="-"
      increaseLabel="+"
      increaseDisabled={fontSize >= MAX_FONT_SIZE}
      decreaseDisabled={fontSize <= MIN_FONT_SIZE}
    />
  );
}
