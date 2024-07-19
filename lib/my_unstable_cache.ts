// There is a known bug in the `unstable_cache` function that causes it to not deserialize dates. This is a workaround until the bug is fixed.
// https://github.com/vercel/next.js/issues/51613#issuecomment-1892644565
// The PR has been accepted, but it is still not released: https://github.com/formbricks/formbricks/pull/2541
import { unstable_cache } from 'next/cache';
import { parse, stringify } from 'superjson';

export const my_unstable_cache = <T, P extends unknown[]>(
  fn: (...params: P) => Promise<T>,
  keys: Parameters<typeof unstable_cache>[1],
  opts: Parameters<typeof unstable_cache>[2]
) => {
  const wrap = async (params: unknown[]): Promise<string> => {
    const result = await fn(...(params as P));
    return stringify(result);
  };

  const cachedFn = unstable_cache(wrap, keys, opts);

  return async (...params: P): Promise<T> => {
    const result = await cachedFn(params);
    return parse(result);
  };
};
