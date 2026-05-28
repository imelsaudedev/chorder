import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SongPicker from './index';
import { useFetchSongs } from '#api-client';
import songsMock from '../../../mock/songs';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'pt-BR',
}));

// Mock the api-client
vi.mock('#api-client', () => ({
  useFetchSongs: vi.fn(),
}));

describe('SongPicker component', () => {
  it('renders search bar and songs when loaded', async () => {
    (useFetchSongs as any).mockReturnValue({
      songs: songsMock,
      isLoading: false,
      isError: null,
    });

    const onSelected = vi.fn();
    render(<SongPicker onSelected={onSelected} />);

    expect(screen.getByRole('searchbox')).toBeDefined();
    
    // Check if some song title is present
    await waitFor(() => {
        expect(screen.getByText(songsMock[0].title)).toBeDefined();
    });
  });

  it('calls onSelected when a song is clicked', async () => {
    const user = userEvent.setup();
    (useFetchSongs as any).mockReturnValue({
      songs: songsMock,
      isLoading: false,
      isError: null,
    });

    const onSelected = vi.fn();
    render(<SongPicker onSelected={onSelected} />);

    const firstSong = await screen.findByText(songsMock[0].title);
    await user.click(firstSong);

    expect(onSelected).toHaveBeenCalledWith(songsMock[0]);
  });

  it('updates query when searching', async () => {
    const user = userEvent.setup({ delay: null });
    const mockUseFetchSongs = useFetchSongs as any;
    mockUseFetchSongs.mockReturnValue({
      songs: songsMock,
      isLoading: false,
      isError: null,
    });

    render(<SongPicker onSelected={vi.fn()} />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'New Search');

    await waitFor(() => {
      expect(mockUseFetchSongs).toHaveBeenCalledWith(expect.objectContaining({
        query: 'New Search'
      }));
    }, { timeout: 3000 });
  });
});
