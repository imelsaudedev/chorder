# Estudo de hierarquia visual: topo, título, subtítulos e elementos

> **Estudo histórico (10/11/2026).** A referência atual do design system é `docs/design-system.md`, que registra o que foi implementado depois deste estudo (listas, filtros, linha do tempo, ritmo vertical final) e o plano do modo escuro.

Levantamento feito a partir do código (classes Tailwind; 1 unidade = 4px). Não houve medição no
navegador: o dev server estava com erro de build (cache do Turbopack das trocas de fonte). Os valores
abaixo vêm das classes e dos padrões do Tailwind v4, então conferir visualmente antes de migrar.

## 1. Como as telas estão hoje

### 1.1 Telas de lista (Músicas, Liturgias, Catálogo, Estatísticas, Modelos)

Este é o único padrão que já está repetido de forma consistente, copiado em 5 páginas:

| Parte | Valor |
|---|---|
| Faixa do título | `px-5 sm:px-8 lg:px-14` (20 / 32 / 56) |
| Espaço acima do título | `pt-6 sm:pt-8` (24 / 32) |
| Título (h1, `heading-xl`) | `text-3xl sm:text-4xl lg:text-5xl` (30 / 36 / 48) |
| Espaço do título até o conteúdo | `pb-4 sm:pb-6 lg:pb-8` (16 / 24 / 32) |
| Conteúdo (`Main`) | `px-5 sm:px-8 lg:px-14`, `mb-12` |

Ressalva: o bloco está **copiado**, não é um componente. Cada página repete as mesmas classes à mão.

### 1.2 Telas de detalhe (música, liturgia): `PageHeader`

| Parte | Valor |
|---|---|
| Faixa | `px-4 sm:px-5 lg:px-8 py-4 sm:py-5`, fundo `zinc-50`, borda embaixo |
| Linha de voltar/ações | `mb-1.5 sm:mb-2` (6 / 8) |
| Título → subtítulo | `gap-1` (4) |
| Subtítulo | `text-base sm:text-lg` (16 / 18), bem maior que o `caption` (14) |
| Ações de conteúdo | `mt-2` (8) |
| Conteúdo (`Main`) | `px-4 sm:px-5 lg:px-8`, `pt-2` |

### 1.3 Home de Músicas e capa de categoria

- Título "Músicas": faixa de lista (1.1).
- Cada seção da home: `mt-6 mb-8` (24 em cima, 32 embaixo), h2 `text-xl` (20), descrição `mt-0.5`, filhos `mt-3`.
- O h2 "Todas as músicas" é outro: `mt-5 mb-3` (20 / 12). Duas seções irmãs, ritmo diferente.
- Capa de categoria (`CoverHero`): sem faixa de título; altura `164 / 180 / 208`, título `30 / 36 / 44` com `-0.05em`, `mb-6`. O botão "Músicas" fica a `top-4`.

### 1.4 Admin e formulários

- `admin/tags` e `admin/holyrics`: não usam `Heading` nem a faixa de lista. Usam `<h1 text-2xl font-display>` dentro de `max-w-2xl|3xl mx-auto py-8 px-4`. O `Main` já tem `px-5/8/14`, então há padding duplicado. O espaço do h1 é `mb-6` em uma e `mb-2` na outra.
- Formulário de música (`ArrangementForm`): título como `heading-lg` (20/24/30, `leading-none`) numa faixa `bg-zinc-200/60`, `px-4 sm:px-6 lg:px-8 py-4 sm:py-5`.
- Feedback: h1 centralizado, `gap-6`, `px-4 sm:px-12 lg:px-16`. A tela de sucesso usa `mb-4`.

## 2. Falta de padrão

### 2.1 Quatro margens laterais diferentes

| Receita | Onde | Usos |
|---|---|---|
| `20 / 32 / 56` | listas, home, capa, admin (via `Main`) | 6 |
| `16 / 20 / 32` | `PageHeader`, conteúdo de música e liturgia | 6 |
| `16 / 24 / 32` | formulários e editores | 15 |
| `16 / 48 / 64` | feedback | 2 |

Ao abrir uma música a partir da lista, o texto "pula" da margem 56 para 32 em telas grandes. Pode ser
intencional (cifra precisa de largura), mas não está documentado, e a terceira receita, 24 no meio, não
corresponde a nenhuma das duas.

### 2.2 Espaço entre título e conteúdo

Lista: 16/24/32. Detalhe: cabeçalho com `py` 16/20 mais `pt-2` no conteúdo. Home: 24+32 entre seções
e 20+12 na seção final. Admin: 24 ou 8. Capa: 24. Não há um valor único para "do título ao primeiro elemento".

### 2.3 Escala tipográfica

