import { describe, it, expect } from 'vitest';
import { GET } from './route';
import prisma from '@/prisma/client';
import { NextRequest } from 'next/server';

describe('Songs API integration', () => {
    it('returns filtered songs via GET', async () => {
        // Seed data
        await prisma.song.create({
            data: {
                title: 'Searchable Song',
                slug: 'searchable-song',
                lyrics: '...',
                arrangements: {
                    create: { key: 'C', isDefault: true }
                }
            }
        });
        
        // Create request
        const url = new URL('http://localhost/api/songs?query=Searchable');
        const req = new NextRequest(url);
        
        const response = await GET(req);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data).toHaveLength(1);
        expect(data[0].title).toBe('Searchable Song');
    });

    it('returns empty list when no match', async () => {
        const url = new URL('http://localhost/api/songs?query=NonExistent');
        const req = new NextRequest(url);
        
        const response = await GET(req);
        const data = await response.json();
        
        expect(data).toHaveLength(0);
    });
});
