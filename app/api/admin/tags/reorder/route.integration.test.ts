import prisma from '@/prisma/client';
import { retrieveTagGroups } from '@/prisma/data';
import { describe, expect, it } from 'vitest';
import { POST as CREATE } from '../route';
import { POST } from './route';

const reorderReq = (body: object) =>
  new Request('http://localhost/api/admin/tags/reorder', { method: 'POST', body: JSON.stringify(body) });

async function groupWithTags(names: string[]) {
  const group = await prisma.tagGroup.create({ data: { name: `G-${names.join('')}`, color: '#10b981' } });
  const tags = [];
  for (const name of names) tags.push(await prisma.tag.create({ data: { name, tagGroupId: group.id } }));
  return { group, tags };
}

describe('POST /api/admin/tags/reorder', () => {
  it('grava a nova ordem e as listagens passam a segui-la', async () => {
    const { group, tags } = await groupWithTags(['Alfa', 'Beta', 'Gama']);
    const [a, b, g] = tags;

    const res = await POST(reorderReq({ tagGroupId: group.id, ids: [g.id, a.id, b.id] }) as any);
    expect(res.status).toBe(204);

    const groups = await retrieveTagGroups();
    expect(groups.find((x) => x.id === group.id)?.tags.map((t) => t.name)).toEqual(['Gama', 'Alfa', 'Beta']);
  });

  it('sem ordem definida, cai para o nome', async () => {
    const { group } = await groupWithTags(['Zeta', 'Alfa']);
    const groups = await retrieveTagGroups();
    expect(groups.find((x) => x.id === group.id)?.tags.map((t) => t.name)).toEqual(['Alfa', 'Zeta']);
  });

  it('rejeita tag de outro grupo (400)', async () => {
    const one = await groupWithTags(['A1']);
    const two = await groupWithTags(['B1']);
    const res = await POST(reorderReq({ tagGroupId: one.group.id, ids: [one.tags[0].id, two.tags[0].id] }) as any);
    expect(res.status).toBe(400);
  });

  it('rejeita corpo inválido (400)', async () => {
    expect((await POST(reorderReq({ ids: [1] }) as any)).status).toBe(400);
    expect((await POST(reorderReq({ tagGroupId: 1, ids: 'x' }) as any)).status).toBe(400);
  });

  it('uma tag nova entra no fim do grupo', async () => {
    const { group, tags } = await groupWithTags(['Beta', 'Alfa']);
    await POST(reorderReq({ tagGroupId: group.id, ids: [tags[0].id, tags[1].id] }) as any);
    await CREATE(
      new Request('http://localhost/api/admin/tags', {
        method: 'POST',
        body: JSON.stringify({ name: 'Aaa', tagGroupId: group.id }),
      }) as any
    );
    const groups = await retrieveTagGroups();
    expect(groups.find((x) => x.id === group.id)?.tags.map((t) => t.name)).toEqual(['Beta', 'Alfa', 'Aaa']);
  });
});
