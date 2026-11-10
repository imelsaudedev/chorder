import prisma from '@/prisma/client';
import { describe, expect, it } from 'vitest';
import { PATCH } from './route';

const patch = (slug: string, body: object) =>
  PATCH(new Request(`http://localhost/api/songs/${slug}`, { method: 'PATCH', body: JSON.stringify(body) }) as any, {
    params: Promise.resolve({ slugOrId: slug }),
  });

describe('PATCH /api/songs/:slug — arquivar e restaurar', () => {
  it('arquiva (isDeleted: true) e restaura (isDeleted: false)', async () => {
    await prisma.song.create({ data: { title: 'Música', slug: 'musica-arq', lyrics: '' } });

    expect((await patch('musica-arq', { isDeleted: true })).status).toBe(200);
    expect((await prisma.song.findUnique({ where: { slug: 'musica-arq' } }))?.isDeleted).toBe(true);

    expect((await patch('musica-arq', { isDeleted: false })).status).toBe(200);
    expect((await prisma.song.findUnique({ where: { slug: 'musica-arq' } }))?.isDeleted).toBe(false);
  });
});
