import { beforeEach, describe, it, expect, vi } from 'vitest';
import { GET, POST } from './route';
import {
  DELETE as DELETE_ONE,
  GET as GET_ONE,
  PATCH as PATCH_ONE,
  POST as POST_ONE,
} from './[slugOrId]/route';
import { POST as POST_MINIMAL_ARRANGEMENT } from '../songs/[slugOrId]/arrangements/route';
import {
  DELETE as DELETE_SHARE,
  GET as GET_SHARES,
  POST as POST_SHARE,
} from './[slugOrId]/shares/route';
import prisma from '../../../prisma/client';
import { auth } from '@/auth';
import { NextRequest } from 'next/server';

vi.mock('@/auth', () => ({ auth: vi.fn() }));

beforeEach(async () => {
  await prisma.serviceShare.deleteMany();
  await prisma.user.deleteMany();
  vi.mocked(auth).mockResolvedValue({
    user: { id: 'test-user-id', email: 'admin@test.com', roles: ['ADMIN'] },
    expires: new Date(Date.now() + 60_000).toISOString(),
  });
});

describe('Services API role guards', () => {
  it('blocks unauthenticated and regular users from GET /api/services, allows MEDIA', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    expect((await GET(new Request('http://localhost/api/services'))).status).toBe(401);

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'test-user-id', email: 'regular@test.com', roles: [] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
    expect((await GET(new Request('http://localhost/api/services'))).status).toBe(403);

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'test-user-id', email: 'media@test.com', roles: ['MEDIA'] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
    expect((await GET(new Request('http://localhost/api/services'))).status).toBe(200);
  });

  it('blocks unauthenticated and MEDIA users from POST /api/songs/[slugOrId]/arrangements', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);
    const unauthRes = await POST_MINIMAL_ARRANGEMENT(
      new NextRequest('http://localhost/api/songs/any/arrangements', { method: 'POST' }),
      { params: Promise.resolve({ slugOrId: 'any' }) }
    );
    expect(unauthRes.status).toBe(401);

    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'test-user-id', email: 'media@test.com', roles: ['MEDIA'] },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });
    const mediaRes = await POST_MINIMAL_ARRANGEMENT(
      new NextRequest('http://localhost/api/songs/any/arrangements', { method: 'POST' }),
      { params: Promise.resolve({ slugOrId: 'any' }) }
    );
    expect(mediaRes.status).toBe(403);
  });

  it('prevents POST /api/services from overwriting an existing slug and prevents slug/id mismatch overwrite', async () => {
    const victim = await prisma.service.create({
      data: {
        title: 'Victim Service',
        slug: 'victim-service',
        date: new Date('2026-08-01T10:00:00Z'),
        isDeleted: false,
      },
    });
    const owned = await prisma.service.create({
      data: {
        title: 'Owned Service',
        slug: 'owned-service',
        date: new Date('2026-08-02T10:00:00Z'),
        isDeleted: false,
      },
    });

    // 1. POST /api/services with existing slug returns 409 and does NOT overwrite victim
    const dupRes = await POST(
      new Request('http://localhost/api/services', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Overwritten',
          slug: 'victim-service',
          date: '2026-08-01T10:00:00Z',
          worshipLeader: null,
          isDeleted: false,
          plan: { startTime: '10:00', sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] }] },
        }),
      })
    );
    expect(dupRes.status).toBe(409);

    // 2. POST /api/services/<owned.id> with victim's slug returns 400 and does NOT overwrite victim
    const mismatchRes = await POST_ONE(
      new NextRequest(`http://localhost/api/services/${owned.id}`, {
        method: 'POST',
        body: JSON.stringify({
          id: owned.id,
          title: 'Overwritten via mismatch',
          slug: 'victim-service',
          date: '2026-08-02T10:00:00Z',
          worshipLeader: null,
          preacher: null,
          sermonTheme: null,
          sermonReference: null,
          isDeleted: false,
          plan: { startTime: '10:00', sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] }] },
        }),
      }),
      { params: Promise.resolve({ slugOrId: String(owned.id) }) }
    );
    expect(mismatchRes.status).toBe(400);

    const freshVictim = await prisma.service.findUnique({ where: { id: victim.id } });
    expect(freshVictim?.title).toBe('Victim Service');
  });
});

