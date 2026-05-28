# Guia de port — chorder-alt → chorder

Decisões e racional das melhorias implementadas neste fork. Use como referência ao replicar no projeto original.

---

## Índice

- [Features novas (requerem schema)](#features-novas)
- [Redesign do Header e configuração (Popover)](#redesign-do-header-e-configuração-popover)
- [Redesign da lista de músicas](#redesign-da-lista-de-músicas)
- [Padrões de teste](#padrões-de-teste)
- [Bugs corrigidos (fácil port)](#bugs-corrigidos)

---

## Features novas

### Referência de YouTube por arranjo

**Problema:** não havia como associar uma referência de vídeo a um arranjo específico para a equipe escutar antes do ensaio.

**Decisão de design:** campo `youtubeUrl` no modelo `SongArrangement` (não na música em si), pois arranjos diferentes podem ter referências diferentes (ex.: tom diferente, versão ao vivo vs. estúdio).

**Arquitetura do player:** mini player global via contexto React renderizado na raiz do layout (`app/layout.tsx`), não via `createPortal`. Motivo: drawers (vaul) têm listeners de captura no `document` que bloqueiam eventos em portais. O player precisa sobrepor qualquer drawer aberto.

**Arquivos tocados:**
- `prisma/schema.prisma` — campo `youtubeUrl String?` em `SongArrangement`
- `prisma/data.ts` — incluir no select/update; campo "ao vivo" (resolve do original em service arrangements)
- `schemas/arrangement.ts` — `youtubeUrl: z.string().url().or(z.literal("")).nullable()`
- `components/common/YoutubePlayer/` — `context.tsx` (provider) + `Widget.tsx` (iframe embed)
- `components/common/YoutubeReferenceButton/` — botão que dispara o player global
- `app/layout.tsx` — `<YoutubePlayerProvider>` wrapping + `<YoutubePlayerWidget />` após `{children}`
- Todos os pontos de exibição: `ArrangementHeader`, `ServiceArrangementHeader`, `ServiceSongUnitForm/FormHeader`

**Padrão Zod para URL opcional:**
```ts
youtubeUrl: z.string().url().or(z.literal("")).nullable()
// defaultValues: youtubeUrl: arrangement?.youtubeUrl ?? ""
```
Nunca usar `.optional()` — quebra o split de tipos do react-hook-form com zodResolver.

---

### Upload de áudio de referência por arranjo

**Problema:** referências de áudio (gravações próprias, demos internos) não podiam ser anexadas diretamente ao arranjo.

**Decisão de design:** campo `audioUrl String?` no `SongArrangement`, com upload para **Vercel Blob** via rota `POST /api/upload-audio`. Limite de 5 MB, validação de MIME type no servidor.

**Coordenação entre players:** YouTube e áudio se fecham mutuamente ao iniciar. Implementado pelos providers: ao abrir um, o outro chama `close()`. Evita dois áudios simultâneos.

**Campo "ao vivo":** `audioUrl` é resolvido do arranjo original em service arrangements (não congelado), porque a referência pode ser atualizada depois que o service já foi criado.

**Arquivos tocados:**
- `prisma/schema.prisma` — campo `audioUrl String?`
- `app/api/upload-audio/route.ts` — rota de upload com validação
- `components/common/AudioPlayer/` — `context.tsx` + `Widget.tsx`
- `components/common/AudioReferenceButton/` — botão que dispara o player
- `.env.example` — `BLOB_READ_WRITE_TOKEN=`
- Mesmos pontos de exibição do YouTube

**Dependência adicional:** `@vercel/blob` (só disponível no Vercel; para outros deploys, trocar a rota de upload).

---

## Redesign do Header e configuração (Popover)

### PageHeader — top-bar pattern + contentActions

**Problema:** título longo competia com botões de ação no mesmo `flex-row`. Em mobile, a linha partia em dois.

**Solução:** separar em duas linhas fixas:
1. Top bar: `backLink` (esq) + `actions` admin (dir) — sempre numa linha
2. Título em largura total (`w-full`)
3. Slot `contentActions` abaixo do subtítulo — para controles de conteúdo (seletor de arranjo, transposição, botões de mídia)

```tsx
// Nova prop em PageHeader:
contentActions?: React.ReactNode;

// Uso em ArrangementHeader:
<PageHeader
  contentActions={
    <>
      {hasMultipleArrangements && <ArrangementSelector ... />}
      {originalKey && <KeyButtonSet ... />}
      {arrangement.youtubeUrl && <YoutubeReferenceButton ... />}
    </>
  }
/>
```

**chorder-alt:** inclui também `audioUrl && <AudioReferenceButton ... />` no `contentActions`.

### ArrangementHeader / ServiceHeader — Collapsible → Popover

**Problema:** o `Collapsible` empurrava o conteúdo da página para baixo ao abrir, causando layout shift. O painel de configuração ficava longo (muitos controles) e ocupava muito espaço vertical.

**Solução:** substituir por `Popover` ancorado no botão de configuração. O painel flutua sobre o conteúdo sem causar reflow. Layout compacto: `flex-col gap-4` com labels simples (`text-xs text-zinc-500`) em vez de componente `<Label>`.

**Ícone:** `SlidersHorizontal` (em vez de `Settings2`) + variant `ghost` (em vez de `outline`).

**SongConfig (dentro do Popover):** remove a prop `originalKey` — `KeyButtonSet` sai do SongConfig e vai para `contentActions` do PageHeader. O SongConfig no Popover só contém: modo, colunas, fonte, densidade.

**ServiceConfig:** mesmo padrão, sem `KeyButtonSet` (service não tem transposição por instrumento).

**Arquivos tocados:**
- `components/common/PageHeader/index.tsx` — nova prop `contentActions`, top-bar pattern
- `components/song/ArrangementHeader/index.tsx` — Collapsible → Popover, useSongConfig, contentActions
- `components/song/ArrangementHeader/SongConfig.tsx` — remover originalKey e KeyButtonSet, layout Popover
- `components/service/ServiceHeader/index.tsx` — Collapsible → Popover
- `components/service/ServiceHeader/ServiceConfig.tsx` — layout Popover

**O que NÃO mudar no chorder-alt ao portar este redesign:**
- O `chorder-alt` mantém `AudioReferenceButton` em `contentActions` (chorder não tem áudio)
- A verificação `hasContentActions` inclui `arrangement.audioUrl`

### DensityButtonSet — ícones em vez de texto

**Motivação:** no contexto do Popover (espaço limitado), ícones ocupam menos espaço e comunicam visualmente "compacto vs. normal".

**Fix:** substituir `ToggleGroupItem` com texto por ícones `Rows2` / `Rows3` da lucide-react.

### ActionMenu — ícone MoreVertical

**Motivação:** o botão de texto "Ações" ocupa espaço no top bar. Um ícone `MoreVertical` (três pontos verticais) é padrão de mercado e libera espaço para o título.

**Fix:** `variant="ghost" size="icon"` + `<MoreVertical />` + `<span className="sr-only">` + `align="end"` no `DropdownMenuContent`.

---

## Padrões de teste

### ArrangementHeader — mocks necessários

Após a migração para Popover, o `ArrangementHeader` chama `useSongConfig()` diretamente. Sem mock, o teste falha com erro de contexto ausente:

```tsx
vi.mock('@/components/config/SongConfig', () => ({
  useSongConfig: () => ({ transpose: 0, setTranspose: vi.fn() }),
}));
vi.mock('@/components/config/KeyButtonSet', () => ({
  default: () => <div data-testid="key-button-set" />,
}));
```

O `mockArrangement` deve ter **2+ itens em `song.arrangements`** para `ArrangementSelector` aparecer. No chorder-alt, cada arranjo no mock precisa incluir `audioUrl: null`.

### SongPicker — clicar no botão de adicionar

`SongListEntry` usa um `<Link>` overlay cobrindo toda a linha com `pointer-events-none` no título. Clicar no título **não aciona `onSelected`**. A abordagem correta:

1. Mockar `next/link` (evita avisos de state update no JSDOM)
2. Encontrar o botão pelo texto `sr-only`

```tsx
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const addLabels = await screen.findAllByText('Adicionar ao service');
await user.click(addLabels[0].closest('button')!);
expect(onSelected).toHaveBeenCalledTimes(1);
```

### E2E — ArrangementSelector exige 2+ arranjos no seed

`ArrangementSelector` só é renderizado quando `hasMultipleArrangements` (song.arrangements.length > 1). Se o seed tiver apenas 1 arranjo, qualquer teste que verifique texto do seletor vai falhar. Adicionar sempre um segundo arranjo ao seed do `seedVisualBaseline`:

```ts
await prisma.songArrangement.create({
  data: { songId: song.id, key: 'A', name: 'Alternative Arrangement', isDefault: false }
});
```

---

## Redesign da lista de músicas

### SongListEntry — grid responsivo

**Problema original:** layout com `flex` e colunas de largura variável causava desalinhamento entre linhas (artistas longos empurravam a coluna de letras).

**Solução:** CSS Grid com colunas fixas no container de cada linha. Como cada linha é seu próprio grid, usar `auto` em qualquer coluna faz a largura variar por linha — todas as colunas precisam ser fixas ou fracionárias.

```
Mobile  (< md): grid-cols-[1fr_auto]
Tablet  (md):   grid-cols-[2fr_3fr_12rem]
Desktop (lg):   grid-cols-[2fr_3fr_8rem_5rem]
```

**Técnica de responsividade:** `display: none` remove o elemento do fluxo do grid (diferente de `visibility: hidden`). Isso permite ter 4 filhos no DOM mas apenas 2 participando do grid no mobile, sem wrappers extras.

```tsx
{/* visível só a partir de md */}
<div className="hidden md:block"> ... </div>

{/* visível só em lg */}
<div className="hidden lg:block"> ... </div>
```

**Linha inteira clicável:** link overlay absoluto em vez de `<Link>` apenas no título. Elementos interativos (dropdown, botões) ficam em `z-10` acima do overlay.

```tsx
<div className="relative grid ...">
  <Link href={...} className="absolute inset-0 z-0" aria-label={song.title} />
  <div className="relative z-10 pointer-events-none"> {/* título */} </div>
  <div className="relative z-10"> {/* botões */} </div>
</div>
```

O título usa `pointer-events-none` porque o overlay já cobre o clique; isso evita conflito de cursor.

**Dropdown de arranjo:** só aparece quando há mídia (`youtubeUrl` ou `audioUrl`) em pelo menos um arranjo. Sem mídia, o dropdown não tem utilidade funcional.

**Dropdown no tablet:** o dropdown standalone (col 3) é `hidden` no tablet; em vez disso, uma cópia inline aparece dentro da col 4 (`hidden md:flex lg:hidden`). Isso mantém o layout de 3 colunas sem quebrar linha.

**Nome do arranjo padrão:** `arr.name?.trim() || fallback` — não `??`. O campo é salvo como `""` (string vazia), não `null`, então `??` não capturaria o caso vazio.

**`SelectTrigger` compacto:** adicionado `size="compact"` ao componente shadcn `Select`. Em Tailwind v4, usa `data-[size=compact]:h-7` para sobrescrever o `data-[size=default]:h-9` sem conflito de especificidade.

### BigLetter — divisória alfabética

**Problema:** letra e borda usavam cores genéricas (`text-zinc-400`, `border-zinc-200`) desconexas da paleta do tema.

**Solução:**
- Letra: `text-secondary` (mesma cor das letras clicáveis no `InitialsNav`)
- Borda: `border-secondary/25` (mesma cor com 25% de opacidade — relacionada visualmente mas subordinada)
- Padding: `px-2` para alinhar com o título das músicas (que também tem `px-2` no grid)

---

## Bugs corrigidos

### Título longo quebrando em duas linhas (PageHeader / Heading)

**Causa:** dois problemas combinados:
1. `h1` (level 1 no `Heading`) sem `truncate` — texto longo quebrava livremente
2. Container do título no `PageHeader` sem `min-w-0` — em `md:flex-row`, flex items não encolhem abaixo do tamanho do conteúdo sem essa propriedade, forçando o h1 a quebrar

**Fix:**
```tsx
// components/common/Heading/index.tsx — classe do h1
"... truncate"

// components/common/PageHeader/index.tsx
<div className="flex flex-col min-w-0">
```

### Blur da navbar mobile não renderizava

**Causa:** `backdrop-filter: blur()` requer que o elemento esteja acima do conteúdo que quer borrar. Sem `z-index` explícito num contexto flex, o stacking em alguns browsers móveis não garantia isso. Além disso, o gradiente `from-white` (100% opaco na base) tornava o blur invisível nessa região.

**Fix:**
```tsx
// Antes
"... bg-linear-to-t from-white to-white/50 backdrop-blur-lg ..."

// Depois  
"... z-40 bg-white/80 backdrop-blur-lg ..."
```

`bg-white/80` — fundo semi-transparente uniforme, blur visível em toda a barra. `z-40` — garante stacking correto acima do conteúdo da página.

### Player de áudio sem responsividade no mobile

**Causa:** layout de linha única com `w-48` fixo para o título consumia 192 px em qualquer tela, deixando pouco espaço para os controles em telas pequenas.

**Fix:** duas linhas no mobile, linha única no desktop:
```tsx
// Mobile: linha 1 = título + fechar, linha 2 = controles
// Desktop (md+): linha única com h-14
<div className="... py-2 md:h-14 md:flex md:items-center md:py-0">
  <div className="flex ... md:hidden mb-2"> {/* título mobile */} </div>
  <div className="hidden md:flex ... w-48"> {/* título desktop */} </div>
  <div className="flex ... flex-1"> {/* controles (ambos) */} </div>
  <button className="hidden md:block"> {/* fechar desktop */} </button>
</div>
```

### Ordem dos botões no ArrangementHeader

**Motivação UX:** o seletor de arranjo define *qual* mídia vai tocar — faz sentido aparecer antes dos botões de play, não depois.

**Fix:** mover `<ArrangementSelector>` para antes dos `YoutubeReferenceButton` / `AudioReferenceButton` no JSX.

---

## O que NÃO vale portar

- **Configuração Neon/Vercel** (`DATABASE_URL` + `DIRECT_URL`) — específica deste fork
- **Tema emerald** — decisão visual desta comunidade
- **Remoção do feedback** — decisão de produto desta comunidade
- **Scripts de seed** com caminhos Windows absolutos
- **Migrations** — os dois repos têm históricos de migrations divergentes (chorder-alt tem `youtubeUrl` via 3 migrations; chorder tem via 1 migration; chorder-alt tem `audioUrl` a mais). Nunca copiar migrations entre repos. Ao portar features de schema, criar nova migration no repo de destino com `npx prisma migrate dev`.
- **`directUrl` no schema.prisma** — chorder-alt precisa para Neon; chorder usa Postgres direto e não tem pooler
