import { describe, it, expect } from 'vitest';
import { createMinimalArrangementForSong } from './data';
import prisma from './client';

async function createSong(hasArrangement: boolean) {
  const song = await prisma.song.create({
    data: {
      title: 'Música placeholder',
      slug: `musica-placeholder-${Date.now()}-${Math.random()}`,
      lyrics: '',
      ...(hasArrangement
        ? { arrangements: { create: { key: 'G', isDefault: true } } }
        : {}),
    },
  });
  return song.id;
}

describe('createMinimalArrangementForSong', () => {
  it('cria um arranjo sem cifra quando a música não tem nenhum', async () => {
    const songId = await createSong(false);
    const arrangement = await createMinimalArrangementForSong(songId);

    expect(arrangement.songId).toBe(songId);
    expect(arrangement.isServiceArrangement).toBe(false);
    expect(arrangement.key).toBe('C');

    const units = await prisma.songUnit.findMany({ where: { arrangementId: arrangement.id } });
    expect(units).toHaveLength(0);
  });

  it('reaproveita o arranjo existente em vez de duplicar', async () => {
    const songId = await createSong(true);
    const existing = await prisma.songArrangement.findFirst({ where: { songId } });

    const result = await createMinimalArrangementForSong(songId);

    expect(result.id).toBe(existing!.id);
    const all = await prisma.songArrangement.findMany({ where: { songId } });
    expect(all).toHaveLength(1);
  });

  it('aceita slug além de id', async () => {
    const song = await prisma.song.create({
      data: { title: 'Outra Placeholder', slug: 'outra-placeholder', lyrics: '' },
    });

    const arrangement = await createMinimalArrangementForSong('outra-placeholder');
    expect(arrangement.songId).toBe(song.id);
  });

  it('lança erro se a música não existe', async () => {
    await expect(createMinimalArrangementForSong(999999)).rejects.toThrow('Song not found');
  });
});
