import { PrismaClient } from "@prisma/client";
import baseSongs from "C:/Repositorios/chorder/prisma/seed/songs.json";

const prisma = new PrismaClient();

const SELECTED_TITLES = [
  "AQUELE QUE ME AMA",
  "Paz e Comunhão",
  "JUNTOS",
  "Convite à liberdade",
  "Algo Mais",
  "Em Cristo só",
  "Quem além de Ti",
  "MARCHAREMOS",
  "Venha provar e ver",
  "Cantarei teu amor pra sempre",
  "Buscai primeiro",
  "Teus Altares (Sl.84:1-4,10,11)",
  "É o teu povo",
  "No poder do teu amor",
  "FRUTOS DE VIDA",
  "ACLAME AO SENHOR",
  "Muitos virão te louvar",
  "Unidade e Diversidade",
  "Ele é exaltado",
  "Vinho e pão",
  "Vim para adorar-te",
  "Tu és soberano",
  "TE AGRADEÇO",
  "SEJA ENGRANDECIDO",
  "RENOVA-ME",
  "Reina em mim",
  "Rei das nações",
  "Quão Grande É O Meu Deus",
  "Louvemos ao Senhor",
  "ENTREGA",
  "Amigo de Deus",
  "Alto preço",
  "Ajuntamento",
  "SONDA-ME USA-ME",
  "NÃO TENHAS SOBRE TI",
  "Jesus Em Tua Presença",
  "Preciso de Ti",
  "Cantai ao Senhor (Salmo 96)",
  "Olhos Fixos",
  "LÁ ESTÁ O MEU TESOURO",
  "TODOS QUE TEM SEDE",
  "Venha Sobre Nós",
  "Oração",
  "Grande",
  "Grande (V2)",
];

async function main() {
  const selected = baseSongs.filter((s) => SELECTED_TITLES.includes(s.title));
  console.log(`Importando ${selected.length} músicas...`);

  for (const song of selected) {
    const existing = await prisma.song.findFirst({
      where: { OR: [{ slug: song.slug }, { legacyId: song.legacyId }] },
    });
    if (existing) {
      console.log(`  já existe: ${song.title}`);
      continue;
    }
    await prisma.song.create({
      data: {
        legacyId: song.legacyId,
        title: song.title,
        slug: song.slug,
        artist: song.artist,
        lyrics: song.lyrics,
        isDeleted: song.isDeleted,
        arrangements: {
          create: song.arrangements.map((arr: any) => ({
            key: arr.key,
            isDefault: arr.isDefault,
            isDeleted: arr.isDeleted,
            isServiceArrangement: false,
            units: {
              create: arr.units.map((unit: any) => ({
                content: unit.content,
                type: unit.type,
                order: unit.internalId,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✓ ${song.title}`);
  }
  console.log("Concluído!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
