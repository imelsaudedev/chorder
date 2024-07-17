import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function useHrefWithParams(): (name: string, value: string) => string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createHrefWithParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  return createHrefWithParam;
}
