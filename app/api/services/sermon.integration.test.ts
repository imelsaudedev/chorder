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
  it('a lista mostra pregador, tema e texto do item Sermão', async () => {
    const res = await create('com-sermao', [
      unit(1, 'SERMAO', 'A graça que transforma', { preacher: 'Hugo Lima', reference: 'Jo 3.16', description: null }),
    ]);
    expect(res.status).toBe(200);

    const [row] = await list();
    expect(row.preacher).toBe('Hugo Lima');
    expect(row.sermonTheme).toBe('A graça que transforma');
    expect(row.sermonReference).toBe('Jo 3.16');
  });

  it('culto só de canções não tem pregador', async () => {
    await create('so-cancoes', [unit(1, 'OUTRO', 'Cantos', { description: null })]);
    const [row] = await list();
    expect(row.preacher).toBeNull();
    expect(row.sermonTheme).toBeNull();
    expect(row.sermonReference).toBeNull();
  });

  it('vários sermões: os pregadores aparecem juntos', async () => {
    await create('dois-sermoes', [
      unit(1, 'SERMAO', 'Primeiro', { preacher: 'Hugo Lima' }),
      unit(2, 'SERMAO', 'Segundo', { preacher: 'Ana Souza' }),
    ]);
    const [row] = await list();
    expect(row.preacher).toBe('Hugo Lima e Ana Souza');
    expect(row.sermonTheme).toBe('Primeiro');
  });
});
