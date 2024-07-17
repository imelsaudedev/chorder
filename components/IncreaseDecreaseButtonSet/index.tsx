import { Button } from '../ui/button';

type IncreaseDecreaseButtonSetProps = {
  id?: string;
  increase: () => void;
  decrease: () => void;
  increaseDisabled?: boolean;
  decreaseDisabled?: boolean;
  increaseLabel?: string;
  decreaseLabel?: string;
  type?: string;
  stringValue: string;
  setStringValue: (value: string) => void;
};

export default function IncreaseDecreaseButtonSet({
  id,
  increase,
  decrease,
  increaseDisabled,
  decreaseDisabled,
  increaseLabel = '+',
  decreaseLabel = '-',
  type = 'text',
  stringValue,
  setStringValue,
}: IncreaseDecreaseButtonSetProps) {
  return (
    <div className="flex flex-row">
      <Button variant="outline" rounded="left" onClick={decrease} disabled={!!decreaseDisabled}>
        {decreaseLabel}
      </Button>
      <input
        id={id}
        type={type}
        className="bg-neutral-100 px-2 py-1 w-10 text-center border-t border-b text-base"
        value={stringValue}
        onChange={(e) => setStringValue(e.target.value)}
      />
      <Button variant="outline" rounded="right" onClick={increase} disabled={!!increaseDisabled}>
        {increaseLabel}
      </Button>
    </div>
  );
}
