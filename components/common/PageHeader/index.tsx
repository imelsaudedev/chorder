import BackLink from "@/components/common/BackLink";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

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
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 py-2 bg-white/80 backdrop-blur-lg border-b border-zinc-100">
        <div className="flex flex-col min-w-0">
          <Text variant="heading-sm" className="truncate">{title}</Text>
          {subtitle && (
            <Text variant="caption" className="truncate mt-0.5">{subtitle}</Text>
          )}
        </div>
        {actions && (
          <div className="flex gap-2 items-center shrink-0">{actions}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 sm:p-6 lg:p-8 bg-zinc-50 border-b border-zinc-100">
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

      <Heading level={1} className="truncate mb-1 sm:mb-2">{title}</Heading>

      {subtitle && (
        <Text variant="caption" className="text-base sm:text-lg">{subtitle}</Text>
      )}

      {contentActions && (
        <div className="flex flex-wrap gap-2 items-center mt-3">{contentActions}</div>
      )}
    </div>
  );
};

export default PageHeader;
