import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { PATCH, DELETE } from './[id]/route';
import { POST as MERGE } from './merge/route';
import prisma from '@/prisma/client';

async function createGroup(name = 'Tema') {
  return prisma.tagGroup.create({ data: { name, color: '#10b981' } });
}

function postTagReq(body: object) {
  return new Request('http://localhost/api/admin/tags', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function patchReq(id: number, body: object) {
  return new Request(`http://localhost/api/admin/tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

function deleteReq(id: number) {
  return new Request(`http://localhost/api/admin/tags/${id}`, { method: 'DELETE' });
}

function mergeReq(body: object) {
  return new Request('http://localhost/api/admin/tags/merge', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/tags', () => {
  it('cria tag em um grupo existente (201)', async () => {
    const group = await createGroup();
    const res = await POST(postTagReq({ name: 'Adoração', tagGroupId: group.id }) as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.tag.name).toBe('Adoração');
    expect(data.tag.group.id).toBe(group.id);
  });

  it('retorna tags similares junto com a nova (anti-sprawl)', async () => {
    const group = await createGroup();
    await prisma.tag.create({ data: { name: 'Louvor', tagGroupId: group.id } });

    const res = await POST(postTagReq({ name: 'Louvores', tagGroupId: group.id }) as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.similar.length).toBeGreaterThanOrEqual(1);
    expect(data.similar[0].name).toBe('Louvor');
  });

  it('rejeita nome vazio (400)', async () => {
    const group = await createGroup();
    const res = await POST(postTagReq({ name: '', tagGroupId: group.id }) as any);
    expect(res.status).toBe(400);
  });

  it('rejeita sem tagGroupId (400)', async () => {
    const res = await POST(postTagReq({ name: 'Adoração' }) as any);
    expect(res.status).toBe(400);
  });

  it('rejeita tag duplicada no mesmo grupo (409)', async () => {
    const group = await createGroup();
    await prisma.tag.create({ data: { name: 'Adoração', tagGroupId: group.id } });

    const res = await POST(postTagReq({ name: 'Adoração', tagGroupId: group.id }) as any);
    expect(res.status).toBe(409);
  });

  it('permite mesma tag em grupos diferentes', async () => {
    const group1 = await createGroup('Grupo 1');
    const group2 = await createGroup('Grupo 2');
    await prisma.tag.create({ data: { name: 'Adoração', tagGroupId: group1.id } });

    const res = await POST(postTagReq({ name: 'Adoração', tagGroupId: group2.id }) as any);
    expect(res.status).toBe(201);
  });
});

describe('PATCH /api/admin/tags/:id', () => {
  it('renomeia a tag', async () => {
    const group = await createGroup();
    const tag = await prisma.tag.create({ data: { name: 'Original', tagGroupId: group.id } });

    const res = await PATCH(patchReq(tag.id, { name: 'Renomeada' }) as any, {
      params: Promise.resolve({ id: String(tag.id) }),
    });
    const data = await res.json();
    expect(data.name).toBe('Renomeada');
  });

  it('rejeita nome vazio (400)', async () => {
    const group = await createGroup();
    const tag = await prisma.tag.create({ data: { name: 'Tag', tagGroupId: group.id } });

    const res = await PATCH(patchReq(tag.id, { name: '' }) as any, {
      params: Promise.resolve({ id: String(tag.id) }),
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/tags/:id', () => {
  it('deleta tag sem músicas (204)', async () => {
    const group = await createGroup();
    const tag = await prisma.tag.create({ data: { name: 'Vazia', tagGroupId: group.id } });

    const res = await DELETE(deleteReq(tag.id) as any, {
      params: Promise.resolve({ id: String(tag.id) }),
    });
    expect(res.status).toBe(204);

    const check = await prisma.tag.findUnique({ where: { id: tag.id } });
    expect(check).toBeNull();
  });

  it('rejeita deleção de tag com músicas associadas (409)', async () => {
    const group = await createGroup();
    const tag = await prisma.tag.create({ data: { name: 'Usada', tagGroupId: group.id } });
    await prisma.song.create({
      data: {
        title: 'Música com Tag', slug: 'musica-com-tag-del', lyrics: '',
        tags: { connect: { id: tag.id } },
      },
    });

    const res = await DELETE(deleteReq(tag.id) as any, {
      params: Promise.resolve({ id: String(tag.id) }),
    });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/admin/tags/merge', () => {
  it('move músicas da tag fonte para a alvo e deleta a fonte', async () => {
    const group = await createGroup();
    const source = await prisma.tag.create({ data: { name: 'Adoração', tagGroupId: group.id } });
    const target = await prisma.tag.create({ data: { name: 'Louvor', tagGroupId: group.id } });

    await prisma.song.create({
      data: {
        title: 'Música 1', slug: 'musica-merge-1', lyrics: '',
        tags: { connect: { id: source.id } },
      },
    });
    await prisma.song.create({
      data: {
        title: 'Música 2', slug: 'musica-merge-2', lyrics: '',
        tags: { connect: { id: source.id } },
      },
    });

    const res = await MERGE(mergeReq({ sourceId: source.id, targetId: target.id }) as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.merged).toBe(2);

    const sourceCheck = await prisma.tag.findUnique({ where: { id: source.id } });
    expect(sourceCheck).toBeNull();

    const songs = await prisma.song.findMany({
      where: { tags: { some: { id: target.id } } },
    });
    expect(songs).toHaveLength(2);
  });

  it('rejeita merge de tag consigo mesma (400)', async () => {
    const group = await createGroup();
    const tag = await prisma.tag.create({ data: { name: 'Tag', tagGroupId: group.id } });

    const res = await MERGE(mergeReq({ sourceId: tag.id, targetId: tag.id }) as any);
    expect(res.status).toBe(400);
  });

  it('rejeita sem sourceId ou targetId (400)', async () => {
    const res = await MERGE(mergeReq({ sourceId: 1 }) as any);
    expect(res.status).toBe(400);
  });
});
