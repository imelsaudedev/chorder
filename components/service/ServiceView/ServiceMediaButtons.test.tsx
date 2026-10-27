import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceMediaButtons from './ServiceMediaButtons';

vi.mock('swr', () => ({
  useSWRConfig: () => ({ mutate: vi.fn() }),
}));

const baseProps = {
  originalArrangementId: 42,
  youtubeUrl: null,
  audios: [],
};

describe('ServiceMediaButtons — upload de áudio', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/upload-audio') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ url: 'https://blob.example/audio/track.mp3' }),
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  it('envia o arquivo via FormData simples (não o protocolo de token do @vercel/blob/client)', async () => {
    const user = userEvent.setup();
    render(<ServiceMediaButtons {...baseProps} />);

    await user.click(screen.getByTitle(/áudio/i));
    const fileInput = screen.getByRole('button', { name: /adicionar áudio/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['conteúdo'], 'ensaio.mp3', { type: 'audio/mpeg' });
    await user.upload(fileInput, file);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/upload-audio',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    ));

    expect(await screen.findByDisplayValue('ensaio')).toBeDefined();
  });
});
