import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { YoutubePlayerProvider, useYoutubePlayer } from './context';

describe('YoutubePlayerContext', () => {
  it('começa fechado, sem arrangementId', () => {
    const { result } = renderHook(() => useYoutubePlayer(), { wrapper: YoutubePlayerProvider });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.arrangementId).toBeNull();
  });

  it('guarda o arrangementId passado ao play()', () => {
    const { result } = renderHook(() => useYoutubePlayer(), { wrapper: YoutubePlayerProvider });
    act(() => {
      result.current.play('https://youtu.be/abc123DEF45', 'Música', 42);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.arrangementId).toBe(42);
  });

  it('play() sem arrangementId guarda null', () => {
    const { result } = renderHook(() => useYoutubePlayer(), { wrapper: YoutubePlayerProvider });
    act(() => {
      result.current.play('https://youtu.be/abc123DEF45');
    });
    expect(result.current.arrangementId).toBeNull();
  });
});
