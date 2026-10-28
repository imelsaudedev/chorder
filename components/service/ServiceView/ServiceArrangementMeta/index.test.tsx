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

const defaultProps = {
  arrangement: baseArrangement,
  isEditing: false,
  isSaving: false,
  onStartEdit: vi.fn(),
  onCancel: vi.fn(),
  onSaveServiceOnly: vi.fn(),
  onSaveBoth: vi.fn(),
};

describe('ServiceArrangementMeta', () => {
  beforeEach(() => {
    transpose = 0;
    setTranspose.mockClear();
  });

  it('mostra autor e arranjo quando presentes', () => {
    render(<ServiceArrangementMeta {...defaultProps} />);
    expect(screen.getByText('Vencedores por Cristo · Violão e voz')).toBeDefined();
  });

  it('omite a linha de autor/arranjo quando ambos faltam', () => {
    render(
      <ServiceArrangementMeta
        {...defaultProps}
        arrangement={{ ...baseArrangement, name: null, song: { ...baseArrangement.song!, artist: null } }}
      />
    );
    expect(screen.queryByText(/·/)).toBeNull();
  });

  it('renderiza as referências de mídia', () => {
    render(<ServiceArrangementMeta {...defaultProps} />);
    expect(screen.getByTestId('media-references')).toBeDefined();
  });

  it('chama onStartEdit ao clicar no lápis, só fora da edição', async () => {
    const user = userEvent.setup();
    const onStartEdit = vi.fn();
    render(<ServiceArrangementMeta {...defaultProps} onStartEdit={onStartEdit} />);
    await user.click(screen.getByRole('button', { name: 'editChords' }));
    expect(onStartEdit).toHaveBeenCalledTimes(1);
  });

  it('esconde tom e lápis durante a edição', () => {
    render(<ServiceArrangementMeta {...defaultProps} isEditing />);
    expect(screen.queryByRole('button', { name: 'editChords' })).toBeNull();
    expect(screen.queryByText(/^keyButtonLabel/)).toBeNull();
  });

  it('não mostra aviso de plano quando o tom não foi alterado', () => {
    render(<ServiceArrangementMeta {...defaultProps} />);
    expect(screen.queryByText(/^inPlanLabel/)).toBeNull();
  });

  it('mostra "No plano" e volta ao tom original ao clicar', async () => {
    transpose = 2;
    const user = userEvent.setup();
    render(<ServiceArrangementMeta {...defaultProps} />);
    expect(screen.getByText('inPlanLabel:{"key":"D"}')).toBeDefined();
    await user.click(screen.getByText('backToPlan'));
    expect(setTranspose).toHaveBeenCalledWith(0);
  });

  describe('edição — sem original', () => {
    const editProps = { ...defaultProps, isEditing: true, arrangement: { ...baseArrangement, originalArrangementId: null } };

    it('calls onSaveServiceOnly directly when save clicked (no original)', async () => {
      const user = userEvent.setup();
      const onSaveServiceOnly = vi.fn();
      render(<ServiceArrangementMeta {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
      await user.click(screen.getByRole('button', { name: /saveChanges/i }));
      expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when X button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ServiceArrangementMeta {...editProps} onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: /cancelEdit/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables save and cancel when isSaving', () => {
      render(<ServiceArrangementMeta {...editProps} isSaving />);
      const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
      const disabledButtons = buttons.filter((b) => b.disabled);
      expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('edição — com original', () => {
    const editProps = { ...defaultProps, isEditing: true, arrangement: { ...baseArrangement, originalArrangementId: 1 } };

    it('opens scope dialog when save clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceArrangementMeta {...editProps} />);
      await user.click(screen.getByRole('button', { name: /saveChanges/i }));
      expect(screen.getByRole('dialog')).toBeDefined();
    });

    it('calls onSaveServiceOnly and closes dialog when service-only chosen', async () => {
      const user = userEvent.setup();
      const onSaveServiceOnly = vi.fn();
      render(<ServiceArrangementMeta {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
      await user.click(screen.getByRole('button', { name: /saveChanges/i }));
      await user.click(screen.getByRole('button', { name: /serviceOnly/i }));
      expect(onSaveServiceOnly).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('calls onSaveBoth and closes dialog when both chosen', async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      const onSaveBoth = vi.fn();
      render(<ServiceArrangementMeta {...editProps} onSaveBoth={onSaveBoth} />);
      await user.click(screen.getByRole('button', { name: /saveChanges/i }));
      await user.click(screen.getByRole('button', { name: /serviceAndOriginal/i }));
      expect(onSaveBoth).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('does not call onSaveServiceOnly directly (opens dialog instead)', async () => {
      const user = userEvent.setup();
      const onSaveServiceOnly = vi.fn();
      render(<ServiceArrangementMeta {...editProps} onSaveServiceOnly={onSaveServiceOnly} />);
      await user.click(screen.getByRole('button', { name: /saveChanges/i }));
      expect(onSaveServiceOnly).not.toHaveBeenCalled();
    });
  });
});
