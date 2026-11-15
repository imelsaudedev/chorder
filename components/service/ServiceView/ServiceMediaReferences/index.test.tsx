import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import ServiceMediaReferences from './index';
import { YoutubePlayerProvider } from '@/components/common/YoutubePlayer/context';
import { AudioPlayerProvider } from '@/components/common/AudioPlayer/context';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { error: vi.fn() }) }));
const toastFn = toast as unknown as ReturnType<typeof vi.fn> & { error: ReturnType<typeof vi.fn> };

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
  songId: 7,
  originalArrangementId: 42,
  youtubeUrl: null,
  audios: [],
  title: 'Música de Teste',
};

describe('ServiceMediaReferences', () => {
  beforeEach(() => {
    toastFn.mockClear();
    toastFn.error.mockClear();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  it('mostra o botão "+ Referências" quando não há mídia', () => {
    renderWithProviders(baseProps);
    expect(screen.getByRole('button', { name: 'mediaButtonLabelEmpty' })).toBeDefined();
  });

  it('abre a lista e mostra "Adicionar vídeo"/"Adicionar áudio" quando vazio', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelEmpty' }));
    expect(screen.getByText('mediaAddVideo')).toBeDefined();
    expect(screen.getByText('mediaAddAudio')).toBeDefined();
  });

  it('valida o link do vídeo antes de salvar', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelEmpty' }));
    await user.click(screen.getByText('mediaAddVideo'));
    const input = screen.getByPlaceholderText('mediaVideoPlaceholder');
    await user.type(input, 'não é um link');
    await user.keyboard('{Enter}');
    expect(screen.getByText('mediaVideoErrorInvalid')).toBeDefined();
  });

  it('salva o vídeo via PATCH quando o arranjo original já existe', async () => {
    const user = userEvent.setup();
    renderWithProviders(baseProps);
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelEmpty' }));
    await user.click(screen.getByText('mediaAddVideo'));
    const input = screen.getByPlaceholderText('mediaVideoPlaceholder');
    await user.type(input, 'https://youtu.be/abc123DEF45');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/arrangements/42',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ youtubeUrl: 'https://youtu.be/abc123DEF45' }) })
    ));
  });

  it('cria um arranjo mínimo antes de salvar quando não há originalArrangementId', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/songs/7/arrangements') {
        return Promise.resolve({ ok: true, json: async () => ({ id: 99 }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    renderWithProviders({ ...baseProps, originalArrangementId: null });
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelEmpty' }));
    await user.click(screen.getByText('mediaAddVideo'));
    await user.type(screen.getByPlaceholderText('mediaVideoPlaceholder'), 'https://youtu.be/abc123DEF45');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/songs/7/arrangements', { method: 'POST' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/arrangements/99',
      expect.objectContaining({ method: 'PATCH' })
    ));
  });

  it('mostra o chip de vídeo e toca ao clicar', async () => {
    const user = userEvent.setup();
    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtu.be/abc123DEF45' });
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' }));
    await user.click(screen.getByText('mediaVideoLabel'));
    // player abre e a lista fecha — sem lançar erro
    expect(screen.queryByText('mediaVideoLabel')).toBeNull();
  });

  it('realça o botão quando este arranjo está tocando', async () => {
    const user = userEvent.setup();
    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtu.be/abc123DEF45' });
    const trigger = screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' });
    expect(trigger.className).not.toMatch(/ring-2/);

    await user.click(trigger);
    await user.click(screen.getByText('mediaVideoLabel'));

    expect(trigger.className).toMatch(/ring-2/);
  });

  it('troca o rótulo genérico pelo título real do vídeo quando o oEmbed responde', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementation((url: string) => {
      if (typeof url === 'string' && url.startsWith('https://www.youtube.com/oembed')) {
        return Promise.resolve({ ok: true, json: async () => ({ title: 'Nome Real do Vídeo' }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtu.be/tituloReal1' });
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' }));

    await waitFor(() => expect(screen.getByText('Nome Real do Vídeo')).toBeDefined());
    expect(screen.queryByText('mediaVideoLabel')).toBeNull();
  });

  it('remover agenda um toast com desfazer, e desfazer cancela a remoção', async () => {
    const user = userEvent.setup();
    renderWithProviders({ ...baseProps, youtubeUrl: 'https://youtu.be/abc123DEF45' });
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' }));
    await user.click(screen.getByRole('button', { name: 'mediaRemoveVideo' }));

    expect(toastFn).toHaveBeenCalledWith(
      'mediaRemoved',
      expect.objectContaining({ duration: 6000, action: expect.objectContaining({ label: 'mediaUndo' }) })
    );
    // some da lista imediatamente (otimista)
    expect(screen.queryByText('mediaVideoLabel')).toBeNull();

    const onUndo = toastFn.mock.calls[0][1].action.onClick;
    act(() => onUndo());

    expect(screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' })).toBeDefined();
    expect(screen.getByText('mediaVideoLabel')).toBeDefined();
    // nenhuma chamada de mutação foi feita — desfazer antes do commit
    // (a lista pode ter buscado o título do vídeo via oEmbed ao abrir, o que é esperado)
    const mutationCalls = (global.fetch as any).mock.calls.filter(
      ([url]: [string]) => typeof url === 'string' && url.startsWith('/api/')
    );
    expect(mutationCalls).toHaveLength(0);
  });

  it('renomeia um áudio existente', async () => {
    const user = userEvent.setup();
    renderWithProviders({
      ...baseProps,
      audios: [{ id: 1, url: 'https://x/a.mp3', label: 'Voz', order: 0 }],
    });
    await user.click(screen.getByRole('button', { name: 'mediaButtonLabelWithMedia' }));
    await user.click(screen.getByRole('button', { name: 'mediaRenameAudio' }));
    const input = screen.getByDisplayValue('Voz');
    await user.clear(input);
    await user.type(input, 'Voz (ensaio){Enter}');

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/arrangements/42/audios/1',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ label: 'Voz (ensaio)' }) })
    ));
  });
});
