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
        order: 1,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]A alegria está no coração\nDe q[C]uem já conhece a Jes[G]us\n[G]A verdadeira [Em]paz só tem aquele\nQue [A7]já conhece a Jes[D]us",
        order: 2,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 3,
      },
      {
        type: "CHORUS" as const,
        content:
          "Ale[G]luia!\nAle[C]lui[G]a!\nAle[G]lui[Em]a!\nAle[A7]lui[D7]a!",
        order: 4,
      },
      {
        type: "INTERLUDE" as const,
        content: "[D7] Ah... Ah... Ah... Ah... Ah...!",
        order: 5,
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
        order: 1,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]A alegria está no coração\nDe q[C]uem já conhece a Jes[G]us\n[G]A verdadeira [Em]paz só tem aquele\nQue [A7]já conhece a Jes[D]us",
        order: 2,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 3,
      },
      {
        type: "CHORUS" as const,
        content:
          "Ale[G]luia!\nAle[C]lui[G]a!\nAle[G]lui[Em]a!\nAle[A7]lui[D7]a!",
        order: 4,
      },
      {
        type: "VERSE" as const,
        content:
          "[G]O sentimento mais p[G7]recioso\nQue v[C]em do nosso Senh[A]or\nÉ o am[G]or [Em]  que só [Am]tem\nQuem já conh[D]ece a  Jes[G]us",
        order: 5,
      },
      {
        type: "INTERLUDE" as const,
        content: "[D7] Ah... Ah... Ah... Ah... Ah...!",
        order: 6,
      },
    ],
  },
  {
    id: 3,
    songId: 2,
    name: "Arranjo Original",
    isDefault: true,
    isDeleted: false,
    isServiceArrangement: false,
    key: "A",
    units: [
      {
        type: "BLOCK" as const,
        content:
          "[Tom no momento: A]                 \r\n[A]Aquele que es[D/A]tá fe[E/A]liz [D/A]diga: a[A]mém! [D/A][E/A] [D/A]\r\n[A]Aquele que es[D/A]tá fe[E/A]liz [D/A]grite: ale[A]luia! [D/A][E/A] [D/A]\r\n[A]Aquele que es[D/A]tá fe[E/A]liz [D/A]bata [A]palmas [D/A][E/A] [D/A]\r\n[A]Aquele que es[D/A]tá fe[E/A]liz [D/A]dance co[A]migo assim",
        order: 1,
      },
      {
        type: "BLOCK" as const,
        content:
          "[F#m]Com Jesus no coração a gente [C#m]é feliz                        \r\n[D]Com Jesus na condu[Bm]ção tudo é muito [D/E]bom!",
        order: 2,
      },
      {
        type: "BLOCK" as const,
        content:
          "Jesus é [A]alegria, [F#m]euforia                \r\n[D]Companhia [Bm]todo dia![E]",
        order: 3,
      },
      {
        type: "BLOCK" as const,
        content: "Jesus é o motivo da nossa ale[A]gria!",
        order: 4,
      },
    ],
    song: {
      id: 2,
      title: "O Motivo Da Nossa Alegria",
      slug: "o-motivo-da-nossa-alegria",
      artist: "Marcus Vinicius de Souza Oliveira",
      lyrics:
        "Aquele que está feliz diga: amém!  \nAquele que está feliz grite: aleluia!  \nAquele que está feliz bata palmas  \nAquele que está feliz dance comigo assim\n\nCom Jesus no coração a gente é feliz , , , , , , , , , , , , , , , , , , , , , , , \nCom Jesus na condução tudo é muito bom!\n\nJesus é alegria, euforia                \nCompanhia todo dia!\n\nJesus é o motivo da nossa alegria!",
      isDeleted: false,
    },
  },
];
