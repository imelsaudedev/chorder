# Design system do chorder-alt

Documento vivo: descreve o que **está no código hoje** e o que está **planejado** (marcado como tal).
A demonstração visual fica em `/design-system` (`app/design-system/page.tsx`). O estudo que originou a escala
e o ritmo vertical está em `docs/estudo-hierarquia-visual.md` (histórico; este documento o substitui como referência).

Atualizado após o #97 (13/11/2026). Ao mudar um token ou um padrão, atualize aqui e na página `/design-system`.

## 1. Identidade

- **Cor da marca:** azul, no token `--secondary` (`hsl(221 83% 53%)`). É a cor de ação, de destaque e de foco (`--ring`).
  A frase antiga "emerald no lugar de azul" não vale mais; o verde-esmeralda sobrou só em alguns ícones e estados (ver 8).
- **Destaque secundário:** laranja, em `--accent` (`hsl(23 100% 60%)`), uso raro.
- **Neutros:** `--foreground` (texto), `--muted-foreground` (texto de apoio), `--border`. Textos de título usam `--primary`
  (quase preto), não `--foreground`.
- **Fontes** (`app/fonts.ts`, via `next/font/google`):

| Papel | Fonte | Classe | Pesos carregados |
|---|---|---|---|
| Corpo e interface | IBM Plex Sans | `font-sans` | 400, 500, 600, 700 |
| Títulos e números de destaque | Space Grotesk | `font-display` | **só 600** |
| Texto editorial | IBM Plex Serif | `font-serif` | 400–700 |
| Código e valores técnicos | IBM Plex Mono | `font-mono` | 400–700 |

  Como a Space Grotesk só carrega o peso 600, `font-display` **sempre sai em semibold**; para um título leve use
  `font-sans`. Se for preciso outro peso do display, adicione em `app/fonts.ts` (afeta o app todo).

## 2. Tokens de cor (código atual)

Definidos em `app/globals.css` (`:root`) e expostos ao Tailwind em `@theme inline`.

| Token | Claro (hoje) | Uso |
|---|---|---|
| `--background` / `--card` / `--popover` | `hsl(0 0% 100%)` | fundos de página, cartão e menu |
| `--foreground` | `hsl(224 84% 4.9%)` | texto principal |
| `--primary` | `hsl(0 0% 9%)` | títulos, botão principal, texto forte |
| `--secondary` | `hsl(221 83% 53%)` | **azul da marca**: ações, selos, faixas, foco |
| `--accent` | `hsl(23 100% 60%)` | destaque raro (laranja) |
| `--muted` | `hsl(215 16% 72%)` | fundos e linhas neutras |
| `--muted-foreground` | `hsl(215 14% 48%)` | texto de apoio, ícones, rótulos |
| `--destructive` | `hsl(0 84.2% 60.2%)` | erro e ações destrutivas |
| `--border` / `--input` | `hsl(0 0% 89.8%)` | bordas e campos |
| `--ring` | `hsl(221 83% 53%)` | anel de foco |
| `--radius` | `0.5rem` | base; `rounded-md` = −2px, `rounded-sm` = −4px |

Variações do azul que o app já usa como "tokens por transparência": `secondary/5` (cartão das próximas liturgias),
`secondary/10` (faixa de mês, selo), `secondary/15` (divisor), `secondary/20` (halo), `secondary/40` (trilho).

## 3. Tipografia (componente `Text`)

Escala de ~1,25 entre degraus, piso de 12px. O componente é `components/common/Text`; use a **variante**, não o tamanho solto.

| Variante | Mobile / sm / lg | Peso e fonte | Para quê |
|---|---|---|---|
| `heading-xl` (h1) | 28 / 32 / 40 | display 600 | título de página |
| `heading-lg` (h2) | 20 / 22 / 24 | display 600 | título de seção |
| `heading-md` (h3) | 16 / 17 / 18 | display 600 | subtítulo |
| `heading-sm` | 16 | display 600 | título de item (linha, card), barras de edição |
| `body` | 16 | sans 400 | texto corrido |
| `label` | 14 | sans 500 | rótulo de campo, metadado |
| `caption` | 14 | sans 400, `muted-foreground` | texto secundário |
| `overline` | 12 | sans 600, caixa alta, `secondary` | categorias |

