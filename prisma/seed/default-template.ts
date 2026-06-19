import prisma from "../client";

const TEMPLATE_NAME = "Culto Dominical";

const TEMPLATE_ITEMS = {
  defaultStartTime: "10:25",
  sections: [
  {
    type: "PRE_CULTO",
    label: "Pré-culto",
    order: 1,
    units: [],
  },
  {
    type: "CULTO",
    label: "Culto",
    order: 2,
    units: [
      {
        type: "FALA",
        label: "Boas-vindas",
        order: 1,
        durationMin: 2,
        metadata: { speaker: null, description: null },
      },
      {
        type: "ORACAO",
        label: "Oração",
        order: 2,
        durationMin: 2,
        metadata: { speaker: null, description: null },
      },
      {
        type: "LEITURA",
        label: null,
        order: 3,
        durationMin: 2,
        metadata: { version: null, text: null },
      },
      {
        type: "SONG",
        label: null,
        order: 4,
        durationMin: 4,
        metadata: null,
      },
      {
        type: "SONG",
        label: null,
        order: 5,
        durationMin: 4,
        metadata: null,
      },
      {
        type: "SONG",
        label: null,
        order: 6,
        durationMin: 4,
        metadata: null,
      },
      {
        type: "AVISOS",
        label: "Avisos",
        order: 7,
        durationMin: 10,
        metadata: null,
      },
      {
        type: "SONG",
        label: null,
        order: 8,
        durationMin: 4,
        metadata: null,
      },
      {
        type: "SERMAO",
        label: "Sermão",
        order: 9,
        durationMin: 40,
        metadata: null,
      },
      {
        type: "SONG",
        label: null,
        order: 10,
        durationMin: 4,
        metadata: null,
      },
    ],
  },
  {
    type: "POS_CULTO",
    label: "Pós-culto",
    order: 3,
    units: [
      {
        type: "ORACAO",
        label: "Oração final",
        order: 1,
        durationMin: 5,
        metadata: { speaker: null, description: null },
      },
    ],
  },
  ],
};

async function seedDefaultTemplate() {
  const existing = await prisma.serviceTemplate.findFirst({
    where: { name: TEMPLATE_NAME },
  });

  if (existing) {
    await prisma.serviceTemplate.update({
      where: { id: existing.id },
      data: { items: TEMPLATE_ITEMS as object },
    });
    console.log(`Template "${TEMPLATE_NAME}" atualizado (id=${existing.id}).`);
    return;
  }

  const template = await prisma.serviceTemplate.create({
    data: {
      name: TEMPLATE_NAME,
      items: TEMPLATE_ITEMS as object,
    },
  });

  const totalUnits = TEMPLATE_ITEMS.sections.reduce((sum, s) => sum + s.units.length, 0);
  const totalMin = TEMPLATE_ITEMS.sections.reduce(
    (sum, s) => sum + s.units.reduce((u, unit) => u + (unit.durationMin ?? 0), 0),
    0
  );

  console.log(`Template "${template.name}" criado (id=${template.id})`);
  console.log(`  ${TEMPLATE_ITEMS.sections.length} seções, ${totalUnits} unidades, ~${totalMin} min`);
}

seedDefaultTemplate().then(() => prisma.$disconnect());
