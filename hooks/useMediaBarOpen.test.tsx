import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMediaBarOpen } from './useMediaBarOpen';
import { AudioPlayerProvider, useAudioPlayer } from '@/components/common/AudioPlayer/context';
import { YoutubePlayerProvider, useYoutubePlayer } from '@/components/common/YoutubePlayer/context';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <YoutubePlayerProvider>
      <AudioPlayerProvider>{children}</AudioPlayerProvider>
    </YoutubePlayerProvider>
  );
}

describe('useMediaBarOpen', () => {
  it('começa false quando nenhum player está aberto', () => {
    const { result } = renderHook(() => useMediaBarOpen(), { wrapper: Wrapper });
    expect(result.current).toBe(false);
  });

  it('fica true quando o player de áudio abre', () => {
    const { result } = renderHook(
      () => ({ mediaBarOpen: useMediaBarOpen(), audio: useAudioPlayer() }),
      { wrapper: Wrapper }
    );
    act(() => {
      result.current.audio.play([{ url: 'a.mp3', label: 'Voz' }]);
    });
    expect(result.current.mediaBarOpen).toBe(true);
  });

  it('fica true quando o player de vídeo abre', () => {
    const { result } = renderHook(
      () => ({ mediaBarOpen: useMediaBarOpen(), youtube: useYoutubePlayer() }),
      { wrapper: Wrapper }
    );
    act(() => {
      result.current.youtube.play('https://youtu.be/abc123DEF45');
    });
    expect(result.current.mediaBarOpen).toBe(true);
  });
});
