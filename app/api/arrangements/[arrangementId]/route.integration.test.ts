import { auth } from '@/auth';
import prisma from '@/prisma/client';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

const as = (id: string, roles: string[] = []) =>
  vi.mocked(auth).mockResolvedValue({
    user: { id, email: `${id}@test.com`, roles },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as never);

type Fixture = { originalId: number; copyId: number; serviceId: number; slug: string };

async function setup(): Promise<Fixture> {
  await prisma.serviceShare.deleteMany();
  await prisma.user.deleteMany();
  for (const id of ['dona', 'editora', 'leitora', 'estranha']) {
    await prisma.user.create({ data: { id, email: `${id}@test.com`, roles: [] } });
  }
  // Os perfis são lidos do banco a cada pedido, não da sessão.
  await prisma.user.create({ data: { id: 'louvor', email: 'louvor@test.com', roles: ['WORSHIP'] } });
  const song = await prisma.song.create({
    data: { title: 'Música Original', slug: 'musica-original', artist: 'Autor', lyrics: 'x' },
  });
  const original = await prisma.songArrangement.create({
    data: { songId: song.id, key: 'C', isDefault: true, units: { create: [{ content: 'Original', type: 'BLOCK', order: 1 }] } },
  });
  const copy = await prisma.songArrangement.create({
    data: {
      songId: song.id,
      key: 'C',
      isServiceArrangement: true,
      originalArrangementId: original.id,
      units: { create: [{ content: 'Cópia', type: 'BLOCK', order: 1 }] },
    },
  });
  const service = await prisma.service.create({
    data: {
      slug: 'pessoal-1',
      title: 'Grupo',
      date: new Date('2026-12-01T22:00:00Z'),
      scope: 'PERSONAL',
      status: 'PUBLISHED',
      createdById: 'dona',
      plan: {
        startTime: null,
        sections: [{ id: 's1', type: 'ESPECIAL', label: 'Roteiro', order: 1, units: [{ type: 'SONG', order: 1, arrangementId: copy.id }] }],
      },
    },
  });
  await prisma.serviceShare.create({ data: { serviceId: service.id, userId: 'editora', permission: 'EDIT' } });
  await prisma.serviceShare.create({ data: { serviceId: service.id, userId: 'leitora', permission: 'VIEW' } });
  return { originalId: original.id, copyId: copy.id, serviceId: service.id, slug: service.slug };
}

const payload = (id: number, content: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: null,
  originalArrangementId: null,
  key: 'C',
  youtubeUrl: null,
  audios: [],
  isDefault: false,
  isDeleted: false,
  isServiceArrangement: true,
  song: { title: 'Título Trocado', slug: 'musica-original', artist: 'Autor Trocado', lyrics: 'y', isDeleted: false },
  units: [{ content, type: 'BLOCK', order: 1, notes: null, repeatCount: 1 }],
  ...extra,
});

const save = (id: number, body: unknown, preserveMedia = true) =>
  POST(
    new NextRequest(`http://localhost/api/arrangements/${id}${preserveMedia ? '?preserveMedia=true' : ''}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ arrangementId: String(id) }) }
  );

const unitsOf = async (arrangementId: number) =>
  (await prisma.songUnit.findMany({ where: { arrangementId }, orderBy: { order: 'asc' } })).map((u) => u.content);

describe('POST /api/arrangements/[id] — "Só nesta liturgia" para quem não edita músicas', () => {
  let f: Fixture;
  beforeEach(async () => {
    f = await setup();
  });

  it('a dona da liturgia (sem perfil) salva a cifra da cópia, sem tocar na música', async () => {
    as('dona');
    const res = await save(f.copyId, payload(f.copyId, 'Cifra nova'));
    expect(res.status).toBe(200);
    expect(await unitsOf(f.copyId)).toEqual(['Cifra nova']);
    const song = await prisma.song.findUnique({ where: { slug: 'musica-original' } });
    expect(song?.title).toBe('Música Original');
    expect(song?.artist).toBe('Autor');
  });

  it('quem tem permissão de editar a liturgia compartilhada também salva', async () => {
    as('editora');
    expect((await save(f.copyId, payload(f.copyId, 'Pela editora'))).status).toBe(200);
    expect(await unitsOf(f.copyId)).toEqual(['Pela editora']);
  });

  it('quem só visualiza, quem não tem acesso e o visitante são recusados', async () => {
    as('leitora');
    expect((await save(f.copyId, payload(f.copyId, 'X'))).status).toBe(403);
    as('estranha');
    expect((await save(f.copyId, payload(f.copyId, 'X'))).status).toBe(403);
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await save(f.copyId, payload(f.copyId, 'X'))).status).toBe(401);
    expect(await unitsOf(f.copyId)).toEqual(['Cópia']);
  });

  it('nunca grava o arranjo original, mesmo sendo dona da liturgia', async () => {
    as('dona');
    const res = await save(f.originalId, payload(f.originalId, 'Invasão', { isServiceArrangement: false, isDefault: true }));
    expect(res.status).toBe(403);
    expect(await unitsOf(f.originalId)).toEqual(['Original']);
  });

  it('sem preserveMedia (caminho que mexe em mídias) continua exigindo editar músicas', async () => {
    as('dona');
    expect((await save(f.copyId, payload(f.copyId, 'X'), false)).status).toBe(403);
  });

  it('Louvor continua salvando como antes', async () => {
    as('louvor', ['WORSHIP']);
    expect((await save(f.originalId, payload(f.originalId, 'Editado', { isServiceArrangement: false, isDefault: true, song: { title: 'Música Original', slug: 'musica-original', artist: 'Autor', lyrics: 'x', isDeleted: false } }))).status).toBe(200);
    expect(await unitsOf(f.originalId)).toEqual(['Editado']);
  });
});
