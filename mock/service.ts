export default {
  id: 123,
  title: "Culto Matutino",
  slug: "2023-9-8",
  worshipLeader: "Hugo",
  date: new Date("2023-09-08T10:00:00.000Z"),
  isDeleted: false,
  units: [
    {
      type: "SONG" as const,
      songSlug: "gloria-e-forca",
      semitoneTranspose: 0,
      order: 1,
      arrangementId: 14,
      arrangement: {
        id: 14,
        songId: 53,
        key: "D",
        name: null,
        isDefault: false,
        isDeleted: false,
        isServiceArrangement: true,
        song: {
          id: 53,
          title: "Glória e Força",
          slug: "gloria-e-forca",
          artist: "Vencedores por Cristo",
          lyrics:
            "Cristo é Senhor\nVamos sim, declarar\nTodos a uma voz.\nÉ sua vida\nO motivo maior\nDo nosso louvor.\n\n\nCristo deu sua vida por nós\nDe todo mal veio nos libertar\nSofreu nossa dor pra nos dar sua paz\nLouvado seja o Senhor! \nLouvado seja o Senhor! \n\n\nBendiremos sempre ao Senhor\nViveremos pra seu louvor \nGlória e força a ti Senhor\nToda honra, todo louvor\nGlória e força a ti Senhor\nToda honra, todo louvor",
          isDeleted: false,
        },
        units: [
          {
            type: "INTRO" as const,
            content: "[D]  [Bb]  [Am]  [Gm]  [Am]  [G/B]",
            order: 1,
          },
          {
            type: "VERSE" as const,
            content:
              "[D]Cristo é Senhor\nVamos [G/D]sim, declarar\n[Em]Todos a uma [D]voz.\n[D]É sua vida\nO mo[G/B]tivo maior\n[Em7]Do nosso lou[D]vor.",
            order: 2,
          },
          {
            type: "VERSE" as const,
            content:
              "[F]Cristo deu sua [Bb/F]vida por nós\n[C/F]De todo mal veio [Bb/F]nos liber[F]tar\nSo[Bb]freu nossa dor pra nos [C]dar sua paz\n[Bb]Louvado [Am7]seja o Sen[Dm]hor! [C/E]\nLou[F]vado [G]seja o Sen[A4]hor! [A]",
            order: 3,
          },
          {
            type: "CHORUS" as const,
            content:
              "Bendi[D]remos [G/D]sempre ao Sen[D]hor\nViveremos [G/D]pra seu lou[D]vor [D/F#]\nGlória e [G]for[D/F#]ça [Em]a ti Sen[D]hor\nToda [G]hon[D/F#]ra, [Em]todo lou[A]vor\nGlória e [G]for[D/F#]ça [Em]a ti Sen[D]hor\nToda [G]hon[D/F#]ra, [Em]todo lou[D]vor",
            order: 4,
          },
          {
            type: "ENDING" as const,
            content: "[Bb7+]  [Am7]  [G]  [Em7]  [D]",
            order: 5,
          },
        ],
      },
    },
    {
      type: "SONG" as const,
      songSlug: "gloria-e-forca",
      semitoneTranspose: 3,
      order: 2,
      arrangementId: 2,
      arrangement: {
        id: 2,
        songId: 108,
        key: "E",
        name: "Arranjo Original",
        isDefault: false,
        isDeleted: false,
        isServiceArrangement: true,
        song: {
          id: 108,
          title: "A Glória Pertence ao Senhor",
          slug: "a-gloria-pertence-ao-senhor",
          artist: null,
          lyrics:
            "A glória pertence ao Senhor\nQue é digno de todo o louvor\nCantar a canção de adoração\nÉ o que nós devemos fazer.\n\n\nPois tem em Suas mãos o poder\nA força, a honra, o querer\nLouvemos então, com o coração\nLouvar é a nossa expressão.\n\n\nPois reina em toda a terra\nE traz sobre nós Sua paz\nO Espírito Santo derrama unção\nPra sermos de fato cristãos.\n\n\nA Glória pertence a Cristo\nQue é digno de todo o louvor\nQue cresça em nós o Seu grande amor\nLouvemos ao nosso Senhor.",
          isDeleted: false,
        },
        units: [
          {
            type: "INTRO" as const,
            content: "[E]   [F#m]   [E/G#]   [A]",
            order: 1,
          },
          {
            type: "VERSE" as const,
            content:
              "A [E]glória pertence ao Se[A/E]nhor\nQue é [E]digno de todo o louv[A/E]or\nCan[A]tar a can[B/A]ção de [G#7]adora[C#m]ção\nÉ o [F#m]que nós de[B7]vemos fa[E]zer[A/E].",
            order: 2,
          },
          {
            type: "VERSE" as const,
            content:
              "Pois [E]tem em Suas mãos o [A/E]poder\nA [E]força, a honra, o que[A/E]rer\nLou[A]vemos en[B/A]tão, com [G#7]o cora[C#m]ção\nLou[F#m]var é a [B7]nossa expres[E]são.",
            order: 3,
          },
          {
            type: "CHORUS" as const,
            content:
              "Pois [B]reina em [B/D#]toda a [E]terra\nE [B]traz sobre [Cº]nós Sua [C#m]paz\nO Es[A]pírito [B/A]Santo der[G#7]rama un[C#m]ção\nPra [F#m]sermos de [B]fato cris[E]tãos.",
            order: 4,
          },
          {
            type: "CHORUS" as const,
            content:
              "A [B]Glória per[B/D#]tence a [A/E]Cris[E]to\nQue é [B]digno de [Cº]todo o lou[C#m]vor\nQue c[A]resça em [B/A]nós o [G#7]Seu grande a[C#m]mor\nLou[F#m]vemos ao [B]nosso Sen[E]hor.",
            order: 5,
          },
        ],
      },
    },
  ],
};
