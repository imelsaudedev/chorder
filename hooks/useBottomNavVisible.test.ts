import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBottomNavVisible } from './useBottomNavVisible';

let pathname = '/songs';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

describe('useBottomNavVisible', () => {
  it('true numa página de lista (/songs, /services)', () => {
    pathname = '/songs';
    expect(renderHook(() => useBottomNavVisible()).result.current).toBe(true);
    pathname = '/services';
    expect(renderHook(() => useBottomNavVisible()).result.current).toBe(true);
  });

  it('false numa página de detalhe', () => {
    pathname = '/services/4er8oc';
    expect(renderHook(() => useBottomNavVisible()).result.current).toBe(false);
  });

  it('false numa página de edição', () => {
    pathname = '/songs/gloria-e-forca/edit';
    expect(renderHook(() => useBottomNavVisible()).result.current).toBe(false);
  });

  it('false em páginas que não são de lista nem detalhe (ex. admin/templates)', () => {
    pathname = '/admin/templates';
    expect(renderHook(() => useBottomNavVisible()).result.current).toBe(false);
  });
});
