import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceSongUnitEditForm from './ServiceSongUnitEditForm';
import { useCreateOrUpdateArrangement } from '#api-client';
import { ClientServiceUnit } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('#api-client', () => ({
  useCreateOrUpdateArrangement: vi.fn(),
}));

vi.mock('@/components/song/ArrangementForm/SongUnitListForm', () => ({
  default: () => <div data-testid="song-unit-list-form" />,
}));

vi.mock('./SaveScopeDialog', () => ({
  default: ({ open, onSaveServiceOnly, onSaveWithOriginal, isSaving }: any) =>
    open ? (
      <div data-testid="save-scope-dialog">
        <button
          onClick={onSaveServiceOnly}
          disabled={isSaving}
          data-testid="dialog-save-service-only"
        >
          serviceOnly
        </button>
        <button
          onClick={onSaveWithOriginal}
          disabled={isSaving}
          data-testid="dialog-save-with-original"
        >
          serviceAndOriginal
        </button>
      </div>
    ) : null,
}));

const mockUnit: ClientServiceUnit = {
  id: 1,
  type: 'SONG',
  semitoneTranspose: 0,
  order: 1,
  arrangementId: 14,
  serviceId: 123,
  arrangement: {
    id: 14,
    songId: 53,
    originalArrangementId: 1,
    key: 'D',
    name: null,
    isDefault: false,
    isDeleted: false,
    isServiceArrangement: true,
    youtubeUrl: null,
    audioUrl: null,
    song: {
      id: 53,
      title: 'Glória e Força',
      slug: 'gloria-e-forca',
      artist: 'Vencedores por Cristo',
      lyrics: 'Gloria e força ao Senhor',
      isDeleted: false,
    },
    units: [
      {
        type: 'VERSE' as const,
        content: '[D]Cristo é Senhor',
        order: 1,
        notes: null,
        repeatCount: 1,
      },
    ],
  },
};

let mockSaveToService: ReturnType<typeof vi.fn>;
let mockSaveToOriginal: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockSaveToService = vi.fn().mockResolvedValue({});
  mockSaveToOriginal = vi.fn().mockResolvedValue({});
  (useCreateOrUpdateArrangement as ReturnType<typeof vi.fn>).mockImplementation(
    (id: number | null) => ({
      createOrUpdateArrangement: id === 14 ? mockSaveToService : mockSaveToOriginal,
      isMutating: false,
      isError: null,
    })
  );
});

describe('ServiceSongUnitEditForm', () => {
  it('renders SongUnitListForm', () => {
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByTestId('song-unit-list-form')).toBeDefined();
  });

  it('renders save and cancel buttons', () => {
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByTestId('edit-form-cancel')).toBeDefined();
    expect(screen.getByTestId('edit-form-save')).toBeDefined();
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByTestId('edit-form-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('opens SaveScopeDialog when save clicked and has originalArrangementId', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByTestId('save-scope-dialog')).toBeNull();
    await user.click(screen.getByTestId('edit-form-save'));
    await waitFor(() => {
      expect(screen.getByTestId('save-scope-dialog')).toBeDefined();
    });
  });

  it('saves only to service and calls onSaved when serviceOnly chosen', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={onSaved} onCancel={vi.fn()} />);
    await user.click(screen.getByTestId('edit-form-save'));
    await waitFor(() => screen.getByTestId('save-scope-dialog'));
    await user.click(screen.getByTestId('dialog-save-service-only'));
    await waitFor(() => {
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(mockSaveToOriginal).not.toHaveBeenCalled();
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('saves to both service and original when serviceAndOriginal chosen', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={onSaved} onCancel={vi.fn()} />);
    await user.click(screen.getByTestId('edit-form-save'));
    await waitFor(() => screen.getByTestId('save-scope-dialog'));
    await user.click(screen.getByTestId('dialog-save-with-original'));
    await waitFor(() => {
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(mockSaveToOriginal).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('saves directly to service without dialog when no originalArrangementId', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const unitWithoutOriginal: ClientServiceUnit = {
      ...mockUnit,
      arrangement: { ...mockUnit.arrangement!, originalArrangementId: null },
    };
    render(
      <ServiceSongUnitEditForm unit={unitWithoutOriginal} onSaved={onSaved} onCancel={vi.fn()} />
    );
    await user.click(screen.getByTestId('edit-form-save'));
    await waitFor(() => {
      expect(screen.queryByTestId('save-scope-dialog')).toBeNull();
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('original save data uses originalArrangementId as id', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitEditForm unit={mockUnit} onSaved={vi.fn()} onCancel={vi.fn()} />);
    await user.click(screen.getByTestId('edit-form-save'));
    await waitFor(() => screen.getByTestId('save-scope-dialog'));
    await user.click(screen.getByTestId('dialog-save-with-original'));
    await waitFor(() => {
      const originalCallArg = mockSaveToOriginal.mock.calls[0][0] as any;
      expect(originalCallArg.id).toBe(1);
      expect(originalCallArg.isServiceArrangement).toBe(false);
      expect(originalCallArg.originalArrangementId).toBeNull();
    });
  });
});
