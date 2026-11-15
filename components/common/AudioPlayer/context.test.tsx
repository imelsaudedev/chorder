import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AudioPlayerProvider, useAudioPlayer } from './context';

describe('AudioPlayerContext', () => {
  it('começa fechado, sem arrangementId', () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.arrangementId).toBeNull();
  });

  it('guarda o arrangementId passado ao play()', () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider });
    act(() => {
      result.current.play([{ url: 'a.mp3', label: 'Voz' }], 'Música', 0, 42);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.arrangementId).toBe(42);
  });

  it('play() sem arrangementId guarda null', () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider });
    act(() => {
      result.current.play([{ url: 'a.mp3', label: 'Voz' }]);
    });
    expect(result.current.arrangementId).toBeNull();
  });

  it('close() mantém o arrangementId (só fecha isOpen)', () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider });
    act(() => {
      result.current.play([{ url: 'a.mp3', label: 'Voz' }], 'Música', 0, 42);
    });
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.arrangementId).toBe(42);
  });
});
