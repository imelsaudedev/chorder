import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Force load .env.test to override any existing DATABASE_URL in the shell environment
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  const envConfig = fs.readFileSync(envTestPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const key = line.split('=')[0]; const value = line.substring(line.indexOf('=') + 1);
    if (key && value) {
      let finalValue = value.trim();
      if (key.trim() === 'DATABASE_URL') {
        finalValue = finalValue.replace('schema=public', 'schema=e2e');
      }
      process.env[key.trim()] = finalValue;
    }
  });
}

const prisma = new PrismaClient();

export async function clearDatabase() {
  const dbUrl = process.env.DATABASE_URL || "";
  console.log('--- E2E clearDatabase hitting:', dbUrl.replace(/:[^:@]+@/, ':***@'));

  const schema = dbUrl.includes('schema=') ? dbUrl.split('schema=')[1].split('&')[0] : 'public';

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname=${schema}`;

  if (tablenames.length === 0) return;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"${schema}"."${name}"`)
    .join(", ");

  if (!tables) return;

  // CRITICAL SAFETY CHECK: Prevent truncating non-test databases
  if (!dbUrl.includes("chorder_test")) {
    throw new Error(
      `CRITICAL SAFETY BLOCK: clearDatabase() was called against a non-test database: ${dbUrl}. Truncation aborted.`
    );
  }

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}

export async function seedVisualBaseline() {
  await clearDatabase();

  console.log('--- E2E seedVisualBaseline: Creating song...');
  // Seed complex song for visual checks
  const song = await prisma.song.create({
    data: {
      title: 'Visual Baseline Song',
      slug: 'visual-baseline-song',
      artist: 'Testing Artist',
      lyrics: '[V1]\nG           C\nThis is a baseline song\nD           G\nWith chords and sections.\n\n[CH]\nG           C\nChorus with visual richness\nD           G\nAnd multi-line lyrics here.'
    }
  });

  console.log('--- E2E seedVisualBaseline: Creating arrangement...');
  const arrangement = await prisma.songArrangement.create({
    data: {
      songId: song.id,
      key: 'G',
      name: 'Standard Arrangement',
      isDefault: true,
      units: {
        create: [
          { type: 'VERSE', order: 1, content: 'This is a baseline song\nWith chords and sections.' },
          { type: 'CHORUS', order: 2, content: 'Chorus with visual richness\nAnd multi-line lyrics here.' }
        ]
      }
    },
    include: {
      units: true
    }
  });

  const defaultArrangement = arrangement;

  // Seed service with multiple units
  const service = await prisma.service.create({
    data: {
      title: 'Visual Baseline Service',
      slug: 'visual-baseline-service',
      date: new Date('2026-05-01T09:00:00Z'),
      worshipLeader: 'Baseline Leader',
      units: {
        create: [
          {
            order: 1,
            type: 'SONG',
            arrangement: {
              create: {
                songId: song.id,
                name: 'Arrangement 1',
                key: 'G',
                isServiceArrangement: true,
              }
            }
          },
          {
            order: 2,
            type: 'SONG',
            arrangement: {
              create: {
                songId: song.id,
                name: 'Arrangement 2',
                key: 'G',
                isServiceArrangement: true,
              }
            }
          },
          {
            order: 3,
            type: 'SONG',
            arrangement: {
              create: {
                songId: song.id,
                name: 'Arrangement 3',
                key: 'G',
                isServiceArrangement: true,
              }
            }
          }
        ]
      }
    },
    include: {
      units: {
        include: {
          arrangement: true
        }
      }
    }
  });

  return {
    songId: song.id,
    songSlug: song.slug,
    arrangementId: defaultArrangement?.id,
    serviceId: service.id,
    serviceSlug: service.slug
  };
}

export { prisma };
