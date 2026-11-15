import { describe, it, expect } from 'vitest';
import { createOrUpdateService, retrieveService } from './data';
import prisma from './client';
import { ClientService } from './models';

// Regressão: trocar o arranjo escolhido pra uma música (mesma música, outro
// arranjo original) no editor de liturgia deveria atualizar a cópia salva —
// originalArrangementId, tom e cifra — não manter o arranjo antigo (bug
// relatado: "troquei o arranjo por outro que tem vídeo, mas não trocou").
describe('createOrUpdateService — trocar arranjo da mesma música', () => {
  it('cria uma cópia nova (não reaproveita a antiga) quando o originalArrangementId muda', async () => {
    const song = await prisma.song.create({
      data: { title: 'Música com Dois Arranjos', slug: 'musica-dois-arranjos', lyrics: '' },
    });
    const arrangementA = await prisma.songArrangement.create({
      data: {
        songId: song.id,
        key: 'C',
        name: 'Arranjo A',
        youtubeUrl: 'https://youtu.be/arranjoA000',
        units: { create: [{ type: 'VERSE', content: '[C]Arranjo A', order: 1 }] },
      },
    });
    const arrangementB = await prisma.songArrangement.create({
      data: {
        songId: song.id,
        key: 'D',
        name: 'Arranjo B',
        youtubeUrl: 'https://youtu.be/arranjoB111',
        units: { create: [{ type: 'CHORUS', content: '[D]Arranjo B', order: 1 }] },
      },
    });

    const baseService: ClientService = {
      slug: 'culto-trocar-arranjo',
      title: 'Culto Teste',
      worshipLeader: null,
      date: new Date('2026-01-01'),
      isDeleted: false,
      plan: {
        sections: [
          {
            id: 'sec-1',
            type: 'CULTO',
            label: 'Louvor',
            order: 1,
            units: [
              {
                clientId: 'unit-1',
                type: 'SONG',
                arrangementId: null,
                semitoneTranspose: 0,
                order: 1,
                arrangement: {
                  songId: song.id,
                  originalArrangementId: arrangementA.id,
                  key: arrangementA.key,
                  name: 'Arranjo A',
                  units: [{ type: 'VERSE', content: '[C]Arranjo A', order: 1, notes: null, repeatCount: 1 }],
                } as any,
              },
            ],
          },
        ],
      },
    };

    const firstSave = await createOrUpdateService(baseService);
    const firstArrangementId = firstSave.plan!.sections[0].units[0].arrangementId!;
    expect(firstArrangementId).toBeDefined();

    const firstCopy = await prisma.songArrangement.findUnique({ where: { id: firstArrangementId } });
    expect(firstCopy?.originalArrangementId).toBe(arrangementA.id);

    // Segunda save: mesma unidade (clientId igual), agora escolhendo o Arranjo B.
    const swapped: ClientService = {
      ...baseService,
      updatedAt: firstSave.updatedAt,
      plan: {
        sections: [
          {
            ...baseService.plan!.sections[0],
            units: [
              {
                clientId: 'unit-1',
                type: 'SONG',
                arrangementId: null,
                semitoneTranspose: 0,
                order: 1,
                arrangement: {
                  songId: song.id,
                  originalArrangementId: arrangementB.id,
                  key: arrangementB.key,
                  name: 'Arranjo B',
                  units: [{ type: 'CHORUS', content: '[D]Arranjo B', order: 1, notes: null, repeatCount: 1 }],
                } as any,
              },
            ],
          },
        ],
      },
    };

    const secondSave = await createOrUpdateService(swapped);
    const secondArrangementId = secondSave.plan!.sections[0].units[0].arrangementId!;

    // Uma cópia nova foi criada — não reaproveitou a antiga.
    expect(secondArrangementId).not.toBe(firstArrangementId);

    const secondCopy = await prisma.songArrangement.findUnique({
      where: { id: secondArrangementId },
      include: { units: true },
    });
    expect(secondCopy?.originalArrangementId).toBe(arrangementB.id);
    expect(secondCopy?.key).toBe('D');
    expect(secondCopy?.units[0]?.content).toBe('[D]Arranjo B');

    // A cópia antiga, órfã, foi apagada.
    const oldCopy = await prisma.songArrangement.findUnique({ where: { id: firstArrangementId } });
    expect(oldCopy).toBeNull();
  });
});
