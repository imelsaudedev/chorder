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

vi.mock('@/components/common/AudioReferenceButton', () => ({
  default: () => <button data-testid="audio-btn" />,
}));

vi.mock('@/components/common/YoutubeReferenceButton', () => ({
  default: () => <button data-testid="youtube-btn" />,
}));

vi.mock('@/components/config/KeyButtonSet', () => ({
  default: () => <div data-testid="key-button-set" />,
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
  onStartEdit: vi.fn(),
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('ServiceArrangementHeader — view mode', () => {
  it('renders song title', () => {
    render(<ServiceArrangementHeader {...defaultProps} />);
    expect(screen.getByText(/Glória e Força/)).toBeDefined();
  });

  it('calls onStartEdit when pencil clicked (desktop)', async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(<ServiceArrangementHeader {...defaultProps} onStartEdit={onStartEdit} />);
    const pencilBtn = screen.getAllByRole('button').find(
      (b) => b.className.includes('hidden md:flex')
    );
    expect(pencilBtn).toBeDefined();
    await user.click(pencilBtn!);
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  it('shows youtube and audio buttons when urls present', () => {
    render(
      <ServiceArrangementHeader
        {...defaultProps}
        arrangement={{
          ...baseArrangement,
          youtubeUrl: 'https://yt.be/x',
          audios: [{ id: 1, url: 'https://audio.mp3', label: 'Voz', order: 0 }],
        }}
      />
    );
    expect(screen.getByTestId('youtube-btn')).toBeDefined();
    expect(screen.getByTestId('audio-btn')).toBeDefined();
  });

  it('hides media buttons in edit mode', () => {
    render(
      <ServiceArrangementHeader
        {...defaultProps}
        isEditing
        arrangement={{
          ...baseArrangement,
          youtubeUrl: 'https://yt.be/x',
          audios: [{ id: 1, url: 'https://audio.mp3', label: 'Voz', order: 0 }],
        }}
      />
    );
    expect(screen.queryByTestId('youtube-btn')).toBeNull();
    expect(screen.queryByTestId('audio-btn')).toBeNull();
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
    const buttons = screen.getAllByRole('button');
    const cancelBtn = buttons.find((b) => b.querySelector('svg'));
    // cancel is the last icon button in edit mode
    const cancelBtnEl = buttons[buttons.length - 1];
    await user.click(cancelBtnEl);
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
    const user = userEvent.setup();
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
