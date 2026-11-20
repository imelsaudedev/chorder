import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

type SectionProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Elementos à direita do título (ex.: selo, link "ver tudo"). */
  aside?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Seção de uma página. Ritmo: 32 acima (token `--space-section`) →
 * título (h2) → (4 → descrição) → 16 → elementos.
 */
export default function Section({ title, description, aside, className, children }: SectionProps) {
  return (
    <section className={cn("mt-[var(--space-section)]", className)}>
      <div className="flex items-center gap-2">
        <Text variant="heading-lg" as="h2" className="flex items-center gap-2">
          {title}
        </Text>
        {aside}
      </div>
      {description && (
        <Text variant="caption" as="p" className="mt-1">
          {description}
        </Text>
      )}
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
