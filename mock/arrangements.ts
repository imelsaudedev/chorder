export default [
  {
    id: 1,
    songId: 1,
    key: "G",
    name: null,
    isDefault: false,
    isDeleted: false,
    isServiceArrangement: false,
    song: {
      id: 1,
      title: "A alegria está no coração",
      slug: "a-alegria-esta-no-coracao",
      artist: "Vavá Rodrigues",
      lyrics:
        "A alegria está no coração\nDe quem já conhece a Jesus\nA verdadeira paz só tem aquele\nQue já conhece a Jesus\n\n\nO sentimento mais precioso\nQue vem do nosso Senhor\nÉ o amor   que só tem\nQuem já conhece a , Jesus\n\n\nAleluia!\nAleluia!\nAleluia!\nAleluia!\n\n\nO sentimento mais precioso\nQue vem do nosso Senhor\nÉ o amor   que só tem\nQuem já conhece a , Jesus\n\n\n Ah... Ah... Ah... Ah... Ah...!",
      isDeleted: false,
    },
    units: [
      {
        type: "INTRO" as const,
        content: "[||:] [G] [C] [D7] [:||]",
        order: 0,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]A alegria está no coração\nDe q[C]uem já conhece a Jes[G]us\n[G]A verdadeira [Em]paz só tem aquele\nQue [A7]já conhece a Jes[D]us",
        order: 1,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 2,
      },
      {
        type: "CHORUS" as const,
        content:
          "Ale[G]luia!\nAle[C]lui[G]a!\nAle[G]lui[Em]a!\nAle[A7]lui[D7]a!",
        order: 3,
      },
      {
        type: "INTERLUDE" as const,
        content: "[D7] Ah... Ah... Ah... Ah... Ah...!",
        order: 4,
      },
    ],
  },
  {
    id: 2,
    songId: 1,
    key: "G",
    name: "Arranjo Original",
    isDefault: true,
    isDeleted: false,
    isServiceArrangement: false,
    song: {
      id: 1,
      title: "A alegria está no coração",
      slug: "a-alegria-esta-no-coracao",
      artist: "Vavá Rodrigues",
      lyrics:
        "A alegria está no coração\nDe quem já conhece a Jesus\nA verdadeira paz só tem aquele\nQue já conhece a Jesus\n\n\nO sentimento mais precioso\nQue vem do nosso Senhor\nÉ o amor   que só tem\nQuem já conhece a , Jesus\n\n\nAleluia!\nAleluia!\nAleluia!\nAleluia!\n\n\nO sentimento mais precioso\nQue vem do nosso Senhor\nÉ o amor   que só tem\nQuem já conhece a , Jesus\n\n\n Ah... Ah... Ah... Ah... Ah...!",
      isDeleted: false,
    },
    units: [
      {
        type: "INTRO" as const,
        content: "[||:] [G] [C] [D7] [:||]",
        order: 0,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]A alegria está no coração\nDe q[C]uem já conhece a Jes[G]us\n[G]A verdadeira [Em]paz só tem aquele\nQue [A7]já conhece a Jes[D]us",
        order: 1,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 2,
      },
      {
        type: "CHORUS" as const,
        content:
          "Ale[G]luia!\nAle[C]lui[G]a!\nAle[G]lui[Em]a!\nAle[A7]lui[D7]a!",
        order: 3,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 4,
      },
      {
        type: "INTERLUDE" as const,
        content: "[D7] Ah... Ah... Ah... Ah... Ah...!",
        order: 5,
      },
    ],
  },
];
