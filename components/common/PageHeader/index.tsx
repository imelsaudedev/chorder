import BackLink from "@/components/common/BackLink";
import Heading from "@/components/common/Heading";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  contentActions?: React.ReactNode;
  backLinkHref?: string;
  backLinkText?: string;
  variant?: "default" | "edit";
};

const PageHeader = ({
  title,
  subtitle,
  actions,
  contentActions,
  backLinkHref,
  backLinkText,
  variant = "default",
}: PageHeaderProps) => {
  if (variant === "edit") {
    return (
      <div className="flex flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-4 sm:pb-8 bg-indigo-50">
        <Heading level={1} className="font-semibold text-secondary leading-none mb-0">
          {title}
        </Heading>
        {actions && (
          <div className="flex gap-2 items-center shrink-0">{actions}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-zinc-50 border-b border-zinc-100">
      {/* Top bar: navegação (esq) + ações admin (dir) */}
      {(backLinkHref || actions) && (
        <div className="flex items-center justify-between mb-2">
          <div>
            {backLinkHref && backLinkText && (
              <BackLink href={backLinkHref} text={backLinkText} />
            )}
          </div>
          {actions && (
            <div className="flex gap-2 items-center">{actions}</div>
          )}
        </div>
      )}

      {/* Título em largura total */}
      <Heading level={1}>{title}</Heading>

      {/* Subtítulo */}
      {subtitle && (
        <div className="text-base sm:text-lg text-zinc-600">{subtitle}</div>
      )}

      {/* Ações de conteúdo: seletor de arranjo, youtube, etc. */}
      {contentActions && (
        <div className="flex flex-wrap gap-2 items-center mt-3">{contentActions}</div>
      )}
    </div>
  );
};

export default PageHeader;
