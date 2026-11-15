import { act, render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FloatingAddLink from './index';
import { AudioPlayerProvider, useAudioPlayer } from '@/components/common/AudioPlayer/context';
import { YoutubePlayerProvider } from '@/components/common/YoutubePlayer/context';

function Harness() {
  const { play } = useAudioPlayer();
  return (
    <>
      <button onClick={() => play([{ url: 'a.mp3', label: 'Voz' }])}>tocar</button>
      <FloatingAddLink href="/" label="Adicionar" />
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

describe('FloatingAddLink', () => {
  it('fica na posição padrão quando nenhuma mídia está tocando', () => {
    const { container } = renderWithProviders();
    const wrapper = container.querySelector('.fixed')!;
    expect(wrapper.className).toMatch(/bottom-24/);
    expect(wrapper.className).not.toMatch(/bottom-44/);
  });

  it('sobe de posição quando a barra de mídia abre', async () => {
    const { container } = renderWithProviders();
    await act(async () => {
      screen.getByText('tocar').click();
    });
    const wrapper = container.querySelector('.fixed')!;
    expect(wrapper.className).toMatch(/bottom-44/);
  });
});