Contagem de tamanhos no código (sem testes e stories):

`text-xs` 194, `text-sm` 154, `text-base` 18, `text-lg` 15, `text-xl` 9, `text-2xl` 5, `text-3xl` 4, `text-4xl` 3, `text-5xl` 1,
mais tamanhos arbitrários: `text-[11px]` 17, `text-[10px]` 11, `text-[9px]` 1, `text-[30px]` e `text-[44px]` (capa).

- O app vive em 12 e 14px. O 16px quase não aparece (18 usos). Daí o salto de 14 para 20+ nos títulos.
- Há 29 usos de 9–11px, abaixo do que se considera legível (12px é o piso razoável).
- O h1 chega a 48px na tela grande, 3,4× o corpo de 14px. A capa de categoria usa 44px (e 30/36 antes): são dois tamanhos de "título de página" (48 na lista, 44 na capa).

### 2.4 Variantes de título de `Text` usadas fora do propósito

- `heading-lg` (20/24/30) vira título de formulário, título de liturgia e cabeçalho sticky (com `size="base"`).
- `heading-sm` vira título de linha (`SongRow`, `SongListEntry`) e até número grande (`StatsView`, `text-3xl font-bold`).
- `heading-md` (h3) quase não é usado.
- Letter-spacing: `heading-xl/lg` `-0.05em`, `md/sm` `-0.025em`, capa `-0.05em` direto. Com a Space Grotesk é intencional, mas a capa e a home repetem o valor à mão.

### 2.5 Rótulos de seção: cinco estilos para a mesma função

| Onde | Estilo |
|---|---|
| Home | display `text-xl`, normal |
| `ServiceView` e `ServiceLiturgyView` | `text-xs` caixa alta `tracking-widest`, cinza |
| Estatísticas | `heading-sm` (base), `mb-4` |
| Admin tags ("Novo grupo") | `text-sm` caixa alta `tracking-wide`, cinza |
| `OrgHeader` | `text-lg sm:text-xl` |

O `overline` do design system é `tracking-wider`: ninguém usa exatamente ele nas telas acima.

### 2.6 Pontos a verificar

- `ContentWrapper` dá `sm:ml-20` só a páginas de lista e `lg:ml-20` às demais; a barra lateral aparece a partir de `sm`. Entre 640 e 1023px, telas de detalhe/admin podem ficar sob a barra. Não confirmei no navegador.
- `Main` tem `mb-12` fixo e várias páginas somam `pb-4/5/8` por cima.

## 3. Proposta

### 3.1 Princípios

1. Uma base de 4px e poucos degraus de espaço: **4, 8, 12, 16, 24, 32, 48**. Nada de 6, 20, 10 avulsos.
2. Dois níveis de margem lateral, nomeados pelo uso, e não quatro.
3. Cada papel tipográfico tem um tamanho, um espaçamento acima e um abaixo.
4. A hierarquia vem de tamanho + peso + cor, não de caixa alta em todo lugar.

### 3.2 Margens laterais (dois níveis)

| Nome | Valores (mobile / sm / lg) | Quando |
|---|---|---|
| `page` | 20 / 32 / 56 | listas, home, capa, admin, feedback |
| `workspace` | 16 / 24 / 32 | música, liturgia, formulários e editores |

Mudanças: unificar as duas receitas que terminam em 32 (16/20/32 e 16/24/32) em `workspace` (16/24/32) e levar feedback para `page`.
A diferença `page` → `workspace` fica explícita e justificada (a cifra precisa de largura).

### 3.3 Escala tipográfica

Razão de ~1,25 entre degraus, piso de 12px:

| Papel | Mobile / sm / lg | Peso | Entrelinha |
|---|---|---|---|
| Título de página (h1) | 28 / 32 / 40 | 600 display | 1,15 |
| Título de seção (h2) | 20 / 22 / 24 | 600 display | 1,2 |
| Subtítulo (h3) | 16 / 17 / 18 | 600 display | 1,3 |
| Título de item (linha/card) | 16 | 600 display | 1,3 |
| Corpo de leitura | 16 | 400 | 1,5 |
| Corpo de interface | 14 | 400/500 | 1,4 |
| Metadado / legenda | 12 | 400 | 1,4 |
| Rótulo de grupo (overline) | 12 | 600, caixa alta | 1,3, `0.05em` |

- O h1 cai de 48 para 40 (razão com o corpo de 16: 2,5 em vez de 3,4) e a capa usa o mesmo tamanho: um só "título de página".
- O subtítulo sai de 16/18 para **14 / 16** (ver 3.4), para ficar abaixo do título e acima da legenda.
- Eliminar 9–11px: usar 12 como mínimo, ou 11 apenas em selos de 1 palavra, documentado.
- `heading-sm` deixa de ser usado para números e linhas: criar `item-title`, `stat-value` e usar `Text` com papéis, não `heading-*` por conveniência.

