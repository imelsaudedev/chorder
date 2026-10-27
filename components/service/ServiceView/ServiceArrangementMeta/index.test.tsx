import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import ServiceArrangementMeta from './index';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock('@/components/service/ServiceView/ServiceMediaReferences', () => ({
  default: () => <div data-testid="media-references" />,
}));

let transpose = 0;
const setTranspose = vi.fn((updater: number | ((n: number) => number)) => {
  transpose = typeof updater === 'function' ? updater(transpose) : updater;
});
vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose, setTranspose, setEnharmonicPreference: vi.fn() }),
}));

const baseArrangement: ClientArrangement = {
  id: 14,
  songId: 53,
  originalArrangementId: 1,
  key: 'D',
  name: 'Violão e voz',
  isDefault: false,
  isDeleted: false,
  isServiceArrangement: true,
  youtubeUrl: null,
  audios: [],
  song: {
    id: 53,
    title: 'Glória e Força',
    slug: 'gloria-e-forca',
    artist: 'Vencedores por Cristo',
    lyrics: '',
    isDeleted: false,
  },
  units: [],
};

describe('ServiceArrangementMeta', () => {
  beforeEach(() => {
    transpose = 0;
    setTranspose.mockClear();
  });

  it('mostra autor e arranjo quando presentes', () => {
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing={false} onStartEdit={vi.fn()} />);
    expect(screen.getByText('Vencedores por Cristo · Violão e voz')).toBeDefined();
  });

  it('omite a linha de autor/arranjo quando ambos faltam', () => {
    render(
      <ServiceArrangementMeta
        arrangement={{ ...baseArrangement, name: null, song: { ...baseArrangement.song!, artist: null } }}
        isEditing={false}
        onStartEdit={vi.fn()}
      />
    );
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it('renderiza as referências de mídia', () => {
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing={false} onStartEdit={vi.fn()} />);
    expect(screen.getByTestId('media-references')).toBeDefined();
  });

  it('chama onStartEdit ao clicar no lápis, só fora da edição', async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing={false} onStartEdit={onStartEdit} />);
    await user.click(screen.getByRole('button', { name: 'editChords' }));
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  it('esconde tom e lápis durante a edição', () => {
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing onStartEdit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'editChords' })).toBeNull();
    expect(screen.queryByText(/^keyButtonLabel/)).toBeNull();
  });

  it('não mostra aviso de plano quando o tom não foi alterado', () => {
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing={false} onStartEdit={vi.fn()} />);
    expect(screen.queryByText(/^inPlanLabel/)).toBeNull();
  });

  it('mostra "No plano" e volta ao tom original ao clicar', async () => {
    transpose = 2;
    const user = userEvent.setup();
    render(<ServiceArrangementMeta arrangement={baseArrangement} isEditing={false} onStartEdit={vi.fn()} />);
    expect(screen.getByText('inPlanLabel:{"key":"D"}')).toBeDefined();
    await user.click(screen.getByText('backToPlan'));
    expect(setTranspose).toHaveBeenCalledWith(0);
  });
});
