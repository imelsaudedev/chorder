import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceArrangementHeader from './ServiceArrangementHeader';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ density: 'normal' }),
}));

vi.mock('@/components/service/ServiceView/KeySelectorButton', () => ({
  default: () => <div data-testid="key-selector" />,
}));

vi.mock('@/components/service/ServiceView/ServiceMediaReferences', () => ({
  default: () => <div data-testid="media-references" />,
}));

vi.mock('@/components/service/ServiceView/EditOrSaveCancelGroup', () => ({
  default: () => <div data-testid="edit-or-save-cancel" />,
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

const defaultProps = {
  arrangement: baseArrangement,
  order: 1,
  isEditing: false,
  isSaving: false,
  isDirty: false,
  onStartEdit: vi.fn(),
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('ServiceArrangementHeader', () => {
  it('renders song title', () => {
    render(<ServiceArrangementHeader {...defaultProps} />);
    expect(screen.getByText(/Glória e Força/)).toBeDefined();
  });

  it('mostra tom, referências e lápis/salvar-cancelar na mesma linha do título (desktop)', () => {
    render(<ServiceArrangementHeader {...defaultProps} />);
    expect(screen.getByTestId('key-selector')).toBeDefined();
    expect(screen.getByTestId('media-references')).toBeDefined();
    expect(screen.getByTestId('edit-or-save-cancel')).toBeDefined();
  });

  it('esconde tom e referências durante a edição', () => {
    render(<ServiceArrangementHeader {...defaultProps} isEditing />);
    expect(screen.queryByTestId('key-selector')).toBeNull();
    expect(screen.queryByTestId('media-references')).toBeNull();
    expect(screen.getByTestId('edit-or-save-cancel')).toBeDefined();
  });
});
