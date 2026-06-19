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
  noBorder?: boolean;
};

const PageHeader = ({
  title,
  subtitle,
  actions,
  contentActions,
  backLinkHref,
  backLinkText,
  variant = "default",
  noBorder = false,
}: PageHeaderProps) => {
  if (variant === "edit") {
    return (
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between gap-2 px-4 sm:px-5 lg:px-8 py-2 bg-white/80 backdrop-blur-lg border-b border-border">
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
    <div className={`flex flex-col px-4 sm:px-5 lg:px-8 py-4 sm:py-5 bg-zinc-50${noBorder ? "" : " border-b border-border"}`}>
      {(backLinkHref || actions) && (
        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
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

      <div className="flex flex-col gap-1">
        <Heading level={1} className="truncate">{title}</Heading>
        {subtitle && (
          <Text variant="caption" className="text-base sm:text-lg">{subtitle}</Text>
        )}
      </div>

      {contentActions && (
        <div className="flex flex-wrap gap-2 items-center mt-2">{contentActions}</div>
      )}
    </div>
  );
};

export default PageHeader;
