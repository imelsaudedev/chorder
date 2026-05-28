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
                isDeleted: false
            }
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveLength(1);
        expect(data[0].title).toBe('Sunday Service');
    });

    it('creates a new service via POST', async () => {
        // We need an existing song and arrangement to create a service unit
        const song = await prisma.song.create({
            data: {
                title: 'Service Song',
                slug: 'service-song',
                lyrics: '...',
                arrangements: {
                    create: { key: 'G', isDefault: true, name: 'Default', isDeleted: false, isServiceArrangement: false, originalArrangementId: null }
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
            units: [
                {
                    type: 'SONG',
                    order: 1,
                    semitoneTranspose: 0,
                    arrangementId: arrangement.id,
                    arrangement: {
                        id: arrangement.id,
                        songId: song.id,
                        name: 'Service Version',
                        key: 'A',
                        isDefault: false,
                        isDeleted: false,
                        isServiceArrangement: true,
                        originalArrangementId: arrangement.id,
                        units: [
                            { content: 'Verse 1', type: 'VERSE', order: 1 }
                        ]
                    }
                }
            ]
        };

        const req = new Request('http://localhost/api/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.title).toBe('New Wednesday Service');
        expect(data.units).toHaveLength(1);
        expect(data.units[0].arrangement.key).toBe('A');
    });
});
