import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { beforeAll, describe, it, expect, vi } from 'vitest';
import AudioPlayerWidget from './Widget';
import { AudioItem, AudioPlayerProvider, useAudioPlayer } from './context';

vi.mock('next/navigation', () => ({
  usePathname: () => '/services/4er8oc',
}));

beforeAll(() => {
  // jsdom não implementa reprodução de mídia de verdade.
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
});

function Harness({ audios, title }: { audios: AudioItem[]; title?: string }) {
  const { play } = useAudioPlayer();
  useEffect(() => {
    play(audios, title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <AudioPlayerWidget />;
}

function renderWithProvider(audios: AudioItem[], title?: string) {
  return render(
    <AudioPlayerProvider>
      <Harness audios={audios} title={title} />
    </AudioPlayerProvider>
  );
}

describe('AudioPlayerWidget', () => {
  it('não renderiza nada quando não há player aberto', () => {
    render(<AudioPlayerProvider><AudioPlayerWidget /></AudioPlayerProvider>);
    expect(screen.queryByRole('button', { name: 'Tocar' })).toBeNull();
  });

  it('mostra a barra com o nome da faixa ao abrir', () => {
    renderWithProvider([{ url: 'https://x/voz.mp3', label: 'Voz' }], 'Música Teste');
    // Aparece no mini-player e na barra completa — CSS escolhe qual mostrar.
    expect(screen.getAllByText('Voz').length).toBeGreaterThan(0);
  });

  it('toca/pausa a tag <audio> ao clicar no botão principal', async () => {
    const user = userEvent.setup();
    renderWithProvider([{ url: 'https://x/voz.mp3', label: 'Voz' }]);
    await user.click(screen.getByRole('button', { name: 'Tocar' }));
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('atualiza o tempo mostrado quando a tag <audio> dispara timeupdate', () => {
    const { container } = renderWithProvider([{ url: 'https://x/voz.mp3', label: 'Voz' }]);
    const audio = container.querySelector('audio')!;
    Object.defineProperty(audio, 'currentTime', { value: 42, configurable: true });
    fireEvent.timeUpdate(audio);
    expect(screen.getByText('0:42')).toBeDefined();
  });

  it('não mostra prev/next com uma faixa só', () => {
    renderWithProvider([{ url: 'https://x/voz.mp3', label: 'Voz' }]);
    expect(screen.queryByRole('button', { name: 'Próxima faixa' })).toBeNull();
  });

  it('mostra chips e troca de faixa com múltiplos áudios', async () => {
    const user = userEvent.setup();
    renderWithProvider([
      { url: 'https://x/voz.mp3', label: 'Voz' },
      { url: 'https://x/playback.mp3', label: 'Playback' },
    ]);
    expect(screen.getByText('(1/2)')).toBeDefined();
    await user.click(screen.getByText('Playback'));
    expect(screen.getByText('(2/2)')).toBeDefined();
  });

  it('fecha o player ao clicar em fechar', async () => {
    const user = userEvent.setup();
    renderWithProvider([{ url: 'https://x/voz.mp3', label: 'Voz' }]);
    await user.click(screen.getByRole('button', { name: 'Fechar player' }));
    expect(screen.queryByRole('button', { name: 'Tocar' })).toBeNull();
  });
});