Regras: a interface vive em 14px; metadados e legendas, 12px; **evitar 9–11px** (há 35 usos de `text-[Npx]`, ver 8);
números de destaque (data nas listas) usam `font-display` no corpo do título.

## 4. Espaço e layout

Base de 4px; degraus preferidos: **4, 8, 12, 16, 24, 32, 48**.

### Tokens (`app/globals.css`)

| Token | Mobile / sm / lg | Utilitário | Uso |
|---|---|---|---|
| `--page-x` | 20 / 32 / 48 | `px-page`, `-mx-page`, `scroll-px-page` | margem lateral única das telas |
| `--space-title-bottom` | 16 / 24 | `pb-[var(--space-title-bottom)]` | do título até o primeiro elemento |
| `--space-section` | 32 | `mt-[var(--space-section)]` | entre seções |

### Ritmo vertical de uma tela de lista (Músicas e Liturgias)

```
topo
  ↓ posição fixa do h1 (64px do topo no desktop)
título (PageTitleBlock)  [ações à direita, na linha do título]
  ↓ --space-title-bottom (16 / 24)
Section ─ h2
  ↓ 16                      (Section: mt-4 nos filhos)
barra de filtros             (sticky; py-2 interno)
  ↓ 24 até a lista          (8 do py-2 + mb-4)
lista (cartão)
  ↓ 32 (--space-section) até a próxima seção
```

- Do h2 até os filtros são **16px visuais** nas duas listas (em Músicas o h2 "Todas as músicas" tem `mb-2`, que somado
  ao `py-2` da barra dá 16; em Liturgias a barra leva `-mt-2` para compensar o `mt-4` do `Section`).
- Dos filtros até a lista, **24px visuais** (`py-2` + `mb-4` da barra).

## 5. Padrões de componente

### Cabeçalho de página: `PageTitleBlock`
Título (h1) com **ações na mesma linha**, à direita. A ação principal (`Button variant="secondary"`, ex.: "Nova música",
"Nova liturgia") aparece a partir do tablet; **no celular vale o botão flutuante** (`FloatingAddLink mobileOnly`).
Ação secundária (ex.: "Modelos") é `outline`, só o ícone no celular.

### Seção: `Section`
`mt-[--space-section]`, h2 (`heading-lg`), descrição opcional (`mt-1`, caption), conteúdo com `mt-4`.

### Lista em cartão (Músicas, histórico e próximas de Liturgias)
- Cartão: `overflow-clip rounded-xl border shadow-xs`; no celular vai de ponta a ponta (`max-sm:-mx-page max-sm:rounded-none max-sm:border-x-0`).
- Cabeçalho de colunas: `bg-zinc-50`, `py-3`, `text-sm font-medium text-muted-foreground`.
- Faixa de grupo (mês, ano, dirigente): `h-8`, `text-sm font-semibold uppercase text-secondary`, fundo `zinc-50` (histórico) ou `secondary/10` (próximas).
- Linha: `py-4`, divisor `divide-y`; recuo lateral `px-4 @[560px]:px-5 @[860px]:px-6`; vão entre colunas `gap-x-4 @[560px]:gap-x-5`.
- Passo de linha de 22px; título em 16px (18 a partir de 860px de largura do container).
- Colunas por **container query** (`@container`, 560/720/860px), não por largura da tela.
- No celular, textos longos **quebram em várias linhas** (sem reticências); no largo, `truncate` por coluna.

