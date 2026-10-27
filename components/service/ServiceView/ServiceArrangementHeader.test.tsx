import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const defaultProps = {
  arrangement: baseArrangement,
  order: 1,
  isEditing: false,
  isSaving: false,
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('ServiceArrangementHeader — view mode', () => {
  it('renders song title', () => {
    render(<ServiceArrangementHeader {...defaultProps} />);
    expect(screen.getByText(/Glória e Força/)).toBeDefined();
  });

  it('shows no buttons outside of edit mode (tom/referências/lápis ficam em ServiceArrangementMeta)', () => {
    render(<ServiceArrangementHeader {...defaultProps} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('ServiceArrangementHeader — edit mode, no original', () => {
  const editProps = { ...defaultProps, isEditing: true };

  it('calls onSaveServiceOnly directly when save clicked (no original)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<ServiceArrangementHeader {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when X button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ServiceArrangementHeader {...editProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancelEdit/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables save and cancel when isSaving', () => {
    render(<ServiceArrangementHeader {...editProps} isSaving />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    const disabledButtons = buttons.filter((b) => b.disabled);
    expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ServiceArrangementHeader — edit mode, with original', () => {
  const withOriginal = { ...baseArrangement, originalArrangementId: 1 };
  const editProps = { ...defaultProps, isEditing: true, arrangement: withOriginal };

  it('opens scope dialog when save clicked', async () => {
    const user = userEvent.setup();
    render(<ServiceArrangementHeader {...editProps} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(screen.getByRole('dialog')).toBeDefined();
  });

  it('calls onSaveServiceOnly and closes dialog when service-only chosen', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<ServiceArrangementHeader {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    await user.click(screen.getByRole('button', { name: /serviceOnly/i }));
    expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('calls onSaveBoth and closes dialog when both chosen', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const onSaveBoth = vi.fn();
    render(<ServiceArrangementHeader {...editProps} onSaveBoth={onSaveBoth} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    await user.click(screen.getByRole('button', { name: /serviceAndOriginal/i }));
    expect(onSaveBoth).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not call onSaveServiceOnly directly (opens dialog instead)', async () => {
    const user = userEvent.setup();
    const onSaveServiceOnly = vi.fn();
    render(<ServiceArrangementHeader {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
    await user.click(screen.getByRole('button', { name: /saveChanges/i }));
    expect(onSaveServiceOnly).not.toHaveBeenCalled();
  });
});
