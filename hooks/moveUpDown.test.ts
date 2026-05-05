import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMoveUnitDown, useMoveUnitUp } from './moveUpDown';

describe('moveUpDown hooks', () => {
  it('useMoveUnitDown swaps if not at max index', () => {
    const swap = vi.fn();
    const { result } = renderHook(() => useMoveUnitDown(swap, 5));
    
    act(() => {
      result.current(2);
    });
    
    expect(swap).toHaveBeenCalledWith(2, 3);
  });

  it('useMoveUnitDown does not swap if at max index', () => {
    const swap = vi.fn();
    const { result } = renderHook(() => useMoveUnitDown(swap, 5));
    
    act(() => {
      result.current(5);
    });
    
    expect(swap).not.toHaveBeenCalled();
  });

  it('useMoveUnitUp swaps if not at index 0', () => {
    const swap = vi.fn();
    const { result } = renderHook(() => useMoveUnitUp(swap));
    
    act(() => {
      result.current(2);
    });
    
    expect(swap).toHaveBeenCalledWith(2, 1);
  });

  it('useMoveUnitUp does not swap if at index 0', () => {
    const swap = vi.fn();
    const { result } = renderHook(() => useMoveUnitUp(swap));
    
    act(() => {
      result.current(0);
    });
    
    expect(swap).not.toHaveBeenCalled();
  });
});