### Linha do tempo (lista de liturgias)
- Trilho de 2px: `secondary/40` nas próximas, `zinc-300` no histórico; começa no primeiro ponto (a faixa do primeiro mês não leva trilho).
- Pontos: **culto por vir = vazado** (`border-2 border-secondary`, `size-3`); **realizado = cheio** (`zinc-400`, `size-3`);
  o próximo culto tem ponto maior (`size-4`) com halo `secondary/20`.
- O trilho só aparece ordenando por data (e sem agrupar por dirigente).

### Barra de filtros
Sticky no topo (`sticky top-0 z-30 -mx-page px-page py-2`); no celular some ao descer e volta ao subir. Seletores à esquerda
(`Button variant="soft" size="sm"`, com o valor aplicado dentro e ✕), busca e ordenação à direita (segunda linha no celular).
Código compartilhado em `components/song/SongsFilterBar` (`useStickyBar`, `stickyBarClasses`).

### Itens da liturgia (editor e leitura)
Tipos e cores em `components/service/ServicePlanEditor/unitConfig.ts`: Música (emerald-600), Fala (blue-500), Leitura (amber-600),
Oração (pink-500), Avisos (orange-500), Sermão (violet-600), **Outro (slate-500, ícone `CircleEllipsis`)**. Na música: título
próprio e comentário só naquela liturgia (`metadata.title` e `metadata.comment`); o comentário aparece abaixo do tom, como os sub-itens.

### Botões
`variant`: `default` (preto, `primary`), `secondary` (**ação principal, azul**), `outline`, `soft` (chips e seletores do sistema, fundo `muted/[.22]`), `ghost`, `destructive`, `link`. Alturas: `default` h-9, `sm` h-8, `lg` h-10.
Todo elemento clicável mostra o cursor de mão (regra global em `globals.css`). Botão dentro de `<form>` leva `type="button"`.

### Blocos da cifra
Cores por tipo em `components/song/unit-colors.ts` (ver 6.3 para a versão escura proposta).

## 6. Modo escuro

### 6.1 Estado hoje
**Não existe na prática.** O `globals.css` tem um bloco `.dark`, mas é o padrão do shadcn e está incompleto (o `primary` fica
cinza escuro sobre fundo escuro e o `secondary` vira laranja). Nada aplica a classe `dark` (sem provedor de tema,
alternador ou `prefers-color-scheme`); o `body` tem `bg-white`; as 33 ocorrências de `dark:` estão só em `components/ui`
(shadcn). O resto do app usa cor direta da paleta e não tem versão escura (ver 8).

### 6.2 Proposta de paleta base (do protótipo `docs/prototipo-cifras/cabecalho-e-edicao.html`)
O protótipo já tem uma paleta escura com superfícies azuladas. Mapeada para os tokens existentes:

| Token | Claro | Escuro proposto | Contraste |
|---|---|---|---|
| `--background` | `hsl(0 0% 100%)` | `#0c1222` · `hsl(224 48% 9%)` | — |
| `--card` | `hsl(0 0% 100%)` | `#111a2e` · `hsl(221 46% 12.4%)` | — |
| `--popover` | `hsl(0 0% 100%)` | `#182134` · `hsl(221 37% 14.9%)` | — |
| `--foreground` / `--primary` | quase preto | `#f2f5fb` · `hsl(220 53% 96.7%)` | 17,1 sobre o fundo |
| `--muted-foreground` | `hsl(215 14% 48%)` | `#9aa9bf` · `hsl(216 22% 67.6%)` | 7,8 |
| `--border` / `--input` | `hsl(0 0% 89.8%)` | `#26314a` · `hsl(222 32% 22%)` | decorativa |
| `--secondary` (azul da marca) | `hsl(221 83% 53%)` | `#4b84f7` · `hsl(220 91% 63%)` | 5,3 |
| `--secondary-foreground` | quase branco | `#0c1222` | 5,3 sobre o azul |
| `--destructive` | `hsl(0 84% 60%)` | `#ff7a7a` · `hsl(0 100% 74%)` | 7,4 |
| hover / seleção (a criar) | `zinc-100` | `#18213a` / `#16254a` | — |

