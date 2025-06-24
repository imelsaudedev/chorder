import BackLink from "@/components-old/BackLink";
import Heading from "../../components/common/Heading";

type PageHeaderProps = {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  backLinkHref?: string;
  backLinkText?: string;
};

const PageHeader = ({
  title,
  subtitle,
  actions,
  backLinkHref,
  backLinkText,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row grow justify-between gap-4 p-4 sm:p-6 lg:p-8 bg-zinc-50 border-b border-zinc-100">
      <div className="flex flex-col">
        {backLinkHref && backLinkText && (
          <BackLink href={backLinkHref} text={backLinkText} />
        )}
        <Heading level={1}>{title}</Heading>
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
