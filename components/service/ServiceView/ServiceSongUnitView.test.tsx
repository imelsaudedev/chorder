import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ServiceSongUnitView from './ServiceSongUnitView';
import { ClientServiceUnit } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/config/ServiceConfig', () => ({
  useServiceConfig: () => ({ columns: 1, fontSize: 16, mode: 'chords', density: 'normal' }),
}));

vi.mock('@/components/config/SongConfig', () => ({
  default: ({ children }: any) => <>{children}</>,
  useSongConfig: () => ({ transpose: 0, columns: 1, fontSize: 16, mode: 'chords', density: 'normal' }),
}));

vi.mock('./ServiceArrangementHeader', () => ({
  default: ({ onToggleEdit, isEditing }: any) => (
    <div data-testid="service-arrangement-header">
      {onToggleEdit && (
        <button onClick={onToggleEdit} data-testid="edit-toggle">
          {isEditing ? 'stop-editing' : 'start-editing'}
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/components/song/ArrangementView', () => ({
  default: () => <div data-testid="arrangement-view" />,
}));

vi.mock('./ServiceSongUnitEditForm', () => ({
  default: ({ onSaved, onCancel }: any) => (
    <div data-testid="service-song-unit-edit-form">
      <button onClick={onSaved} data-testid="mock-saved-button">saved</button>
      <button onClick={onCancel} data-testid="mock-cancel-button">cancel</button>
    </div>
  ),
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

describe('ServiceSongUnitView', () => {
  it('renders arrangement header', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.getByTestId('service-arrangement-header')).toBeDefined();
  });

  it('renders ArrangementView when not editing', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
    expect(screen.queryByTestId('service-song-unit-edit-form')).toBeNull();
  });

  it('shows edit toggle button', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.getByTestId('edit-toggle')).toBeDefined();
  });

  it('switches to edit mode when toggle clicked', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('edit-toggle'));
    expect(screen.getByTestId('service-song-unit-edit-form')).toBeDefined();
    expect(screen.queryByTestId('arrangement-view')).toBeNull();
  });

  it('returns to view mode after onSaved called', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('edit-toggle'));
    expect(screen.getByTestId('service-song-unit-edit-form')).toBeDefined();
    await user.click(screen.getByTestId('mock-saved-button'));
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
    expect(screen.queryByTestId('service-song-unit-edit-form')).toBeNull();
  });

  it('returns to view mode after onCancel called', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('edit-toggle'));
    await user.click(screen.getByTestId('mock-cancel-button'));
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
  });
});