Diferença importante em relação ao `.dark` atual: **a marca continua azul** (hoje o `.dark` troca por laranja).

### 6.3 Cores dos blocos da cifra (versão escura proposta)
O protótipo cobre intro, verso, refrão e a nota âmbar (interlúdio). Os demais seguem a mesma receita: **texto = tom 300 da paleta,
fundo = mistura escura do matiz (~12% de luminosidade), borda = ~30%, círculo = tom 400**. Valores propostos:

| Tipo | Matiz | Fundo | Borda | Texto | Círculo | Contraste texto/fundo |
|---|---|---|---|---|---|---|
| INTRO | lime | `#1c2a14` | `#46682a` | `#bef264` | `#a3e635` | 11,6 |
| VERSE | cyan | `#0f2a31` | `#1f6d7d` | `#67e8f9` | `#22d3ee` | 10,4 |
| PRECHORUS | orange | `#31200f` | `#7c4a1d` | `#fdba74` | `#fb923c` | 9,3 |
| CHORUS | rose | `#321a20` | `#7f3040` | `#fda4af` | `#fb7185` | 8,5 |
| BRIDGE | violet | `#211a38` | `#5b46a3` | `#c4b5fd` | `#a78bfa` | 9,0 |
| INTERLUDE | amber | `#30280f` | `#7a6420` | `#fcd34d` | `#fbbf24` | 10,1 |
| SOLO | fuchsia | `#2e1534` | `#8a3a94` | `#f0abfc` | `#e879f9` | 9,4 |
| ENDING | **green** (hoje é lime) | `#10291a` | `#2c6e43` | `#86efac` | `#4ade80` | 11,0 |
| BLOCK | neutro | `#161d2e` | `#33405a` | `#cbd5e1` | `#94a3b8` | 11,3 |
| TEXT | slate | `#131a2a` | `#2b3650` | `#94a3b8` | `#64748b` | 6,8 |

Contrastes de texto calculados pela fórmula do WCAG (todos acima de 4,5).

**Decisão (13/11/2026): o Final passa de lime para green**, nos dois temas. Introdução e Final eram ambos lime e quase
indistinguíveis (diferença perceptual ΔE de 19,9 no claro e 9,6 no escuro; abaixo de ~20 confunde). Com green, a menor
distância do Final a qualquer outro tipo é 37,6 (claro) e 41,0 (escuro). Valores do Final:

| Tema | Círculo | Fundo | Borda | Texto |
|---|---|---|---|---|
| Claro (a aplicar em `unit-colors.ts`) | `green-500` | `green-50` | `green-200` | `green-700` |
| Escuro | `#4ade80` | `#10291a` | `#2c6e43` | `#86efac` |

Os demais itens do tipo acompanham (comentário `green-700`, selo `green-200`/`green-700`, alça `green-100`/`green-200`, anel `green-500`).
A cor não é o único sinal: o bloco mostra o nome ("Final", "Introdução") e a sigla no mapa da música.

### 6.4 Plano (etapas)
1. **Documento e página no estado real** (esta etapa).
2. **Completar os tokens** e mapear os valores soltos, sem mudar o claro:
   - criar `--surface-subtle` (os `zinc-50` de faixas e cabeçalhos), `--surface-hover`, `--border-strong` (trilho), estados
     (`--success`, `--warning`, `--info`, cada um com `-foreground`, `-subtle` e `-border`), e os `--block-*` por tipo;
   - mapa: `zinc-50` → `surface-subtle`; `zinc-100/200` → `muted`/`border`; `zinc-300` → `border-strong`; `zinc-400/500` →
     `muted-foreground`; `zinc-700/900` → `foreground`; `bg-white` → `background`/`card`; `text-white` sobre cor → `*-foreground`.
