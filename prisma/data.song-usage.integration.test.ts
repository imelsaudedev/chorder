import { describe, it, expect } from 'vitest';
import { createOrUpdateService, retrieveSongs } from './data';
import prisma from './client';
import { ClientService } from './models';

async function songWithArrangement(title: string, slug: string) {
  const song = await prisma.song.create({ data: { title, slug, lyrics: '' } });
  const arrangement = await prisma.songArrangement.create({
    data: { songId: song.id, key: 'C', name: 'Principal', units: { create: [{ type: 'VERSE', content: `[C]${title}`, order: 1 }] } },
  });
  return { song, arrangement };
}

function unit(clientId: string, order: number, song: { id: number }, arrangement: { id: number; key: string }) {
  return {
    clientId,
    type: 'SONG' as const,
    arrangementId: null,
    semitoneTranspose: 0,
    order,
    arrangement: {
      songId: song.id,
      originalArrangementId: arrangement.id,
      key: arrangement.key,
      name: 'Principal',
      units: [{ type: 'VERSE', content: '[C]x', order: 1, notes: null, repeatCount: 1 }],
    } as any,
  };
}

function service(slug: string, date: string, units: ReturnType<typeof unit>[]): ClientService {
  return {
    slug,
    title: slug,
    worshipLeader: null,
    date: new Date(date),
    isDeleted: false,
    plan: { sections: [{ id: `${slug}-sec`, type: 'CULTO', label: 'Culto', order: 1, units }] },
  };
}

// O último uso e a contagem vêm de Service.plan (a tabela ServiceUnit não é mais escrita).
describe('retrieveSongs — withUsageStats', () => {
  it('calcula último uso e quantidade de liturgias a partir do plan', async () => {
    const a = await songWithArrangement('Música A', 'musica-a');
    const b = await songWithArrangement('Música B', 'musica-b');
    await songWithArrangement('Música C', 'musica-c');

    await createOrUpdateService(service('culto-1', '2026-01-04', [unit('u1', 1, a.song, a.arrangement)]));
    // A aparece duas vezes no mesmo culto: conta uma liturgia só.
    await createOrUpdateService(
      service('culto-2', '2026-02-01', [unit('u2', 1, a.song, a.arrangement), unit('u3', 2, b.song, b.arrangement), unit('u4', 3, a.song, a.arrangement)])
    );

    const songs = await retrieveSongs({ withUsageStats: true });
    const by = (title: string) => songs.find((s) => s.title === title)!;

    expect(by('Música A').usageCount).toBe(2);
    expect(by('Música A').lastUsedAt).toEqual(new Date('2026-02-01'));
    expect(by('Música B').usageCount).toBe(1);
    expect(by('Música B').lastUsedAt).toEqual(new Date('2026-02-01'));
    expect(by('Música C').usageCount).toBe(0);
    expect(by('Música C').lastUsedAt).toBeNull();
  });

  it('ignora liturgias apagadas', async () => {
    const a = await songWithArrangement('Música A', 'musica-a');
    await createOrUpdateService(service('culto-1', '2026-01-04', [unit('u1', 1, a.song, a.arrangement)]));
    const apagado = await createOrUpdateService(service('culto-apagado', '2026-03-01', [unit('u2', 1, a.song, a.arrangement)]));
    await prisma.service.update({ where: { id: apagado.id! }, data: { isDeleted: true } });

    const [song] = await retrieveSongs({ withUsageStats: true });
    expect(song.usageCount).toBe(1);
    expect(song.lastUsedAt).toEqual(new Date('2026-01-04'));
  });

  it('sem withUsageStats os campos não são preenchidos', async () => {
    await songWithArrangement('Música A', 'musica-a');
    const [song] = await retrieveSongs({});
    expect(song.usageCount).toBeUndefined();
    expect(song.lastUsedAt).toBeUndefined();
  });
});
