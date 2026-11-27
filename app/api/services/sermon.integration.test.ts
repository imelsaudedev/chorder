import { auth } from '@/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../../prisma/client';
import { GET, POST } from './route';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

const unit = (order: number, type: string, label: string | null, metadata: object | null = null) => ({
  clientId: `u${order}`,
  type,
  order,
  semitoneTranspose: 0,
  arrangementId: null,
  durationMin: null,
  label,
  metadata,
});

const planWith = (...units: object[]) => ({
  startTime: '10:00',
  sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units }],
});

function create(slug: string, units: object[]) {
  return POST(
    new Request('http://localhost/api/services', {
      method: 'POST',
      body: JSON.stringify({
        title: slug,
        slug,
        date: '2026-12-06T10:00:00Z',
        isDeleted: false,
        worshipLeader: null,
        leaders: [],
        plan: planWith(...units),
      }),
    })
  );
}

const list = async () => (await (await GET(new Request('http://localhost/api/services?view=list'))).json()) as any[];

beforeEach(async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({ data: { id: 'ana', email: 'ana@test.com', name: 'Ana', roles: ['ADMIN'] } });
  vi.mocked(auth).mockResolvedValue({
    user: { id: 'ana', email: 'ana@test.com', roles: ['ADMIN'] },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as never);
});

describe('pregador, tema e texto vêm do item Sermão', () => {
  it('a lista mostra o que está no item Sermão, e a liturgia não grava nas colunas antigas', async () => {
    const res = await create('com-sermao', [
      unit(1, 'SERMAO', 'A graça que transforma', { preacher: 'Hugo Lima', reference: 'Jo 3.16', description: null }),
    ]);
    expect(res.status).toBe(200);

    const [row] = await list();
    expect(row.preacher).toBe('Hugo Lima');
    expect(row.sermonTheme).toBe('A graça que transforma');
    expect(row.sermonReference).toBe('Jo 3.16');

    const stored = await prisma.service.findFirstOrThrow({ where: { slug: 'com-sermao' } });
    expect(stored.preacher).toBeNull();
    expect(stored.sermonTheme).toBeNull();
    expect(stored.sermonReference).toBeNull();
  });

  it('culto só de canções não tem pregador', async () => {
    await create('so-cancoes', [unit(1, 'OUTRO', 'Cantos', { description: null })]);
    const [row] = await list();
    expect(row.preacher).toBeNull();
    expect(row.sermonTheme).toBeNull();
    expect(row.sermonReference).toBeNull();
  });

  it('culto antigo: a coluna antiga vale quando o item não diz nada, e o item vence quando diz', async () => {
    await prisma.service.create({
      data: {
        slug: 'antigo',
        title: 'Antigo',
        date: new Date('2020-01-05'),
        preacher: 'Pr. Antigo',
        sermonTheme: 'Tema antigo',
        sermonReference: 'Sl 23',
        plan: planWith(unit(1, 'OUTRO', 'Cantos', { description: null })) as object,
      },
    });
    await prisma.service.create({
      data: {
        slug: 'migrado',
        title: 'Migrado',
        date: new Date('2020-01-12'),
        preacher: 'Pr. Antigo',
        plan: planWith(unit(1, 'SERMAO', null, { preacher: 'Hugo Lima' })) as object,
      },
    });
    const rows = await list();
    expect(rows.find((r) => r.slug === 'antigo')).toMatchObject({
      preacher: 'Pr. Antigo',
      sermonTheme: 'Tema antigo',
      sermonReference: 'Sl 23',
    });
    expect(rows.find((r) => r.slug === 'migrado').preacher).toBe('Hugo Lima');
  });

  it('salvar um culto antigo não apaga as colunas antigas', async () => {
    await prisma.service.create({
      data: { slug: 'antigo-2', title: 'Antigo 2', date: new Date('2020-02-02'), preacher: 'Pr. Antigo', plan: planWith(unit(1, 'OUTRO', null, { description: null })) as object },
    });
    const existing = await prisma.service.findFirstOrThrow({ where: { slug: 'antigo-2' } });
    const { POST: SAVE } = await import('./[slugOrId]/route');
    const { NextRequest } = await import('next/server');
    const res = await SAVE(
      new NextRequest('http://localhost/api/services/antigo-2', {
        method: 'POST',
        body: JSON.stringify({
          id: existing.id,
          slug: 'antigo-2',
          title: 'Antigo 2 editado',
          date: existing.date,
          isDeleted: false,
          worshipLeader: null,
          leaders: [],
          updatedAt: existing.updatedAt,
          plan: planWith(unit(1, 'OUTRO', null, { description: null })),
        }),
      }),
      { params: Promise.resolve({ slugOrId: 'antigo-2' }) }
    );
    expect(res.status).toBe(200);
    expect((await prisma.service.findFirstOrThrow({ where: { slug: 'antigo-2' } })).preacher).toBe('Pr. Antigo');
  });
});
