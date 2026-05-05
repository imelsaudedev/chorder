import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFormattedDate } from './useFormattedDate';

vi.mock('next-intl', () => ({
  useLocale: () => 'es'
}));

describe('useFormattedDate', () => {
  it('formats dates properly', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const { result } = renderHook(() => useFormattedDate(date));
    expect(typeof result.current).toBe('string');
    // Using string matching since Intl formatting might differ slightly across environments
    expect(result.current.toLowerCase()).toContain('lunes');
    expect(result.current.toLowerCase()).toContain('1');
    expect(result.current.toLowerCase()).toContain('2024');
  });

  it('handles string date inputs', () => {
    const { result } = renderHook(() => useFormattedDate('2024-01-01T12:00:00Z'));
    expect(typeof result.current).toBe('string');
  });
});
