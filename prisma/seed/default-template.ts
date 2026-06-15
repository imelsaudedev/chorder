import prisma from "../client";

const TEMPLATE_NAME = "Culto Dominical";

const TEMPLATE_ITEMS = {
  defaultStartTime: "10:15",
  sections: [
  {
    type: "PRE_CULTO",
    label: "Pré-culto",
    order: 1,
    units: [
      {
        type: "PRELUDIO",
        label: "Prelúdio",
        order: 1,
        durationMin: 15,
        metadata: null,
      },
    ],
  },
  {
    type: "LOUVOR",
    label: "Louvor",
    order: 2,
    units: [
      {
        type: "FALA",
        label: "Boas-vindas",
        order: 1,
        durationMin: 3,
        metadata: { speaker: null },
      },
      {
        type: "SONG",
        label: null,
        order: 2,
        durationMin: 5,
        metadata: null,
      },
      {
        type: "SONG",
        label: null,
        order: 3,
        durationMin: 5,
        metadata: null,
      },
      {
        type: "LEITURA",
        label: null,
        order: 4,
        durationMin: 2,
        metadata: { version: "NTLH", responsive: false },
      },
      {
        type: "SONG",
        label: null,
        order: 5,
        durationMin: 5,
        metadata: null,
      },
      {
        type: "ORACAO",
        label: null,
        order: 6,
        durationMin: 3,
        metadata: { subtype: "silenciosa" },
      },
    ],
  },
  {
    type: "AVISOS",
    label: "Avisos",
    order: 3,
    units: [
      {
        type: "AVISOS",
        label: "Avisos",
        order: 1,
        durationMin: 8,
        metadata: { items: [] },
      },
    ],
  },
  {
    type: "ORACAO_COMUNITARIA",
    label: "Oração Comunitária",
    order: 4,
    units: [
      {
        type: "ORACAO",
        label: "Oração pela congregação",
        order: 1,
        durationMin: 5,
        metadata: { subtype: "comunitaria", person: null },
      },
    ],
  },
  {
    type: "MENSAGEM",
    label: "Mensagem",
    order: 5,
    units: [
      {
        type: "SONG",
        label: "Música de entrada",
        order: 1,
        durationMin: 4,
        metadata: null,
      },
      {
        type: "SERMAO",
        label: "Sermão",
        order: 2,
        durationMin: 35,
        metadata: null,
      },
      {
        type: "SONG",
        label: "Música de resposta",
        order: 3,
        durationMin: 4,
        metadata: null,
      },
    ],
  },
  {
    type: "ENCERRAMENTO",
    label: "Encerramento",
    order: 6,
    units: [
      {
        type: "ORACAO",
        label: "Oração final",
        order: 1,
        durationMin: 3,
        metadata: { subtype: "coletiva" },
      },
      {
        type: "ENCERRAMENTO",
        label: "Encerramento técnico",
        order: 2,
        durationMin: 2,
        metadata: null,
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
