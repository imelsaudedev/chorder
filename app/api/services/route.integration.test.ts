import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import prisma from '../../../prisma/client';

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
