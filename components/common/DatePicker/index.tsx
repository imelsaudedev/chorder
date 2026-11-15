import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

type DatePickerProps = {
  buttonProps?: React.ComponentProps<typeof Button>;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
  value?: Date;
};

export default function DatePicker({
  buttonProps,
  value,
  disabled = false,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Messages");
  const format = useFormatter();
  const formattedDate = value ? (
    format.dateTime(new Date(value), {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  ) : (
    <span>{t("pickDate")}</span>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          {...(buttonProps || {})}
          type="button"
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            buttonProps?.className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverPrimitive.Trigger>

      {/* Sem portal — renderiza dentro da árvore DOM do pai (Dialog/Drawer/page) */}
      <PopoverPrimitive.Content
        sideOffset={4}
        align="start"
        className="z-50 w-auto rounded-md border bg-popover p-0 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          defaultMonth={value}
          selected={value}
          onSelect={(date) => { onChange?.(date); setOpen(false); }}
          mode="single"
          disabled={disabled}
          autoFocus
        />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
