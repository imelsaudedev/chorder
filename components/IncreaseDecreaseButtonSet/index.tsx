import { Button } from "../ui/button";

type IncreaseDecreaseButtonSetProps = {
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
  increase,
  decrease,
  increaseDisabled,
  decreaseDisabled,
  increaseLabel = "+",
  decreaseLabel = "-",
  type = "text",
  stringValue,
  setStringValue,
}: IncreaseDecreaseButtonSetProps) {
  return (
    <div className="flex flex-row">
      <Button
        variant="secondary"
        rounded="left"
        onClick={decrease}
        disabled={!!decreaseDisabled}
      >
        {decreaseLabel}
      </Button>
      <input
        type={type}
        className="px-2 py-1 w-10 text-center"
        value={stringValue}
        onChange={(e) => setStringValue(e.target.value)}
      />
      <Button
        variant="secondary"
        rounded="right"
        onClick={increase}
        disabled={!!increaseDisabled}
      >
        {increaseLabel}
      </Button>
    </div>
  );
}
