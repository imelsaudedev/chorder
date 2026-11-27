import { auth } from '@/auth';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../../prisma/client';
import { GET as GET_PEOPLE } from '../people/route';
import { GET, POST } from './route';
import { GET as GET_ONE, POST as POST_ONE } from './[slugOrId]/route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

const session = (id: string) => ({
  user: { id, email: `${id}@test.com`, roles: ['ADMIN'] },
  expires: new Date(Date.now() + 60_000).toISOString(),
});

const plan = {
  startTime: '10:00',
  sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] }],
};

function body(extra: Record<string, unknown>) {
  return JSON.stringify({
    title: 'Culto',
    slug: 'culto-leaders',
    date: '2026-12-06T10:00:00Z',
    isDeleted: false,
    worshipLeader: null,
    plan,
    ...extra,
  });
}

let ana: { id: string };
let hugo: { id: string };

beforeEach(async () => {
  await prisma.user.deleteMany();
  ana = await prisma.user.create({ data: { id: 'ana', email: 'ana@test.com', name: 'Ana Souza', roles: ['ADMIN'] } });
  hugo = await prisma.user.create({ data: { id: 'hugo', email: 'hugo@test.com', name: 'Hugo Lima' } });
  vi.mocked(auth).mockResolvedValue(session('ana') as never);
});

describe('vários dirigentes', () => {
  it('guarda a lista, deriva o texto e devolve na leitura', async () => {
    const res = await POST(
      new Request('http://localhost/api/services', {
        method: 'POST',
        body: body({
          worshipLeader: 'ignorado',
          leaders: [
            { userId: ana.id, name: 'Ana Souza' },
            { userId: hugo.id, name: 'Hugo Lima' },
            { userId: null, name: 'Visitante' },
          ],
        }),
      })
    );
    expect(res.status).toBe(200);
    const created = await res.json();
    expect(created.worshipLeader).toBe('Ana Souza, Hugo Lima e Visitante');
    expect(created.leaders).toEqual([
      { userId: 'ana', name: 'Ana Souza' },
      { userId: 'hugo', name: 'Hugo Lima' },
      { userId: null, name: 'Visitante' },
    ]);

    const list = await (await GET(new Request('http://localhost/api/services?view=list'))).json();
    expect(list[0].leaders).toEqual(['Ana Souza', 'Hugo Lima', 'Visitante']);
  });

  it('trocar a lista ao salvar substitui os dirigentes e conta de usuário apagado vira só o nome', async () => {
    const created = await (
      await POST(
        new Request('http://localhost/api/services', {
          method: 'POST',
          body: body({ leaders: [{ userId: ana.id, name: 'Ana Souza' }, { userId: hugo.id, name: 'Hugo Lima' }] }),
        })
      )
    ).json();

    const saved = await POST_ONE(
      new NextRequest(`http://localhost/api/services/${created.slug}`, {
        method: 'POST',
        body: JSON.stringify({
          ...created,
          leaders: [{ userId: 'nao-existe', name: 'Caio' }],
        }),
      }),
      { params: Promise.resolve({ slugOrId: created.slug }) }
    );
    expect(saved.status).toBe(200);
    const after = await saved.json();
    expect(after.worshipLeader).toBe('Caio');
    expect(after.leaders).toEqual([{ userId: null, name: 'Caio' }]);
    expect(await prisma.serviceLeader.count()).toBe(1);
  });

  it('cliente antigo, que só manda o texto, vira um dirigente sem conta; culto antigo sem lista é lido assim', async () => {
    const res = await POST(
      new Request('http://localhost/api/services', {
        method: 'POST',
        body: body({ worshipLeader: 'Hugo' }),
      })
    );
    expect((await res.json()).leaders).toEqual([{ userId: null, name: 'Hugo' }]);

    await prisma.service.create({
      data: { slug: 'antigo', title: 'Antigo', date: new Date('2020-01-01'), worshipLeader: 'Ana e Caio', plan },
    });
    const old = await (
      await GET_ONE(new Request('http://localhost/api/services/antigo'), { params: Promise.resolve({ slugOrId: 'antigo', arrangementId: 'default' }) })
    ).json();
    expect(old.leaders).toEqual([{ userId: null, name: 'Ana e Caio' }]);
  });

  it('apagar a conta mantém o nome do dirigente', async () => {
    const r = await POST(
      new Request('http://localhost/api/services', {
        method: 'POST',
        body: body({ leaders: [{ userId: hugo.id, name: 'Hugo Lima' }] }),
      })
    );
    expect(r.status).toBe(200);
    await prisma.user.delete({ where: { id: hugo.id } });
    const row = await prisma.serviceLeader.findFirstOrThrow();
    expect(row.userId).toBeNull();
    expect(row.name).toBe('Hugo Lima');
  });
});

describe('GET /api/people', () => {
  it('exige login e devolve só id, nome e foto', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    expect((await GET_PEOPLE(new Request('http://localhost/api/people'))).status).toBe(401);

    const res = await GET_PEOPLE(new Request('http://localhost/api/people?q=hugo'));
    const people = await res.json();
    expect(people).toEqual([{ id: 'hugo', name: 'Hugo Lima', image: null }]);
    expect(JSON.stringify(people)).not.toContain('@');
  });

  it('usuário comum, sem perfil, também busca (monta liturgia pessoal)', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'ana', email: 'ana@test.com', roles: [] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    } as never);
    expect((await GET_PEOPLE(new Request('http://localhost/api/people'))).status).toBe(200);
  });
});
