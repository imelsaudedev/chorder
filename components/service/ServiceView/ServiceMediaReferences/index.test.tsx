import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceMediaReferences from './index';
import { YoutubePlayerProvider } from '@/components/common/YoutubePlayer/context';
import { AudioPlayerProvider } from '@/components/common/AudioPlayer/context';

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(),
}));

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

function renderWithProviders(props: Parameters<typeof ServiceMediaReferences>[0]) {
  return render(
    <YoutubePlayerProvider>
      <AudioPlayerProvider>
        <ServiceMediaReferences {...props} />
      </AudioPlayerProvider>
    </YoutubePlayerProvider>
  );
}

const baseProps = {
  originalArrangementId: 42,
  youtubeUrl: null,
  audios: [],
  title: 'Glória e Força',
};

describe('ServiceMediaReferences', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it('shows add buttons when there is no media', () => {
    renderWithProviders(baseProps);
    expect(screen.getByRole('button', { name: /vídeo de referência/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /áudio de referência/i })).toBeDefined();
  });

  it('shows a chip with play/edit/remove when a video url is set', () => {
    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtube.com/watch?v=abc' });
    expect(screen.getByRole('button', { name: /editar vídeo de referência/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /remover vídeo de referência/i })).toBeDefined();
  });

  it('opens an inline input to add a video url (no modal)', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: /vídeo de referência/i }));
    expect(screen.getByPlaceholderText(/youtube.com/i)).toBeDefined();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('saves the video url via PATCH on the original arrangement', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: /vídeo de referência/i }));
    const input = screen.getByPlaceholderText(/youtube.com/i);
    await user.type(input, 'https://youtube.com/watch?v=zzz');
    await user.click(screen.getByRole('button', { name: /salvar vídeo de referência/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/arrangements/42',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ youtubeUrl: 'https://youtube.com/watch?v=zzz' }),
      })
    ));
  });

  it('removes the video url via PATCH with null', async () => {
    const user = userEvent.setup();
    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtube.com/watch?v=abc' });
    await user.click(screen.getByRole('button', { name: /remover vídeo de referência/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/arrangements/42',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ youtubeUrl: null }),
      })
    ));
  });

  it('opens the audio dialog when adding audio', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: /áudio de referência/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });
});
