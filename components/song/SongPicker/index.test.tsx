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

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/',
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/song/SongListEntry', () => ({
  default: ({ song, onSelected }: { song: any; onSelected?: (s: any) => void }) => (
    <button aria-label={song.title} onClick={() => onSelected?.(song)} />
  ),
}));

vi.mock('#api-client', () => ({
  useFetchSongs: vi.fn(),
  useFetchSong: vi.fn(() => ({})),
  useFetchSongArrangements: vi.fn(() => ({})),
  useFetchArrangement: vi.fn(() => ({})),
  useCreateOrUpdateArrangement: vi.fn(() => ({})),
  useDeleteArrangement: vi.fn(() => ({})),
  useMoveArrangement: vi.fn(() => ({})),
  useMakeArrangementDefault: vi.fn(() => ({})),
  useDuplicateArrangement: vi.fn(() => ({})),
  useFetchServices: vi.fn(() => ({})),
  useFetchService: vi.fn(() => ({})),
  useDeleteService: vi.fn(() => ({})),
  useCreateOrUpdateService: vi.fn(() => ({})),
  useArchiveSong: vi.fn(() => ({})),
  useUpdateSong: vi.fn(() => ({ updateSong: vi.fn() })),
  useFetchTagGroups: vi.fn(() => ({ tagGroups: [], isLoading: false, isError: null })),
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
    expect(await screen.findByRole('button', { name: songsMock[0].title })).toBeDefined();
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

    // O SongListEntry usa um overlay <button aria-label={song.title}> — não há texto "Adicionar"
    const songButton = await screen.findByRole('button', { name: songsMock[0].title });
    await user.click(songButton);

    expect(onSelected).toHaveBeenCalledTimes(1);
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
