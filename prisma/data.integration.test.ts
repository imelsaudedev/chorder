import { describe, it, expect } from 'vitest';
import { retrieveSongs, createArrangementWithSong } from './data';
import prisma from './client';

describe('retrieveSongs', () => {
  it('filtra por query de texto', async () => {
    await prisma.song.create({
      data: {
        title: 'Test Song 1', slug: 'test-song-1', lyrics: '', artist: 'Artist 1',
        arrangements: { create: { key: 'C', name: 'Default', isDefault: true } },
      },
    });
    await prisma.song.create({
      data: {
        title: 'Another Song', slug: 'another-song', lyrics: '', artist: 'Artist 2',
        arrangements: { create: { key: 'G', name: 'Default', isDefault: true } },
      },
    });

    const found = await retrieveSongs({ query: 'Test' });
    expect(found).toHaveLength(1);
    expect(found[0].title).toBe('Test Song 1');

    const all = await retrieveSongs({});
    expect(all).toHaveLength(2);
  });

  it('filtra por tagIds — retorna apenas músicas com a tag', async () => {
    const group = await prisma.tagGroup.create({ data: { name: 'Tema', color: '#10b981' } });
    const tag = await prisma.tag.create({ data: { name: 'Adoração', tagGroupId: group.id } });

    const songWithTag = await prisma.song.create({
      data: {
        title: 'Música com Tag', slug: 'musica-com-tag', lyrics: '',
        tags: { connect: { id: tag.id } },
        arrangements: { create: { key: 'C', name: 'Default', isDefault: true } },
      },
    });
    await prisma.song.create({
      data: {
        title: 'Música sem Tag', slug: 'musica-sem-tag', lyrics: '',
        arrangements: { create: { key: 'G', name: 'Default', isDefault: true } },
      },
    });

    const filtered = await retrieveSongs({ tagIds: [tag.id] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Música com Tag');
  });

  it('tagIds vazio retorna todas as músicas', async () => {
    await prisma.song.create({
      data: {
        title: 'Música A', slug: 'musica-a', lyrics: '',
        arrangements: { create: { key: 'C', name: 'Default', isDefault: true } },
      },
    });
    await prisma.song.create({
      data: {
        title: 'Música B', slug: 'musica-b', lyrics: '',
        arrangements: { create: { key: 'G', name: 'Default', isDefault: true } },
      },
    });

    const all = await retrieveSongs({ tagIds: [] });
    expect(all).toHaveLength(2);
  });
});

describe('createArrangementWithSong', () => {
  it('cria arranjo com nova música', async () => {
    const created = await createArrangementWithSong(
      {
        name: 'Standard', key: 'E', isDefault: true,
        song: { title: 'New Integration Song', artist: 'Integration Artist' } as any,
        units: [
          { content: '[E]Verso 1', type: 'VERSE', order: 1, notes: null },
          { content: '[A]Refrão', type: 'CHORUS', order: 2, notes: null },
        ],
      } as any,
      { includeSong: true, includeUnits: true }
    );

    expect(created.id).toBeDefined();
    expect(created.song?.title).toBe('New Integration Song');
    expect(created.units).toHaveLength(2);

    const dbSong = await prisma.song.findUnique({ where: { id: created.song?.id } });
    expect(dbSong?.title).toBe('New Integration Song');
  });

  it('persiste campo notes nas unidades', async () => {
    const created = await createArrangementWithSong(
      {
        name: 'Com Notas', key: 'G', isDefault: true,
        song: { title: 'Música com Notas', artist: null } as any,
        units: [
          { content: '[G]Verso', type: 'VERSE', order: 1, notes: 'Só voz' },
          { content: '[C]Ponte', type: 'BRIDGE', order: 2, notes: null },
        ],
      } as any,
      { includeUnits: true }
    );

    const units = await prisma.songUnit.findMany({
      where: { arrangementId: created.id },
      orderBy: { order: 'asc' },
    });
    expect(units[0].notes).toBe('Só voz');
    expect(units[1].notes).toBeNull();
  });

  it('persiste youtubeUrl no arranjo', async () => {
    const created = await createArrangementWithSong(
      {
        name: 'Com YouTube', key: 'D', isDefault: true,
        youtubeUrl: 'https://www.youtube.com/watch?v=test123',
        song: { title: 'Música com YouTube', artist: null } as any,
        units: [{ content: '[D]Verso', type: 'VERSE', order: 1, notes: null }],
      } as any,
      {}
    );

    const dbArrangement = await prisma.songArrangement.findUnique({ where: { id: created.id } });
    expect(dbArrangement?.youtubeUrl).toBe('https://www.youtube.com/watch?v=test123');
  });

  it('persiste audios no arranjo', async () => {
    const created = await createArrangementWithSong(
      {
        name: 'Com Áudio', key: 'A', isDefault: true,
        audios: [{ url: 'https://example.com/audio.mp3', label: 'Voz', order: 0 }],
        song: { title: 'Música com Áudio', artist: null } as any,
        units: [{ content: '[A]Verso', type: 'VERSE', order: 1, notes: null, repeatCount: 1 }],
      } as any,
      {}
    );

    const dbAudios = await prisma.arrangementAudio.findMany({ where: { arrangementId: created.id } });
    expect(dbAudios).toHaveLength(1);
    expect(dbAudios[0].url).toBe('https://example.com/audio.mp3');
    expect(dbAudios[0].label).toBe('Voz');
  });
});
