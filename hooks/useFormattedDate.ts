import { useLocale } from "next-intl";

export function useFormattedDate(date: Date | string): string {
  const locale = useLocale();
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
    .format(new Date(date))
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/ de ([a-z])/, (m, c) => ` de ${c.toUpperCase() + m.slice(5)}`);

  return formattedDate;
}
