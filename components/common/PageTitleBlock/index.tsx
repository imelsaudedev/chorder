import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";
import { cn } from "@/lib/utils";

type PageTitleBlockProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Ações no canto direito da linha de cima (menu, botões). */
  actions?: React.ReactNode;
  /** Link de voltar na linha de cima, à esquerda. */
  backLink?: React.ReactNode;
  className?: string;
};

/**
 * Cabeçalho das telas de lista e administração.
 *
 * Desktop (sm+): a linha de cima (voltar/ações) tem altura fixa de 36px, tenha
 * conteúdo ou não, então o h1 fica sempre na mesma posição, igual ao
 * `PageHeader` das telas de detalhe (20 + 36 + 8 = 64px do topo).
 * Mobile: sem voltar/ações o título sobe (24px do topo).
 * Abaixo do título: (4/8 → subtítulo) → 16/24 → conteúdo.
 */
export default function PageTitleBlock({
  title,
  subtitle,
  actions,
  backLink,
  className,
}: PageTitleBlockProps) {
  const hasTopRow = Boolean(backLink || actions);
  return (
    <div
      className={cn(
        "px-page pb-[var(--space-title-bottom)] max-w-full",
        hasTopRow ? "pt-4" : "pt-6",
        "sm:pt-5",
        className,
      )}
    >
      <div
        className={cn(
          "items-center justify-between gap-2 sm:mb-2 sm:flex sm:h-9",
          hasTopRow ? "mb-1.5 flex h-9" : "hidden",
        )}
      >
        <div>{backLink}</div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Heading level={1} className="min-w-0">
        {title}
      </Heading>
      {subtitle && (
        <Text variant="caption" as="p" className="mt-1 sm:mt-2 sm:text-base">
          {subtitle}
        </Text>
      )}
    </div>
  );
}
