import { auth } from '@/auth';
import prisma from '@/prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

beforeEach(() => {
  vi.mocked(auth).mockResolvedValue({
    user: { id: 'test-user-id', email: 'admin@test.com', roles: ['ADMIN'] },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
});

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
