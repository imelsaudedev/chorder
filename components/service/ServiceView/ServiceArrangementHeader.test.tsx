import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceArrangementHeader from './ServiceArrangementHeader';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose: 0, setTranspose: vi.fn(), density: 'normal' }),
}));

const baseArrangement: ClientArrangement = {
  id: 14,
  songId: 53,
  originalArrangementId: null,
  key: 'D',
  name: null,
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

describe('ServiceArrangementHeader', () => {
  it('renders song title', () => {
    render(<ServiceArrangementHeader arrangement={baseArrangement} order={1} />);
    expect(screen.getByText(/Glória e Força/)).toBeDefined();
  });

  it('shows no buttons (tom/referências/lápis/salvar/cancelar ficam em ServiceArrangementMeta)', () => {
    render(<ServiceArrangementHeader arrangement={baseArrangement} order={1} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
