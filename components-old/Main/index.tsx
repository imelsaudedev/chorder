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
    compact: 'px-2 sm:px-2 lg:px-4',
    normal: 'px-4 sm:px-6 lg:px-8',
  };

  const classNames = [densityClasses[density]];
  if (className) {
    classNames.push(className);
  }

  return <main className={classNames.join(' ')}>{children}</main>;
}
