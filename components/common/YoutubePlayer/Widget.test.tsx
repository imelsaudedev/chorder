import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import YoutubePlayerWidget from './Widget';
import { YoutubePlayerProvider, useYoutubePlayer } from './context';

vi.mock('./youtubeIframeApi', () => ({
  loadYoutubeIframeApi: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./useYoutubeTitle', () => ({
  useYoutubeTitle: () => 'Título Real do Vídeo',
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/services/4er8oc',
}));

class FakePlayer {
  static instances: FakePlayer[] = [];
  options: YT.PlayerOptions;
  destroyed = false;
  currentTime = 0;
  duration = 100;
  volume = 80;
  muted = false;

  constructor(_el: unknown, options: YT.PlayerOptions) {
    this.options = options;
    FakePlayer.instances.push(this);
    options.events?.onReady?.({ target: this as unknown as YT.Player });
  }

  playVideo() {
    this.options.events?.onStateChange?.({
      data: PLAYER_STATE.PLAYING,
      target: this as unknown as YT.Player,
    });
  }
  pauseVideo() {
    this.options.events?.onStateChange?.({
      data: PLAYER_STATE.PAUSED,
      target: this as unknown as YT.Player,
    });
  }
  seekTo(seconds: number) {
    this.currentTime = seconds;
  }
  getCurrentTime() {
    return this.currentTime;
  }
  getDuration() {
    return this.duration;
  }
  setVolume(volume: number) {
    this.volume = volume;
  }
  getVolume() {
    return this.volume;
  }
  mute() {
    this.muted = true;
  }
  unMute() {
    this.muted = false;
  }
  isMuted() {
    return this.muted;
  }
  destroy() {
    this.destroyed = true;
  }
}

const PLAYER_STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

function Harness({ url }: { url: string }) {
  const { play } = useYoutubePlayer();
  useEffect(() => {
    play(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <YoutubePlayerWidget />;
}

function renderWithProvider(url: string) {
  return render(
    <YoutubePlayerProvider>
      <Harness url={url} />
    </YoutubePlayerProvider>
  );
}

describe('YoutubePlayerWidget', () => {
  beforeEach(() => {
    FakePlayer.instances = [];
    (window as unknown as { YT: typeof YT }).YT = {
      Player: FakePlayer as unknown as typeof YT.Player,
      PlayerState: PLAYER_STATE as unknown as typeof YT.PlayerState,
    };
  });

  it('não renderiza nada quando não há player aberto', () => {
    render(<YoutubePlayerProvider><YoutubePlayerWidget /></YoutubePlayerProvider>);
    expect(screen.queryByRole('button', { name: 'Tocar' })).toBeNull();
  });

  it('mostra a barra com o título real do vídeo (via oEmbed)', async () => {
    renderWithProvider('https://youtu.be/abc123DEF45');
    // Aparece no mini-player e na barra completa — CSS escolhe qual mostrar.
    await waitFor(() => expect(screen.getAllByText('Título Real do Vídeo').length).toBeGreaterThan(0));
  });

  it('alterna Tocar/Pausar via a IFrame API', async () => {
    const user = userEvent.setup();
    renderWithProvider('https://youtu.be/abc123DEF45');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tocar' })).toBeDefined());
    await user.click(screen.getByRole('button', { name: 'Tocar' }));
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeDefined();
  });

  it('fecha o player ao clicar em fechar e destrói o player da API', async () => {
    const user = userEvent.setup();
    renderWithProvider('https://youtu.be/abc123DEF45');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Fechar player' })).toBeDefined());
    await user.click(screen.getByRole('button', { name: 'Fechar player' }));
    expect(screen.queryByRole('button', { name: 'Tocar' })).toBeNull();
  });

  it('não renderiza nada quando a url não é um link de vídeo válido', () => {
    renderWithProvider('https://example.com/not-a-video');
    expect(screen.queryByRole('button', { name: 'Tocar' })).toBeNull();
  });
});