describe('Services API integration', () => {
    it('returns services via GET', async () => {
        await prisma.service.create({
            data: {
                title: 'Sunday Service',
                slug: 'sunday-service',
                date: new Date('2026-04-05T10:00:00Z'),
                isDeleted: false,
            }
        });

        const response = await GET(new Request('http://localhost/api/services'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(1);
        expect(data[0].title).toBe('Sunday Service');
    });

    it('GET ?view=list devolve o resumo da lista, sem o plano, com contagem e títulos das músicas', async () => {
        const song = await prisma.song.create({
            data: {
                title: 'Grande é o Senhor',
                slug: 'grande-e-o-senhor',
                lyrics: '...',
                arrangements: {
                    create: { key: 'G', isDefault: true, name: 'Default', isDeleted: false, isServiceArrangement: false, originalArrangementId: null },
                },
            },
            include: { arrangements: true },
        });
        const arrangementId = song.arrangements[0].id;
        await prisma.service.create({
            data: {
                title: 'Culto de domingo',
                slug: 'culto-lista',
                date: new Date('2026-05-03T10:00:00Z'),
                worshipLeader: 'Ana',
                preacher: 'Pr. Samuel',
                sermonTheme: 'Gratidão',
                sermonReference: 'Sl 103',
                plan: {
                    startTime: '09:30',
                    sections: [
                        { id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [
                            { clientId: 'u1', type: 'SONG', arrangementId, semitoneTranspose: 0, order: 1 },
                            { clientId: 'u2', type: 'ORACAO', arrangementId: null, semitoneTranspose: 0, order: 2 },
                        ] },
                    ],
                },
            },
        });

        const response = await GET(new Request('http://localhost/api/services?view=list'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(1);
        expect(data[0]).toMatchObject({
            slug: 'culto-lista',
            worshipLeader: 'Ana',
            preacher: 'Pr. Samuel',
            sermonTheme: 'Gratidão',
            sermonReference: 'Sl 103',
            startTime: '09:30',
            songCount: 1,
            songTitles: ['Grande é o Senhor'],
        });
        expect(data[0]).not.toHaveProperty('plan');
    });

    it('creates a new service with plan via POST', async () => {
        const song = await prisma.song.create({
            data: {
                title: 'Service Song',
                slug: 'service-song',
                lyrics: '...',
                arrangements: {
                    create: {
                        key: 'G',
                        isDefault: true,
                        name: 'Default',
                        isDeleted: false,
                        isServiceArrangement: false,
                        originalArrangementId: null,
                    }
                }
            },
            include: { arrangements: true }
        });
        const arrangement = song.arrangements[0];

        const serviceData = {
            title: 'New Wednesday Service',
            slug: 'wed-service',
            date: '2026-04-08T19:00:00Z',
            worshipLeader: null,
            isDeleted: false,
            plan: {
                startTime: '19:00',
                sections: [
                    {
                        id: 'section-1',
                        type: 'CULTO',
                        label: 'Culto',
                        order: 1,
                        units: [
                            {
                                clientId: 'unit-1',
                                type: 'SONG',
                                order: 1,
                                semitoneTranspose: 0,
                                arrangementId: arrangement.id,
                                durationMin: 4,
                                label: null,
                                metadata: null,
                                arrangement: {
                                    id: arrangement.id,
                                    songId: song.id,
                                    name: 'Service Version',
                                    key: 'A',
                                    isDefault: false,
                                    isDeleted: false,
                                    isServiceArrangement: true,
                                    originalArrangementId: arrangement.id,
                                    youtubeUrl: null,
                                    audios: [],
                                    units: [
                                        { content: 'Verse 1', type: 'VERSE', order: 1, notes: null, repeatCount: 1 }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        };

        const req = new Request('http://localhost/api/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.title).toBe('New Wednesday Service');
        expect(data.plan).toBeTruthy();
        expect(data.plan.sections).toHaveLength(1);
        expect(data.plan.sections[0].units).toHaveLength(1);
        expect(data.plan.sections[0].units[0].type).toBe('SONG');
    });

    it('guarda item "Outro", e o título próprio e o comentário de uma música, no plano e devolve os dois', async () => {
        const song = await prisma.song.create({
            data: {
                title: 'Música com comentário',
                slug: 'musica-com-comentario',
                lyrics: '...',
                arrangements: {
                    create: { key: 'D', isDefault: true, name: 'Default', isDeleted: false, isServiceArrangement: false, originalArrangementId: null }
                }
            },
            include: { arrangements: true }
        });
        const arrangement = song.arrangements[0];

        const req = new Request('http://localhost/api/services', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Culto com Outro',
                slug: 'culto-com-outro',
                date: '2026-04-12T10:00:00Z',
                worshipLeader: null,
                isDeleted: false,
                plan: {
                    startTime: '10:00',
                    sections: [
                        {
                            id: 'section-1',
                            type: 'CULTO',
                            label: 'Culto',
                            order: 1,
                            units: [
                                {
                                    clientId: 'outro-1',
                                    type: 'OUTRO',
                                    order: 1,
                                    semitoneTranspose: null,
                                    arrangementId: null,
                                    durationMin: 10,
                                    label: 'Ceia',
                                    metadata: { description: 'Distribuir o pão e o cálice' }
                                },
                                {
                                    clientId: 'song-1',
                                    type: 'SONG',
                                    order: 2,
                                    semitoneTranspose: 0,
                                    arrangementId: arrangement.id,
                                    durationMin: 4,
                                    label: null,
                                    metadata: { title: 'Música com comentário (curta)', comment: 'Começar só com violão' },
                                    arrangement: {
                                        id: arrangement.id,
                                        songId: song.id,
                                        name: 'Service Version',
                                        key: 'D',
                                        isDefault: false,
                                        isDeleted: false,
                                        isServiceArrangement: true,
                                        originalArrangementId: arrangement.id,
                                        youtubeUrl: null,
                                        audios: [],
                                        units: [{ content: 'Verse 1', type: 'VERSE', order: 1, notes: null, repeatCount: 1 }]
                                    }
                                }
                            ]
                        }
                    ]
                }
            })
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        const units = data.plan.sections[0].units;
        expect(units[0]).toMatchObject({ type: 'OUTRO', label: 'Ceia', durationMin: 10, metadata: { description: 'Distribuir o pão e o cálice' } });
        expect(units[1]).toMatchObject({ type: 'SONG', metadata: { title: 'Música com comentário (curta)', comment: 'Começar só com violão' } });
    });

    it('rejects service without plan or units', async () => {
        const serviceData = {
            title: 'Empty Service',
            slug: 'empty-service',
            date: '2026-04-08T19:00:00Z',
            worshipLeader: null,
            isDeleted: false,
        };

        const req = new Request('http://localhost/api/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});

describe('Private drafts integration', () => {
    it('keeps DRAFT services private to the creator until published', async () => {
        const author = await prisma.user.create({
            data: { email: 'author@test.com', name: 'Author', roles: ['WORSHIP'] },
        });
        const otherAdmin = await prisma.user.create({
            data: { email: 'other-admin@test.com', name: 'Other Admin', roles: ['ADMIN'] },
        });
        const mediaUser = await prisma.user.create({
            data: { email: 'media-user@test.com', name: 'Media', roles: ['MEDIA'] },
        });

        const sessionFor = (u: { id: string; email: string; roles: ('ADMIN' | 'WORSHIP' | 'MEDIA' | 'USER')[] }) => ({
            user: { id: u.id, email: u.email, roles: u.roles },
            expires: new Date(Date.now() + 60_000).toISOString(),
        });

        // 1. Author creates a DRAFT service
        vi.mocked(auth).mockResolvedValue(sessionFor(author));
        const createRes = await POST(
            new Request('http://localhost/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Rascunho do Dirigente',
                    slug: 'rascunho-dirigente',
                    date: '2026-06-01T10:00:00Z',
                    worshipLeader: 'Author',
                    isDeleted: false,
                    status: 'DRAFT',
                    plan: {
                        startTime: '10:00',
                        sections: [
                            { id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] },
                        ],
                    },
                }),
            })
        );
        expect(createRes.status).toBe(200);
        const created = await createRes.json();
        expect(created.status).toBe('DRAFT');
        expect(created.createdById).toBe(author.id);

        // 2. Author sees their own draft in list & single GET
        const authorList = await (await GET(new Request('http://localhost/api/services?view=list'))).json();
        expect(authorList.map((s: { slug: string }) => s.slug)).toContain('rascunho-dirigente');

        const authorGet = await GET_ONE(new Request('http://localhost/api/services/rascunho-dirigente'), {
            params: Promise.resolve({ slugOrId: 'rascunho-dirigente', arrangementId: 'default' }),
        });
        expect(authorGet.status).toBe(200);

        // 3. Another ADMIN does NOT see the author's private draft and gets 404 on GET/PATCH/DELETE
        vi.mocked(auth).mockResolvedValue(sessionFor(otherAdmin));
        const otherList = await (await GET(new Request('http://localhost/api/services?view=list'))).json();
        expect(otherList.map((s: { slug: string }) => s.slug)).not.toContain('rascunho-dirigente');

        const otherGet = await GET_ONE(new Request('http://localhost/api/services/rascunho-dirigente'), {
            params: Promise.resolve({ slugOrId: 'rascunho-dirigente', arrangementId: 'default' }),
        });
        expect(otherGet.status).toBe(404);

        const otherPatch = await PATCH_ONE(
            new NextRequest('http://localhost/api/services/rascunho-dirigente', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'PUBLISHED' }),
            }),
            { params: Promise.resolve({ slugOrId: 'rascunho-dirigente' }) }
        );
        expect(otherPatch.status).toBe(404);

        const otherDelete = await DELETE_ONE(new Request('http://localhost/api/services/rascunho-dirigente', { method: 'DELETE' }), {
            params: Promise.resolve({ slugOrId: 'rascunho-dirigente' }),
        });
        expect(otherDelete.status).toBe(404);

        // 4. Author publishes the draft via PATCH
        vi.mocked(auth).mockResolvedValue(sessionFor(author));
        const publishRes = await PATCH_ONE(
            new NextRequest('http://localhost/api/services/rascunho-dirigente', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'PUBLISHED' }),
            }),
            { params: Promise.resolve({ slugOrId: 'rascunho-dirigente' }) }
        );
        expect(publishRes.status).toBe(200);

        // 5. Now MEDIA and other ADMIN can see the published service, but MEDIA cannot change status
        vi.mocked(auth).mockResolvedValue(sessionFor(mediaUser));
        const mediaList = await (await GET(new Request('http://localhost/api/services?view=list'))).json();
        expect(mediaList.map((s: { slug: string }) => s.slug)).toContain('rascunho-dirigente');

        const mediaUnpublish = await PATCH_ONE(
            new NextRequest('http://localhost/api/services/rascunho-dirigente', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'DRAFT' }),
            }),
            { params: Promise.resolve({ slugOrId: 'rascunho-dirigente' }) }
        );
        expect(mediaUnpublish.status).toBe(403);

        // 6. Even the author/ADMIN cannot revert a PUBLISHED service back to DRAFT (prevents orphaning)
        vi.mocked(auth).mockResolvedValue(sessionFor(author));
        const authorUnpublish = await PATCH_ONE(
            new NextRequest('http://localhost/api/services/rascunho-dirigente', {
                method: 'PATCH',
                body: JSON.stringify({ status: 'DRAFT' }),
            }),
            { params: Promise.resolve({ slugOrId: 'rascunho-dirigente' }) }
        );
        expect(authorUnpublish.status).toBe(400);
    });
});

describe('Personal services & sharing integration', () => {
    it('supports personal services, selective user shares (VIEW/EDIT), and Google-Docs-style share links', async () => {
        const owner = await prisma.user.create({
            data: { email: 'owner@test.com', name: 'Owner', roles: [] },
        });
        const viewer = await prisma.user.create({
            data: { email: 'viewer@test.com', name: 'Viewer', roles: [] },
        });
        const editor = await prisma.user.create({
            data: { email: 'editor@test.com', name: 'Editor', roles: [] },
        });
        const admin = await prisma.user.create({
            data: { email: 'admin-outsider@test.com', name: 'Admin', roles: ['ADMIN'] },
        });

        const sessionFor = (u: { id: string; email: string; roles: ('ADMIN' | 'WORSHIP' | 'MEDIA' | 'USER')[] }) => ({
            user: { id: u.id, email: u.email, roles: u.roles },
            expires: new Date(Date.now() + 60_000).toISOString(),
        });

        // 1. Regular user cannot create CHURCH service, but CAN create PERSONAL service
        vi.mocked(auth).mockResolvedValue(sessionFor(owner));
        const churchRes = await POST(
            new Request('http://localhost/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Unauthorized Church',
                    slug: 'unauth-church',
                    date: '2026-07-01T10:00:00Z',
                    worshipLeader: null,
                    isDeleted: false,
                    scope: 'CHURCH',
                    plan: { startTime: '10:00', sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] }] },
                }),
            })
        );
        expect(churchRes.status).toBe(403);

        const personalRes = await POST(
            new Request('http://localhost/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Grupo Pequeno Quinta',
                    slug: 'gp-quinta',
                    date: '2026-07-02T20:00:00Z',
                    worshipLeader: 'Owner',
                    isDeleted: false,
                    scope: 'PERSONAL',
                    plan: { startTime: '20:00', sections: [{ id: 's1', type: 'CULTO', label: 'Encontro', order: 1, units: [] }] },
                }),
            })
        );
        expect(personalRes.status).toBe(200);
        const created = await personalRes.json();
        expect(created.scope).toBe('PERSONAL');
        expect(created.isOwner).toBe(true);

        // 2. Private by default: even an ADMIN outsider cannot see it
        vi.mocked(auth).mockResolvedValue(sessionFor(admin));
        const adminChurchList = await (await GET(new Request('http://localhost/api/services?view=list&scope=church'))).json();
        expect(adminChurchList.map((s: { slug: string }) => s.slug)).not.toContain('gp-quinta');
        const adminGet = await GET_ONE(new Request('http://localhost/api/services/gp-quinta'), {
            params: Promise.resolve({ slugOrId: 'gp-quinta', arrangementId: 'default' }),
        });
        expect(adminGet.status).toBe(404);

        // 3. Owner shares with viewer (VIEW) and editor (EDIT)
        vi.mocked(auth).mockResolvedValue(sessionFor(owner));
        const addViewer = await POST_SHARE(
            new NextRequest('http://localhost/api/services/gp-quinta/shares', {
                method: 'POST',
                body: JSON.stringify({ email: 'viewer@test.com', permission: 'VIEW' }),
            }),
            { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
        );
        expect(addViewer.status).toBe(200);

        const addEditor = await POST_SHARE(
            new NextRequest('http://localhost/api/services/gp-quinta/shares', {
                method: 'POST',
                body: JSON.stringify({ email: 'editor@test.com', permission: 'EDIT' }),
            }),
            { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
        );
        expect(addEditor.status).toBe(200);

        // Viewer sees it with isSharedWithMe=true, can GET, cannot PATCH or DELETE
        vi.mocked(auth).mockResolvedValue(sessionFor(viewer));
        const viewerList = await (await GET(new Request('http://localhost/api/services?view=list&scope=personal'))).json();
        expect(viewerList).toEqual(
            expect.arrayContaining([expect.objectContaining({ slug: 'gp-quinta', isSharedWithMe: true })])
        );
        expect(
            (await PATCH_ONE(
                new NextRequest('http://localhost/api/services/gp-quinta', { method: 'PATCH', body: JSON.stringify({ title: 'Hack' }) }),
                { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
            )).status
        ).toBe(403);

        // Editor can PATCH, cannot DELETE or manage shares
        vi.mocked(auth).mockResolvedValue(sessionFor(editor));
        expect(
            (await PATCH_ONE(
                new NextRequest('http://localhost/api/services/gp-quinta', { method: 'PATCH', body: JSON.stringify({ title: 'GP Quinta Atualizado' }) }),
                { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
            )).status
        ).toBe(200);
        expect(
            (await DELETE_ONE(new Request('http://localhost/api/services/gp-quinta', { method: 'DELETE' }), {
                params: Promise.resolve({ slugOrId: 'gp-quinta' }),
            })).status
        ).toBe(403);
        expect(
            (await GET_SHARES(new NextRequest('http://localhost/api/services/gp-quinta/shares'), {
                params: Promise.resolve({ slugOrId: 'gp-quinta' }),
            })).status
        ).toBe(403);

        // 4. Owner enables shareable link -> unauthenticated visitor can view with token, not without
        vi.mocked(auth).mockResolvedValue(sessionFor(owner));
        const enableRes = await POST_SHARE(
            new NextRequest('http://localhost/api/services/gp-quinta/shares', {
                method: 'POST',
                body: JSON.stringify({ linkSharing: 'enable' }),
            }),
            { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
        );
        expect(enableRes.status).toBe(200);
        const { shareToken } = await enableRes.json();
        expect(typeof shareToken).toBe('string');

        // Shared non-owner calling GET /api/services?scope=personal must NOT receive shareToken
        vi.mocked(auth).mockResolvedValue(sessionFor(viewer));
        const viewerFullList = await (await GET(new Request('http://localhost/api/services?scope=personal'))).json();
        const sharedEntry = viewerFullList.find((s: { slug: string }) => s.slug === 'gp-quinta');
        expect(sharedEntry).toBeDefined();
        expect(sharedEntry.shareToken).toBeNull();

        // Regular user cannot overwrite an existing church service via POST /api/services with scope=PERSONAL
        const churchVictim = await prisma.service.create({
            data: {
                title: 'Official Church Liturgy',
                slug: 'official-church-liturgy',
                date: new Date('2026-07-05T10:00:00Z'),
                isDeleted: false,
                scope: 'CHURCH',
                status: 'PUBLISHED',
            },
        });
        const overwriteAttempt = await POST(
            new Request('http://localhost/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Hijacked',
                    slug: 'official-church-liturgy',
                    date: '2026-07-05T10:00:00Z',
                    worshipLeader: null,
                    isDeleted: false,
                    scope: 'PERSONAL',
                    plan: { startTime: '10:00', sections: [{ id: 's1', type: 'CULTO', label: 'Culto', order: 1, units: [] }] },
                }),
            })
        );
        expect(overwriteAttempt.status).toBe(409);
        const untouchedChurch = await prisma.service.findUnique({ where: { id: churchVictim.id } });
        expect(untouchedChurch?.title).toBe('Official Church Liturgy');

        vi.mocked(auth).mockResolvedValue(null);
        const anonValid = await GET_ONE(
            new Request(`http://localhost/api/services/gp-quinta?share=${shareToken}`),
            { params: Promise.resolve({ slugOrId: 'gp-quinta', arrangementId: 'default' }) }
        );
        expect(anonValid.status).toBe(200);
        const anonData = await anonValid.json();
        expect(anonData.title).toBe('GP Quinta Atualizado');
        expect(anonData.shareToken).toBeNull();
        expect(anonData.canEdit).toBe(false);

        const anonInvalid = await GET_ONE(
            new Request('http://localhost/api/services/gp-quinta?share=wrong-token'),
            { params: Promise.resolve({ slugOrId: 'gp-quinta', arrangementId: 'default' }) }
        );
        expect(anonInvalid.status).toBe(404);

        // 5. Owner disables link and removes viewer share -> both lose access
        vi.mocked(auth).mockResolvedValue(sessionFor(owner));
        await POST_SHARE(
            new NextRequest('http://localhost/api/services/gp-quinta/shares', {
                method: 'POST',
                body: JSON.stringify({ linkSharing: 'disable' }),
            }),
            { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
        );
        await DELETE_SHARE(
            new NextRequest(`http://localhost/api/services/gp-quinta/shares?userId=${viewer.id}`, { method: 'DELETE' }),
            { params: Promise.resolve({ slugOrId: 'gp-quinta' }) }
        );

        vi.mocked(auth).mockResolvedValue(null);
        expect(
            (await GET_ONE(new Request(`http://localhost/api/services/gp-quinta?share=${shareToken}`), {
                params: Promise.resolve({ slugOrId: 'gp-quinta', arrangementId: 'default' }),
            })).status
        ).toBe(404);

        vi.mocked(auth).mockResolvedValue(sessionFor(viewer));
        expect(
            (await GET_ONE(new Request('http://localhost/api/services/gp-quinta'), {
                params: Promise.resolve({ slugOrId: 'gp-quinta', arrangementId: 'default' }),
            })).status
        ).toBe(404);
    });
});
