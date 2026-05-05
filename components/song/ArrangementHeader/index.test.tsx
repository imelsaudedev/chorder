import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArrangementHeader from './index';
import { ClientArrangement } from '@/prisma/models';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the sub-components to focus on ArrangementHeader logic
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

describe('ArrangementHeader component', () => {
    const mockArrangement: ClientArrangement = {
        id: 1,
        key: 'G',
        name: 'Default',
        originalArrangementId: null,
        isDefault: true,
        isDeleted: false,
        isServiceArrangement: false,
        song: {
            id: 10,
            title: 'Amazing Grace',
            artist: 'John Newton',
            slug: 'amazing-grace',
            lyrics: '...',
            isDeleted: false,
            arrangements: []
        }
    };

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
