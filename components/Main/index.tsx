export default function Main({ className, children }: { className?: string; children?: React.ReactNode }) {
  const classNames = ['px-4', 'pt-4', 'pb-4'];
  if (className) {
    classNames.push(className);
  }

  return <main className={classNames.join(' ')}>{children}</main>;
}
