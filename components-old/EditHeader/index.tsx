type EditHeaderProps = {
  title: string;
  backLinkHref?: string;
  backLinkText?: string;
  actions?: React.ReactNode;
};

const EditHeader = ({ title, backLinkHref, backLinkText, actions }: EditHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row grow justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-4 sm:pb-8 bg-indigo-50">
      <div className="flex flex-col">
        <h1 className="font-bricolage font-semibold text-3xl sm:text-4xl lg:text-5xl leading-none tracking-tight text-secondary">
          {title}
        </h1>
      </div>
      {actions && <div className="flex gap-2 items-center md:self-end">{actions}</div>}
    </div>
  );
};

export default EditHeader;
