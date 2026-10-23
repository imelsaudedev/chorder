import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

type FormFooterProps = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  cancelButton?: React.ReactNode;
  /** Texto de estado à esquerda (ex.: "Não salvo"). */
  status?: React.ReactNode;
  onSave?: () => void;
};

export default function FormFooter({ disabled = false, loading = false, label, cancelButton, status, onSave }: FormFooterProps) {
  const t = useTranslations("Messages");

  return (
    <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-3 bg-background shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      {status && (
        <div role="status" aria-live="polite" className="mb-2 text-xs text-muted-foreground sm:mb-0 sm:float-left sm:mt-2.5">
          {status}
        </div>
      )}
      <div className={`gap-2 sm:flex sm:justify-end ${cancelButton ? "grid grid-cols-2" : "flex justify-end"}`}>
        {cancelButton}
        <Button
          type={onSave ? "button" : "submit"}
          onClick={onSave}
          disabled={disabled || loading}
          variant="secondary"
          className="sm:min-w-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (label ?? t("save"))}
        </Button>
      </div>
    </div>
  );
}
