import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScrollToTopButton from './index';
import { AudioPlayerProvider, useAudioPlayer } from '@/components/common/AudioPlayer/context';
import { YoutubePlayerProvider } from '@/components/common/YoutubePlayer/context';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

function Harness() {
  const { play } = useAudioPlayer();
  return (
    <>
      <button onClick={() => play([{ url: 'a.mp3', label: 'Voz' }])}>tocar</button>
      <ScrollToTopButton scrollThreshold={0} />
    </>
  );
}

function renderWithProviders() {
  return render(
    <YoutubePlayerProvider>
      <AudioPlayerProvider>
        <Harness />
      </AudioPlayerProvider>
    </YoutubePlayerProvider>
  );
}

describe('ScrollToTopButton', () => {
  it('fica na posição padrão quando nenhuma mídia está tocando', () => {
    renderWithProviders();
    const button = screen.getByRole('button', { name: /scrollToTop/i });
    expect(button.className).toMatch(/bottom-24/);
    expect(button.className).not.toMatch(/bottom-44/);
  });

  it('sobe de posição quando a barra de mídia abre', async () => {
    renderWithProviders();
    await act(async () => {
      screen.getByText('tocar').click();
    });
    const button = screen.getByRole('button', { name: /scrollToTop/i });
    expect(button.className).toMatch(/bottom-44/);
  });
});
