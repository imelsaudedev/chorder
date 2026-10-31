import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServiceArrangementMeta from './index';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
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

const defaultProps = {
  arrangement: baseArrangement,
  isEditing: false,
  isSaving: false,
  isDirty: false,
  onStartEdit: vi.fn(),
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('ServiceArrangementMeta', () => {
  it('mostra tom, referências e lápis/salvar-cancelar (controles de mobile)', () => {
    render(<ServiceArrangementMeta {...defaultProps} />);
    expect(screen.getByTestId('key-selector')).toBeDefined();
    expect(screen.getByTestId('media-references')).toBeDefined();
    expect(screen.getByTestId('edit-or-save-cancel')).toBeDefined();
  });

  it('esconde tom e referências durante a edição', () => {
    render(<ServiceArrangementMeta {...defaultProps} isEditing />);
    expect(screen.queryByTestId('key-selector')).toBeNull();
    expect(screen.queryByTestId('media-references')).toBeNull();
    expect(screen.getByTestId('edit-or-save-cancel')).toBeDefined();
  });

  it('não renderiza nada quando a música não está disponível', () => {
    const { container } = render(
      <ServiceArrangementMeta {...defaultProps} arrangement={{ ...baseArrangement, song: undefined }} />
    );
    expect(container.firstChild).toBeNull();
  });
});
