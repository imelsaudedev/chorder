import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Density } from "@/components/config/config";
import { Rows2, Rows3 } from "lucide-react";
import { Dispatch, SetStateAction, useCallback } from "react";

type DensityButtonSetProps = {
  id?: string;
  density: Density;
  setDensity: Dispatch<SetStateAction<Density>>;
};

export default function DensityButtonSet({
  id,
  density,
  setDensity,
}: DensityButtonSetProps) {
  const handleChange = useCallback(
    (value: string) => { if (value) setDensity(value as Density); },
    [setDensity]
  );

  return (
    <ToggleGroup
      id={id}
      type="single"
      variant="outline"
      value={density}
      onValueChange={handleChange}
    >
      <ToggleGroupItem value="normal" aria-label="Normal">
        <Rows2 />
      </ToggleGroupItem>
      <ToggleGroupItem value="compact" aria-label="Compacto">
        <Rows3 />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