### 3.4 Ritmo vertical

Cabeçalho de página (`PageTitleBlock`, componente único para as telas de lista e admin):

```
topo da tela
  ↓ 24 / 32          (pt)
título (h1)
  ↓ 4  / 8           (h1 → subtítulo)
subtítulo (14 / 16, cinza)  [opcional]
  ↓ 16 / 24          (cabeçalho → primeiro elemento)
conteúdo
```

Seções dentro de uma página (`Section`, componente único):

```
conteúdo anterior
  ↓ 32               (entre seções, sempre mt-8)
título de seção (h2, 20–24)
  ↓ 4                (h2 → descrição) [opcional]
descrição (14, cinza)
  ↓ 12               (título/descrição → elementos)
elementos
```

- Elimina as diferenças da home: as duas seções passam a ter o mesmo ritmo (hoje 24/32 e 20/12).
- Rótulo de grupo (overline): 12px, `0.05em`, sempre o mesmo, no lugar de `widest` e `wide`.
- Rodapé: `Main` perde o `mb-12` fixo e a página define seu `pb` (48) uma única vez.

Cabeçalho de detalhe (`PageHeader` default): manter a faixa `zinc-50` com borda, mas com `workspace` nas laterais, `py` 16/24, linha de voltar `mb-2` (8, em vez de 6/8) e subtítulo em 14/16.

Capa de categoria: manter a altura (164/180/208), título do mesmo tamanho do h1, `mb-6` → `mb-6` (24, igual ao "cabeçalho → primeiro elemento").

### 3.5 Admin e formulários

- `admin/tags`, `admin/holyrics`, feedback: passam a usar o mesmo `PageTitleBlock` e `Main`. O `max-w-2xl|3xl` vai para dentro de `Main`, sem `px-4` duplicado.
- Formulário de música: título em h2 (20/22/24) dentro da faixa, laterais `workspace`.

## 4. Como implementar (ordem sugerida)

1. **Tokens**: em `globals.css`, variáveis para `--page-x`, `--workspace-x`, `--space-section` etc. e atualizar `Text` com os papéis novos (tamanhos de 3.3).
2. **Componentes**: `PageTitleBlock` e `Section`; migrar as 5 listas, a home e a capa. Atualizar `app/design-system/page.tsx` (seção Tipografia e Espaçamento) e `CLAUDE.md`.
3. **Detalhe e admin**: `PageHeader` default e `admin/tags|holyrics`.
4. **Formulários e rótulos de seção**: unificar os 15 usos de `px-4 sm:px-6 lg:px-8` e os cinco estilos de rótulo.
5. **Legibilidade**: trocar 9–11px por 12.
6. Verificação visual em 390 / 768 / 1280 antes de cada PR e checar o item 2.6.

Cada passo vira um PR pequeno para o mesmo padrão não mudar a tela inteira de uma vez.

## 5. Decisões tomadas

1. h1 de 48 para 40 no desktop: **sim**.
2. Margem lateral: **um só nível, mais espaçado** (`--page-x` = 20 / 32 / 48). Substitui `page` e `workspace`.
3. Corpo de interface: **mantido em 14**.
4. Escala: **1,25** entre degraus.
5. Densidade das cifras (compact/normal): só muda a entrelinha das linhas de cifra (`ChordProLine/Item`).
   Ela nunca alterou a margem de `Main` na prática (o `className` das telas de detalhe sobrescrevia),
   então a margem única não muda esse comportamento.

## 6. Implementado (PR 1: tokens, escala e componentes)

- `globals.css`: `--page-x`, `--space-title-top/bottom`, `--space-section` e as utilidades `px-page`, `-mx-page`, `scroll-px-page`.
- `Text`: h1 28/32/40, h2 20/22/24, h3 16/17/18.
- `PageTitleBlock` (listas e admin) e `Section` (home), em `components/common/`.
- `Main` e `PageHeader` usam `px-page`; `CoverHero` e as prateleiras da home usam `-mx-page`/`px-page`.
- Posição do h1 (desktop): fixa em 64px do topo em todas as telas, com ou sem "voltar". A linha de cima (voltar/ações) tem 36px reservados (20 + 36 + 8). No mobile, telas sem voltar/ações sobem o título (24px); com voltar ficam em 58px.
- Fora deste PR: `admin/tags`, `admin/holyrics`, feedback, formulários (`px-4 sm:px-6 lg:px-8`), rótulos de seção em caixa alta e fontes de 9–11px.
