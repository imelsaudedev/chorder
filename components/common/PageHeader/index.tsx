import BackLink from "@/components/common/BackLink";
import Heading from "@/components/common/Heading";
import clsx from "clsx";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  backLinkHref?: string;
  backLinkText?: string;
  variant?: "default" | "edit";
};

const PageHeader = ({
  title,
  subtitle,
  actions,
  backLinkHref,
  backLinkText,
  variant = "default",
}: PageHeaderProps) => {
  return (
    <div
      className={clsx("flex flex-col md:flex-row grow justify-between gap-4", {
        "p-4 sm:p-6 lg:p-8 bg-zinc-50 border-b border-zinc-100":
          variant === "default",
        "px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-4 sm:pb-8 bg-indigo-50":
          variant === "edit",
      })}
    >
      <div className="flex flex-col">
        {backLinkHref && backLinkText && (
          <BackLink href={backLinkHref} text={backLinkText} />
        )}
        <Heading
          level={1}
          className={clsx({
            "font-semibold text-secondary leading-none mb-0":
              variant === "edit",
          })}
        >
          {title}
        </Heading>
        {subtitle && (
          <div className="text-base sm:text-lg text-zinc-600">{subtitle}</div>
        )}
      </div>

      {/* Botões de Ação e Configuração */}
      {actions && (
        <div className="flex gap-2 items-center md:self-end">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;
