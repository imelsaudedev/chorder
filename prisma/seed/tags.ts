import prisma from "../client";

const TAG_GROUPS = [
  {
    name: "Tipo",
    color: "#7c3aed",
    tags: ["Congregacional", "Infantil", "Hino"],
  },
  {
    name: "Tema",
    color: "#0891b2",
    tags: ["Adoração", "Louvor", "Arrependimento", "Esperança", "Santidade", "Gratidão", "Salvação"],
  },
  {
    name: "Ocasião",
    color: "#059669",
    tags: ["Abertura", "Encerramento", "Comunhão", "Batismo", "Oferta", "Oração", "Natal", "Páscoa"],
  },
  {
    name: "Andamento",
    color: "#d97706",
    tags: ["Lento", "Médio", "Animado"],
  },
];

async function seedTags() {
  console.log("Seeding tag groups and tags...");

  for (const group of TAG_GROUPS) {
    const created = await prisma.tagGroup.upsert({
      where: { name: group.name },
      update: { color: group.color },
      create: {
        name: group.name,
        color: group.color,
        tags: {
          create: group.tags.map((name) => ({ name })),
        },
      },
    });

    // Upsert individual tags in case the group already existed
    for (const tagName of group.tags) {
      await prisma.tag.upsert({
        where: { name_tagGroupId: { name: tagName, tagGroupId: created.id } },
        update: {},
        create: { name: tagName, tagGroupId: created.id },
      });
    }

    console.log(`  ✓ ${group.name}: ${group.tags.join(", ")}`);
  }

  // Associate a few songs with tags for testing
  const adoracaoTag = await prisma.tag.findFirst({
    where: { name: "Adoração" },
  });
  const louvorTag = await prisma.tag.findFirst({ where: { name: "Louvor" } });
  const congregacionalTag = await prisma.tag.findFirst({
    where: { name: "Congregacional" },
  });
  const aberturaTag = await prisma.tag.findFirst({
    where: { name: "Abertura" },
  });

  const sampleSongs = await prisma.song.findMany({
    where: { isDeleted: false },
    take: 5,
    orderBy: { id: "asc" },
  });

  if (sampleSongs.length > 0 && adoracaoTag && louvorTag && congregacionalTag && aberturaTag) {
    const tagAssignments = [
      { song: sampleSongs[0], tags: [adoracaoTag, congregacionalTag] },
      { song: sampleSongs[1], tags: [louvorTag, congregacionalTag] },
      { song: sampleSongs[2], tags: [adoracaoTag, aberturaTag] },
    ];

    for (const { song, tags } of tagAssignments) {
      await prisma.song.update({
        where: { id: song.id },
        data: { tags: { connect: tags.map((t) => ({ id: t.id })) } },
      });
      console.log(`  ✓ "${song.title}" → ${tags.map((t) => t.name).join(", ")}`);
    }
  }

  const totalGroups = await prisma.tagGroup.count();
  const totalTags = await prisma.tag.count();
  console.log(`\nTotal: ${totalGroups} grupos, ${totalTags} tags`);
}

seedTags().then(() => prisma.$disconnect());
