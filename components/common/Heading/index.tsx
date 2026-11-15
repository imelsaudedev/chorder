import Text, { TextVariant } from "@/components/common/Text";

const levelVariant: Record<number, TextVariant> = {
  1: "heading-xl",
  2: "heading-lg",
  3: "heading-md",
  4: "heading-md",
  5: "heading-sm",
  6: "heading-sm",
};

const levelTag: Record<number, keyof React.JSX.IntrinsicElements> = {
  1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6",
};

export default function Heading({
  level,
  className,
  children,
}: {
  level: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Text
      variant={levelVariant[level] ?? "heading-xl"}
      as={levelTag[level] ?? "h1"}
      className={className}
    >
      {children}
    </Text>
  );
}
