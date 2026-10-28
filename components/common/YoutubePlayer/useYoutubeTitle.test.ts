import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { useYoutubeTitle } from './useYoutubeTitle';

describe('useYoutubeTitle', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('retorna null enquanto a url é nula', () => {
    const { result } = renderHook(() => useYoutubeTitle(null));
    expect(result.current).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('busca o título via oEmbed e retorna quando a chamada resolve', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Música Incrível (Ao Vivo)' }),
    });

    const { result } = renderHook(() => useYoutubeTitle('https://youtu.be/abc123DEF45'));
    expect(result.current).toBeNull();

    await waitFor(() => expect(result.current).toBe('Música Incrível (Ao Vivo)'));
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.youtube.com/oembed?url=')
    );
  });

  it('mantém null quando a chamada falha', async () => {
    (global.fetch as any).mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useYoutubeTitle('https://youtu.be/falhaXYZ123'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(result.current).toBeNull();
  });

  it('usa o cache em memória numa segunda chamada pra mesma url', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Cacheado' }),
    });

    const first = renderHook(() => useYoutubeTitle('https://youtu.be/cache12345A'));
    await waitFor(() => expect(first.result.current).toBe('Cacheado'));

    (global.fetch as any).mockClear();
    const second = renderHook(() => useYoutubeTitle('https://youtu.be/cache12345A'));
    expect(second.result.current).toBe('Cacheado');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
