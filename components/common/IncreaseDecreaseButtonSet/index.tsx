import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  size?: "default" | "sm";
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
  size = "default",
}: IncreaseDecreaseButtonSetProps) {
  const inputClass = size === "sm"
    ? "px-1 w-8 h-9 text-sm text-center rounded-none"
    : "px-2 w-10 text-center text-base rounded-none";

  return (
    <div className="flex flex-row">
      <Button
        type="button"
        variant="outline"
        size={size}
        className="rounded-l-md rounded-r-none"
        onClick={decrease}
        disabled={!!decreaseDisabled}
      >
        {decreaseLabel}
      </Button>
      <Input
        id={id}
        type={type}
        className={inputClass}
        value={stringValue}
        onChange={(e) => setStringValue(e.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        size={size}
        className="rounded-r-md rounded-l-none"
        onClick={increase}
        disabled={!!increaseDisabled}
      >
        {increaseLabel}
      </Button>
    </div>
  );
}
