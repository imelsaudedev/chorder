import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import { PATCH, DELETE } from './[id]/route';
import prisma from '@/prisma/client';

function patchReq(id: number, body: object) {
  return new Request(`http://localhost/api/admin/tag-groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

function deleteReq(id: number) {
  return new Request(`http://localhost/api/admin/tag-groups/${id}`, { method: 'DELETE' });
}

describe('GET /api/admin/tag-groups', () => {
  it('retorna lista vazia quando não há grupos', async () => {
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('retorna grupos com suas tags ordenados por nome', async () => {
    await prisma.tagGroup.create({ data: { name: 'Tema', color: '#10b981', tags: { create: [{ name: 'Adoração' }, { name: 'Louvor' }] } } });
    await prisma.tagGroup.create({ data: { name: 'Andamento', color: '#6366f1' } });

    const res = await GET();
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].name).toBe('Andamento');
    expect(data[1].name).toBe('Tema');
    expect(data[1].tags).toHaveLength(2);
  });
});

describe('POST /api/admin/tag-groups', () => {
  it('cria grupo com nome e cor', async () => {
    const req = new Request('http://localhost/api/admin/tag-groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ocasião', color: '#f59e0b' }),
    });
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.name).toBe('Ocasião');
    expect(data.color).toBe('#f59e0b');
  });

  it('usa cor padrão quando não fornecida', async () => {
    const req = new Request('http://localhost/api/admin/tag-groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Tipo' }),
    });
    const res = await POST(req as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.color).toBe('#6b7280');
  });

  it('rejeita nome vazio (400)', async () => {
    const req = new Request('http://localhost/api/admin/tag-groups', {
      method: 'POST',
      body: JSON.stringify({ name: '  ' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('rejeita nome duplicado (409)', async () => {
    await prisma.tagGroup.create({ data: { name: 'Duplicado', color: '#000' } });
    const req = new Request('http://localhost/api/admin/tag-groups', {
      method: 'POST',
      body: JSON.stringify({ name: 'Duplicado' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/admin/tag-groups/:id', () => {
  it('atualiza nome e cor do grupo', async () => {
    const group = await prisma.tagGroup.create({ data: { name: 'Original', color: '#000' } });
    const res = await PATCH(patchReq(group.id, { name: 'Atualizado', color: '#fff' }) as any, {
      params: Promise.resolve({ id: String(group.id) }),
    });
    const data = await res.json();
    expect(data.name).toBe('Atualizado');
    expect(data.color).toBe('#fff');
  });
});

describe('DELETE /api/admin/tag-groups/:id', () => {
  it('deleta grupo vazio (204)', async () => {
    const group = await prisma.tagGroup.create({ data: { name: 'Vazio', color: '#000' } });
    const res = await DELETE(deleteReq(group.id) as any, {
      params: Promise.resolve({ id: String(group.id) }),
    });
    expect(res.status).toBe(204);

    const check = await prisma.tagGroup.findUnique({ where: { id: group.id } });
    expect(check).toBeNull();
  });

  it('deleta também as tags órfãs do grupo', async () => {
    const group = await prisma.tagGroup.create({
      data: { name: 'ComTags', color: '#000', tags: { create: [{ name: 'Tag A' }] } },
      include: { tags: true },
    });
    await DELETE(deleteReq(group.id) as any, {
      params: Promise.resolve({ id: String(group.id) }),
    });

    const tags = await prisma.tag.findMany({ where: { tagGroupId: group.id } });
    expect(tags).toHaveLength(0);
  });

  it('rejeita deleção quando tags do grupo têm músicas associadas (409)', async () => {
    const group = await prisma.tagGroup.create({
      data: { name: 'ComMusicas', color: '#000', tags: { create: [{ name: 'Tag Usada' }] } },
      include: { tags: true },
    });
    await prisma.song.create({
      data: {
        title: 'Música Associada', slug: 'musica-associada', lyrics: '',
        tags: { connect: { id: group.tags[0].id } },
      },
    });

    const res = await DELETE(deleteReq(group.id) as any, {
      params: Promise.resolve({ id: String(group.id) }),
    });
    expect(res.status).toBe(409);
  });
});
