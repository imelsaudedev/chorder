export default function Main({
  className,
  density = 'normal',
  children,
}: {
  className?: string;
  density?: 'compact' | 'normal';
  children?: React.ReactNode;
}) {
  const densityClasses = {
    compact: 'p-2 sm:p-2 lg:p-4',
    normal: 'p-4 sm:p-6 lg:p-8',
  };

  const classNames = [densityClasses[density]];
  if (className) {
    classNames.push(className);
  }

  return <main className={classNames.join(' ')}>{children}</main>;
}
