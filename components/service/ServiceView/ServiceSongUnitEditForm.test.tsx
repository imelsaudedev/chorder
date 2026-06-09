import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MutableRefObject } from 'react';
import ServiceSongUnitEditForm, { EditFormHandle } from './ServiceSongUnitEditForm';
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

function makeSubmitRef(): MutableRefObject<EditFormHandle | null> {
  return { current: null };
}

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
    const submitRef = makeSubmitRef();
    render(
      <ServiceSongUnitEditForm
        unit={mockUnit}
        submitRef={submitRef}
        onSavingChange={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    expect(screen.getByTestId('song-unit-list-form')).toBeDefined();
  });

  it('saves only to service and calls onSaved when submit("service") called', async () => {
    const submitRef = makeSubmitRef();
    const onSaved = vi.fn();
    render(
      <ServiceSongUnitEditForm
        unit={mockUnit}
        submitRef={submitRef}
        onSavingChange={vi.fn()}
        onSaved={onSaved}
      />
    );
    await act(async () => {
      await submitRef.current?.submit('service');
    });
    await waitFor(() => {
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(mockSaveToOriginal).not.toHaveBeenCalled();
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('saves to both service and original when submit("both") called', async () => {
    const submitRef = makeSubmitRef();
    const onSaved = vi.fn();
    render(
      <ServiceSongUnitEditForm
        unit={mockUnit}
        submitRef={submitRef}
        onSavingChange={vi.fn()}
        onSaved={onSaved}
      />
    );
    await act(async () => {
      await submitRef.current?.submit('both');
    });
    await waitFor(() => {
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(mockSaveToOriginal).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('saves only to service when no originalArrangementId even if scope is "both"', async () => {
    const unitWithoutOriginal: ClientServiceUnit = {
      ...mockUnit,
      arrangement: { ...mockUnit.arrangement!, originalArrangementId: null },
    };
    const submitRef = makeSubmitRef();
    const onSaved = vi.fn();
    render(
      <ServiceSongUnitEditForm
        unit={unitWithoutOriginal}
        submitRef={submitRef}
        onSavingChange={vi.fn()}
        onSaved={onSaved}
      />
    );
    await act(async () => {
      await submitRef.current?.submit('both');
    });
    await waitFor(() => {
      expect(mockSaveToService).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('original save data uses originalArrangementId as id', async () => {
    const submitRef = makeSubmitRef();
    render(
      <ServiceSongUnitEditForm
        unit={mockUnit}
        submitRef={submitRef}
        onSavingChange={vi.fn()}
        onSaved={vi.fn()}
      />
    );
    await act(async () => {
      await submitRef.current?.submit('both');
    });
    await waitFor(() => {
      const originalCallArg = mockSaveToOriginal.mock.calls[0][0] as any;
      expect(originalCallArg.id).toBe(1);
      expect(originalCallArg.isServiceArrangement).toBe(false);
      expect(originalCallArg.originalArrangementId).toBeNull();
    });
  });
});