3. **Modo escuro:** reescrever `.dark` com a paleta de 6.2 (Final em green, ver 6.3), provedor de tema próprio (sistema por
   padrão; `light`/`dark` manual em `localStorage`, com script inline no `<head>` para evitar o "flash"), `color-scheme`, trocar o
   `bg-white` do `body`, e o alternador (6.5).
4. **Migração por área** (editor de cifra e blocos, barra de mídia, liturgia, Palco), conferindo claro e escuro em 390 / 768 / 1280.

### 6.5 Alternador de tema (decidido em 13/11/2026)
Um componente `ThemeToggle` com três opções: **Sistema** (padrão), **Claro** e **Escuro**; o ícone mostra o tema atual (monitor, sol ou lua).
- **Desktop e tablet:** botão no **rodapé da barra lateral** (`NavBar`, que hoje não tem nada ali), abrindo um menu para o lado.
- **Celular, listas:** **4º item da barra inferior**, "Tema", no mesmo estilo dos outros (sem estado "ativo"); ao tocar abre uma folha de baixo
  (mesmo padrão dos seletores do filtro) com as três opções. Quatro itens cabem (cerca de 97px cada em 390px).
- **Telas sem barra no celular** (detalhe e edição): seguem o tema do sistema; a escolha manual vale em todas as telas porque fica guardada no aparelho.
- **Modo Palco:** segue o tema geral escolhido; não tem opção própria.
- Descartados: alternador no cabeçalho (disputa a área de ações do título) e na tela de Feedback (pouco descobrível).
- A barra inferior hoje usa `bg-white/80` e `border-gray-100`, e a lateral `bg-zinc-50`: entram na migração para tokens.

Fora do escopo da tokenização: cores que são **dado** (cor de categoria e de capa, `lib/cover-theme.ts`, `readableTint`).

## 7. Regras de uso (para código novo)

1. Use **tokens semânticos** (`bg-background`, `text-muted-foreground`, `border-border`, `bg-secondary/10`...). Não use cor da paleta
   (`zinc-*`, `emerald-*`, `bg-white`, `text-white`) em UI nova, a menos que esteja em `unit-colors.ts` / `unitConfig.ts`.
2. Espaços nos degraus de 4px; margem lateral sempre por `px-page`; ritmo vertical pelos tokens de 4.
3. Tipografia por **variante do `Text`**; mínimo de 12px.
4. Lista = cartão (5); filtros = barra sticky (5); ação principal no cabeçalho + flutuante no celular.
5. Verifique contraste (≥ 4,5 para texto; ≥ 3 para ícone e borda funcional) e a quebra de texto no celular.
6. Mudou um token ou padrão? Atualize este documento e `/design-system`.

## 8. Pendências conhecidas (levantamento de 13/11/2026)

| Item | Números | Observação |
|---|---|---|
| Cor da paleta direta | `zinc` 140 usos (27 arquivos), `red` 45, `amber` 38, `emerald` 37, `rose` 11, `lime` 22, `cyan` 11, `violet` 15 | sobretudo editor de cifra (`BlockBody` 19), `MediaPlayerBar` (15), `unit-colors` (8) |
| `bg-white` / `text-white` / `bg-black` | 14 / 30 / 4 | trocar por tokens na etapa 2 |
| Cores em hex/rgb/hsl no TS | 15 em 6 arquivos | parte é dado (capas, categorias) |
| Tamanhos `text-[Npx]` | 35 | 9–11px abaixo do piso de legibilidade |
| Espaços arbitrários (`p-[..]`, `gap-[..]`) | 46 | converter para os degraus quando possível |
| Rótulos de seção | 5 estilos diferentes | unificar no `overline` |
| Margem lateral de formulários | `px-4 sm:px-6 lg:px-8` em 15 lugares (14 arquivos) | migrar para `px-page` (passo 4 do estudo) |
| `admin/tags`, `admin/holyrics`, feedback | fora do `PageTitleBlock` | migrar |
| Fonte do Google no build da Vercel | falhou uma vez em `next/font` | considerar `next/font/local` |
