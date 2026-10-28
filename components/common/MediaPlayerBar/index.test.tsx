import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MediaPlayerBar from './index';

const baseProps = {
  icon: <span data-testid="icon" />,
  title: 'Faixa de Teste',
  isPlaying: false,
  currentTime: 30,
  duration: 120,
  volume: 0.8,
  muted: false,
  onPlayPause: vi.fn(),
  onSeek: vi.fn(),
  onVolumeChange: vi.fn(),
  onToggleMute: vi.fn(),
  onClose: vi.fn(),
};

describe('MediaPlayerBar', () => {
  it('mostra título, ícone e tempos formatados', () => {
    render(<MediaPlayerBar {...baseProps} />);
    expect(screen.getByTestId('icon')).toBeDefined();
    expect(screen.getByText('Faixa de Teste')).toBeDefined();
    expect(screen.getByText('0:30')).toBeDefined();
    expect(screen.getByText('2:00')).toBeDefined();
  });

  it('mostra o ícone de tocar quando pausado, e de pausar quando tocando', () => {
    const { rerender } = render(<MediaPlayerBar {...baseProps} isPlaying={false} />);
    expect(screen.getByRole('button', { name: 'Tocar' })).toBeDefined();
    rerender(<MediaPlayerBar {...baseProps} isPlaying />);
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeDefined();
  });

  it('chama onPlayPause ao clicar no botão principal', async () => {
    const user = userEvent.setup();
    const onPlayPause = vi.fn();
    render(<MediaPlayerBar {...baseProps} onPlayPause={onPlayPause} />);
    await user.click(screen.getByRole('button', { name: 'Tocar' }));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('chama onClose ao clicar em fechar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MediaPlayerBar {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Fechar player' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onToggleMute e mostra o ícone certo', async () => {
    const user = userEvent.setup();
    const onToggleMute = vi.fn();
    render(<MediaPlayerBar {...baseProps} onToggleMute={onToggleMute} />);
    await user.click(screen.getByRole('button', { name: 'Mudo' }));
    expect(onToggleMute).toHaveBeenCalledTimes(1);
  });

  it('não mostra prev/next quando não há onPrev/onNext', () => {
    render(<MediaPlayerBar {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Faixa anterior' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Próxima faixa' })).toBeNull();
  });

  it('mostra prev/next e chama os callbacks quando fornecidos', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(<MediaPlayerBar {...baseProps} onPrev={onPrev} onNext={onNext} />);
    await user.click(screen.getByRole('button', { name: 'Faixa anterior' }));
    await user.click(screen.getByRole('button', { name: 'Próxima faixa' }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('mostra chips de faixa quando há mais de uma, e seleciona ao clicar', async () => {
    const user = userEvent.setup();
    const onSelectTrack = vi.fn();
    render(
      <MediaPlayerBar
        {...baseProps}
        subtitle="1/2"
        tracks={[{ label: 'Voz' }, { label: 'Playback' }]}
        currentTrackIndex={0}
        onSelectTrack={onSelectTrack}
      />
    );
    expect(screen.getByText('(1/2)')).toBeDefined();
    await user.click(screen.getByText('Playback'));
    expect(onSelectTrack).toHaveBeenCalledWith(1);
  });

  it('não mostra chips quando há só uma faixa', () => {
    render(<MediaPlayerBar {...baseProps} tracks={[{ label: 'Voz' }]} currentTrackIndex={0} />);
    expect(screen.queryByText('Voz')).toBeNull();
  });
});
