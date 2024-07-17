import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function useUpdateParams(): (name: string, value: string) => void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      router.push(`${pathname}?${params.toString()}`, { shallow: true });
    },
    [pathname, router, searchParams]
  );

  return updateParams;
}
