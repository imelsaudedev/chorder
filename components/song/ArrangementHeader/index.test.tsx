import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArrangementHeader from './index';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({
    transpose: 0,
    setTranspose: vi.fn(),
  }),
}));

vi.mock('@/components/config/KeyButtonSet', () => ({
  default: () => <div data-testid="key-button-set" />,
}));

vi.mock('./ArrangementSelector', () => ({
  default: () => <div data-testid="arrangement-selector" />,
}));
vi.mock('./ArrangementActionMenu', () => ({
  default: () => <div data-testid="arrangement-action-menu" />,
}));
vi.mock('./SongConfig', () => ({
  default: () => <div data-testid="song-config" />,
}));
vi.mock('./Skeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}));

const mockArrangement: ClientArrangement = {
  id: 1,
  key: 'G',
  name: 'Default',
  originalArrangementId: null,
  isDefault: true,
  isDeleted: false,
  isServiceArrangement: false,
  youtubeUrl: null,
  song: {
    id: 10,
    title: 'Amazing Grace',
    artist: 'John Newton',
    slug: 'amazing-grace',
    lyrics: '...',
    isDeleted: false,
    arrangements: [
      { id: 1, name: 'Default', key: 'G', isDefault: true, isDeleted: false, isServiceArrangement: false, originalArrangementId: null, youtubeUrl: null },
      { id: 2, name: 'Alt', key: 'A', isDefault: false, isDeleted: false, isServiceArrangement: false, originalArrangementId: null, youtubeUrl: null },
    ]
  }
};

describe('ArrangementHeader component', () => {
  it('renders skeleton when arrangement is null', () => {
    render(<ArrangementHeader arrangement={null} />);
    expect(screen.getByTestId('skeleton')).toBeDefined();
  });

  it('renders song title and artist', () => {
    render(<ArrangementHeader arrangement={mockArrangement} />);
    expect(screen.getByText('Amazing Grace')).toBeDefined();
    expect(screen.getByText('John Newton')).toBeDefined();
  });

  it('renders sub-components', () => {
    render(<ArrangementHeader arrangement={mockArrangement} />);
    expect(screen.getByTestId('arrangement-selector')).toBeDefined();
    expect(screen.getByTestId('arrangement-action-menu')).toBeDefined();
  });
});
