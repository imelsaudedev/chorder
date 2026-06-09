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
  default: ({ onStartEdit, onCancel, isEditing, isSaving }: any) => (
    <div data-testid="service-arrangement-header">
      <button onClick={onStartEdit} data-testid="start-edit">start editing</button>
      <button onClick={onCancel} data-testid="cancel-edit">cancel</button>
      {isEditing && <span data-testid="is-editing" />}
      {isSaving && <span data-testid="is-saving" />}
    </div>
  ),
}));

vi.mock('@/components/song/ArrangementView', () => ({
  default: () => <div data-testid="arrangement-view" />,
}));

vi.mock('./ServiceSongUnitEditForm', () => ({
  default: ({ onSaved, onSavingChange, submitRef }: any) => {
    submitRef.current = { submit: () => { onSavingChange(true); onSaved(); } };
    return <div data-testid="edit-form"><button onClick={onSaved} data-testid="mock-saved">saved</button></div>;
  },
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
    units: [{ type: 'VERSE' as const, content: '[D]Cristo é Senhor', order: 1, notes: null, repeatCount: 1 }],
  },
};

describe('ServiceSongUnitView', () => {
  it('renders arrangement header', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.getByTestId('service-arrangement-header')).toBeDefined();
  });

  it('shows ArrangementView and hides edit form when not editing', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
    expect(screen.queryByTestId('edit-form')).toBeNull();
  });

  it('passes isEditing=false to header initially', () => {
    render(<ServiceSongUnitView unit={mockUnit} />);
    expect(screen.queryByTestId('is-editing')).toBeNull();
  });

  it('switches to edit form and hides view when onStartEdit triggered', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('start-edit'));
    expect(screen.getByTestId('edit-form')).toBeDefined();
    expect(screen.queryByTestId('arrangement-view')).toBeNull();
  });

  it('passes isEditing=true to header during edit', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('start-edit'));
    expect(screen.getByTestId('is-editing')).toBeDefined();
  });

  it('returns to view mode when onCancel triggered', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('start-edit'));
    await user.click(screen.getByTestId('cancel-edit'));
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
    expect(screen.queryByTestId('edit-form')).toBeNull();
  });

  it('returns to view mode after onSaved called from edit form', async () => {
    const user = userEvent.setup();
    render(<ServiceSongUnitView unit={mockUnit} />);
    await user.click(screen.getByTestId('start-edit'));
    await user.click(screen.getByTestId('mock-saved'));
    expect(screen.getByTestId('arrangement-view')).toBeDefined();
    expect(screen.queryByTestId('edit-form')).toBeNull();
  });
});
