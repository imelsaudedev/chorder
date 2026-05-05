import { describe, it, expect } from 'vitest';
import { retrieveSongs, createArrangementWithSong } from './data';
import prisma from './client';

describe('Prisma Data Integration Tests', () => {
  it('should retrieve songs from the database', async () => {
    // Seed some data
    await prisma.song.create({
      data: {
        title: 'Test Song 1',
        slug: 'test-song-1',
        lyrics: 'Lyrics 1',
        artist: 'Artist 1',
        arrangements: {
            create: {
                key: 'C',
                name: 'Default',
                isDefault: true
            }
        }
      },
    });

    await prisma.song.create({
      data: {
        title: 'Another Song',
        slug: 'another-song',
        lyrics: 'Lyrics 2',
        artist: 'Artist 2',
        arrangements: {
            create: {
                key: 'G',
                name: 'Default',
                isDefault: true
            }
        }
      },
    });

    const songs = await retrieveSongs({ query: 'Test' });
    expect(songs).toHaveLength(1);
    expect(songs[0].title).toBe('Test Song 1');

    const allSongs = await retrieveSongs({});
    expect(allSongs).toHaveLength(2);
  });

  it('should create an arrangement with a new song', async () => {
    const arrangementData: any = {
      name: 'Standard',
      key: 'E',
      isDefault: true,
      song: {
        title: 'New Integration Song',
        artist: 'Integration Artist',
      },
      units: [
        { content: 'Verse 1', type: 'VERSE', order: 1 },
        { content: 'Chorus', type: 'CHORUS', order: 2 },
      ],
    };

    const created = await createArrangementWithSong(arrangementData, { includeSong: true, includeUnits: true });
    
    expect(created.id).toBeDefined();
    expect(created.song?.title).toBe('New Integration Song');
    expect(created.units).toHaveLength(2);

    // Verify in DB by ID
    const dbSong = await prisma.song.findUnique({ where: { id: created.song?.id } });
    expect(dbSong).not.toBeNull();
    expect(dbSong?.title).toBe('New Integration Song');
  });
});
