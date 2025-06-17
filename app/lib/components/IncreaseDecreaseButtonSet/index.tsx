import { Input } from "@/components/ui/input";
import { Button } from "@ui/button";

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
  increaseLabel = "+",
  decreaseLabel = "-",
  type = "text",
  stringValue,
  setStringValue,
}: IncreaseDecreaseButtonSetProps) {
  return (
    <div className="flex flex-row">
      <Button
        variant="outline"
        className="rounded-l-md rounded-r-none"
        onClick={decrease}
        disabled={!!decreaseDisabled}
      >
        {decreaseLabel}
      </Button>
      <Input
        id={id}
        type={type}
        className="px-2 w-10 text-center text-base rounded-none"
        value={stringValue}
        onChange={(e) => setStringValue(e.target.value)}
      />
      <Button
        variant="outline"
        className="rounded-r-md rounded-l-none"
        onClick={increase}
        disabled={!!increaseDisabled}
      >
        {increaseLabel}
      </Button>
    </div>
  );
}
