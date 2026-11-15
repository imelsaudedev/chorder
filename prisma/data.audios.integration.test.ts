import { describe, it, expect } from 'vitest';
import { addArrangementAudio, removeArrangementAudio, renameArrangementAudio } from './data';
import prisma from './client';

async function createArrangement() {
  const song = await prisma.song.create({
    data: { title: 'Música de Teste', slug: `musica-teste-${Date.now()}`, lyrics: '' },
  });
  const arrangement = await prisma.songArrangement.create({
    data: { songId: song.id, key: 'C', isDefault: true },
  });
  return arrangement.id;
}

describe('addArrangementAudio', () => {
  it('cria o primeiro áudio com order 0', async () => {
    const arrangementId = await createArrangement();
    const audio = await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });
    expect(audio.order).toBe(0);
  });

  it('adiciona ao final da ordem existente, sem apagar os outros', async () => {
    const arrangementId = await createArrangement();
    await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });
    await addArrangementAudio(arrangementId, { url: 'https://x/b.mp3', label: 'Base' });

    const audios = await prisma.arrangementAudio.findMany({ where: { arrangementId }, orderBy: { order: 'asc' } });
    expect(audios).toHaveLength(2);
    expect(audios.map((a) => a.label)).toEqual(['Voz', 'Base']);
  });

  it('respeita um order explícito (restaurar após desfazer)', async () => {
    const arrangementId = await createArrangement();
    await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz', order: 0 });
    await addArrangementAudio(arrangementId, { url: 'https://x/c.mp3', label: 'Clique', order: 2 });
    // restaura um item que ocupava a posição 1, sem afetar as outras posições
    await addArrangementAudio(arrangementId, { url: 'https://x/b.mp3', label: 'Base', order: 1 });

    const audios = await prisma.arrangementAudio.findMany({ where: { arrangementId }, orderBy: { order: 'asc' } });
    expect(audios.map((a) => a.label)).toEqual(['Voz', 'Base', 'Clique']);
  });

  it('duas adições concorrentes não se apagam (regressão do PATCH em lote)', async () => {
    const arrangementId = await createArrangement();
    await Promise.all([
      addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Aba 1' }),
      addArrangementAudio(arrangementId, { url: 'https://x/b.mp3', label: 'Aba 2' }),
    ]);

    const audios = await prisma.arrangementAudio.findMany({ where: { arrangementId } });
    expect(audios).toHaveLength(2);
  });
});

describe('removeArrangementAudio', () => {
  it('remove só o item pedido, sem afetar os demais', async () => {
    const arrangementId = await createArrangement();
    const a = await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });
    await addArrangementAudio(arrangementId, { url: 'https://x/b.mp3', label: 'Base' });

    const removed = await removeArrangementAudio(arrangementId, a.id);
    expect(removed?.url).toBe('https://x/a.mp3');

    const remaining = await prisma.arrangementAudio.findMany({ where: { arrangementId } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].label).toBe('Base');
  });

  it('retorna null se o áudio não pertence ao arranjo informado', async () => {
    const arrangementId = await createArrangement();
    const otherArrangementId = await createArrangement();
    const a = await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });

    const removed = await removeArrangementAudio(otherArrangementId, a.id);
    expect(removed).toBeNull();

    const stillThere = await prisma.arrangementAudio.findUnique({ where: { id: a.id } });
    expect(stillThere).not.toBeNull();
  });
});

describe('renameArrangementAudio', () => {
  it('renomeia só o item pedido', async () => {
    const arrangementId = await createArrangement();
    const a = await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });

    const renamed = await renameArrangementAudio(arrangementId, a.id, 'Voz (ensaio)');
    expect(renamed).toBe(true);

    const updated = await prisma.arrangementAudio.findUnique({ where: { id: a.id } });
    expect(updated?.label).toBe('Voz (ensaio)');
  });

  it('retorna false se o áudio não pertence ao arranjo informado', async () => {
    const arrangementId = await createArrangement();
    const otherArrangementId = await createArrangement();
    const a = await addArrangementAudio(arrangementId, { url: 'https://x/a.mp3', label: 'Voz' });

    const renamed = await renameArrangementAudio(otherArrangementId, a.id, 'Outro nome');
    expect(renamed).toBe(false);
  });
});
