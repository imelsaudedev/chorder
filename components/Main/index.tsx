export default function Main({ className, children }: { className?: string; children?: React.ReactNode }) {
  const classNames = [
    'px-4 sm:px-6 lg:px-8', // Padding horizontal responsivo
    'pt-4 sm:pt-6', // Padding superior responsivo
    'pb-4 sm:pb-6', // Padding inferior responsivo
    'mb-8 sm:mb-12', // Margem inferior responsiva
  ];
  if (className) {
    classNames.push(className);
  }

  return <main className={classNames.join(' ')}>{children}</main>;
}
