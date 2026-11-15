# Pré-análise do estado atual: edição de cifra (modo de edição total)

> Feita por **leitura estática** da branch `feat/referencias-midia-lista` (HEAD `7dd26a0`), sem rodar o app, sem banco e sem a branch `main`. Tudo aqui é **[a confirmar]** no código antes de se apoiar. Esta pré-análise **não substitui** a Fase 0 da spec: ela dá o ponto de partida e as suspeitas mais caras.

## A. Mapa do código atual

| Arquivo | Papel hoje |
|---|---|
| `components/service/ServiceView/ServiceSongUnitView.tsx` | Guarda `isEditing`. Em edição troca `ArrangementView` por `ServiceSongUnitEditForm`. Mede o cabeçalho (`--song-header-h`) e a borda "stuck". |
| `ServiceArrangementHeader.tsx` | Sticky (`top-0 z-10`): título + em edição Salvar (ícone `Check` no celular, texto no desktop) e X. Se há `originalArrangementId`, Salvar abre um **diálogo de escopo** ("só a liturgia" / "liturgia e original"). O X chama `onCancel` **sem confirmação**. |
| `ServiceArrangementMeta/index.tsx` | Linha de autor/arranjo, tom, referências e o **lápis** que inicia a edição (`onStartEdit`). Em edição, tom e lápis somem; as referências ficam. |
| `ServiceSongUnitEditForm.tsx` | `useForm` + `zodResolver(arrangementSchema)`, monta `<SongUnitListForm fieldPrefix="" />`. Expõe `submit(scope)` por `submitRef`. Usa `preserveMedia: true`. |
| `components/song/ArrangementForm/SongUnitListForm/index.tsx` | **Compartilhado** com a página de edição de música (`ArrangementForm`, rotas `/songs/new` e `/songs/[song]/edit`). Cria `InstructionToolbarContext` (`activeInsert`), a toolbar mobile (`sticky top: var(--song-header-h)`), a `ChordSidebar` (`hidden md:flex`, sticky) e a lista de `SortableUnitForm` + `AddUnitForm`. |
| `SortableUnitForm.tsx` | Drag and drop (`@atlaskit/pragmatic-drag-and-drop`) **no bloco inteiro**; remove, duplica, insere acima/abaixo e **ressincroniza `order` à mão**. |
| `UnitForm.tsx` | Cabeçalho do bloco (`TypeDropdown`, botão de notas, botão Repetir ×N, recolher, menu ⋮ com Inserir acima/abaixo, Duplicar, Apagar). Corpo: `textarea` ChordPro + preview `ChordProViewer`; tipo `TEXT` usa `MarkdownUnitForm`. Insere acorde/instrução na posição do cursor (`insertRef`). Textos "Inserir acima/abaixo" e "Repetir bloco" estão fixos no código. |
| `ChordSidebar.tsx` | "Dicionário": `KeyButtonSet`, grade `buildChordGrid(currentKey)` (Tríade, 7ª, Inv., Var.) com `applyEnharmonicToGrid`, e as **instruções** (`COMMENT_CHIPS` + campo "Personalizado..."). |
| `ChordPickerPanel.tsx` | Parece **sem importadores** (código morto) [a confirmar]. |
| `chopro/music.ts`, `chopro/chord-grid.ts` | `parseChordPro` (chordsheetjs); `{c:texto}` e `{comment:texto}` viram item `comment`; `getLyrics`/`getChords` os ignoram. Grade de acordes por tom. |
| `components/song/ChordProLine/*` | Renderiza a linha. Um `comment` seguido de outro item na mesma linha ganha `pt-[1.375em]` e aparece **acima do acorde**. |
| `ArrangementView/ColumnViewer/*` | Leitura. `findBestDistribution` (column-logic) parseia, numera por tipo (`unitTypeIndex`) e distribui blocos em colunas; **sem id/âncora por bloco**; aplica `trim()` por linha; mostra `repeatBadge` e `notes`. |
| `components/song/unit-colors.ts` | `unitColorClasses[tipo]` (`circleBackground`, `background`, `text`, `border`, `comment`, `repeatBadge`) para os 10 tipos de `SONG_UNIT_TYPES`. |
| `schemas/song-unit.ts` | `content: min(1)`, `repeatCount: int 1..8`, `notes: nullable`, `order: positive`. `arrangementSchema` exige ≥1 unidade, exceto arranjo de liturgia. |
| Testes | `ServiceSongUnitEditForm.test.tsx`, `ServiceSongUnitView.test.tsx`, `ServiceArrangementHeader.test.tsx`, stories de `UnitForm` e `SongUnitListForm`, e2e `visual-regression.spec.ts` (+ snapshots) [a confirmar cobertura da edição]. |
| `docs/referencias-midia/` | Trabalho paralelo na **mesma** área (cabeçalho/Meta). A edição de cifra convive com ele. |

## B. Achados (impacto na adaptação)

### Altos

**A1. O caminho de escrita é uma string ChordPro, e o editor visual precisa ler e gravar essa string sem perda.** `chordsheetjs` normaliza e serve para leitura, não para escrita. O leitor da visão atual ainda faz `trim()` por linha. Um editor que reserialize a partir de um modelo próprio pode alterar espaços, linhas vazias, diretivas desconhecidas e acordes não usuais (`[A4]`, `[D/F#]`). Precisa de módulo puro, com testes de ida e volta (identidade) sobre o conteúdo real do seed/mock.

**A2. Tornar acordes e palavras tocáveis sem tocar no miolo.** O acorde é desenhado por `ChordProLine`/`StyledLine`/`Item`. O alvo de toque precisa ter a mesma geometria. Caminhos: (a) componente novo que replica o alinhamento (risco de divergir visualmente); (b) props aditivas no miolo (exige aprovação, pela regra de ouro). Decisão do Tiago.

**A3. Colunas.** A leitura usa colunas com redistribuição; a edição atual é uma lista de coluna única com sidebar. "Manter o posicionamento da view" admite duas leituras (mesma rolagem/âncora, ou mesmas colunas). Além disso, **Subir/Descer seguem a ordem das unidades**, não a posição visual na coluna.

**A4. Componente compartilhado.** `SongUnitListForm` também alimenta a edição de música no catálogo. Alterá-lo muda esse fluxo (rodapé Salvar/Cancelar, `ConfirmDiscardDialog`, `autoScrollWindowForElements`).

**A5. Transposição durante a edição.** A sidebar monta a grade com o tom **transposto** (`transposeChord(baseKey, baseKey, transpose)`) e `handleChordSelect` insere `[acorde]` direto no conteúdo. Se o conteúdo guardado está no tom base, com `transpose ≠ 0` o acorde entra no tom errado [a confirmar se há conversão]. O editor visual mostra acordes em qual tom?

**A6. Bloco vazio é inválido** (`content min(1)`), e "Nova unidade" e "Inserir acima/abaixo" criam `content: ""`. Num editor de toque em acordes, um bloco vazio não tem o que tocar: precisa de ponto de partida (modo texto ou "+").

### Médios

- **M1. React Hook Form.** `update(index, unit)` regenera a lista; a `key` é `${unit.id}--${index}`; o DnD recria observers a cada mudança de `unit`. Cada toque de acorde pode re-renderizar todos os blocos, e seleção/foco precisam sobreviver. Medir com ~15 blocos.
- **M2. Drag and drop** hoje no bloco inteiro. A nova decisão (Subir/Descer) o substitui; remover é simplificação, mas é remover uma feature existente.
- **M3. Camadas.** Cabeçalho sticky `z-10` com `--song-header-h`; a toolbar mobile (que sai) também. O modal flutuante precisa ficar acima do cabeçalho e abaixo de diálogos. O `CLAUDE.md` registra que UI flutuante global vai na raiz do layout por causa de listeners do vaul. Radix Popover expõe a largura do *gatilho*, não do bloco (requer âncora virtual ou posicionamento próprio).
- **M4. Teclado virtual.** O `onPointerDown preventDefault` da toolbar existe para não perder o foco do textarea. Sem textarea (visual), o padrão muda; no modo texto, volta.
- **M5. `repeatCount`.** O botão Repetir (ciclo 1→4) sai da UI, mas há dados com `repeatCount > 1` (schema aceita até 8), exibidos por `repeatBadge`. Existe a branch `fix/repeticao-bloco-ate-4x-v2` no repo. Definir o destino do dado legado.
- **M6. `notes`.** O "Adicionar instrução" do bloco é `unit.notes`, **diferente** das instruções `{c:}`. O protótipo omitiu o botão; a leitura exibe as notas.
- **M7. Salvar e cancelar.** O escopo (liturgia | liturgia + original) já existe e **deve ser mantido**. O X de hoje **não confirma**; o protótipo confirma se houver alteração (comportamento novo). `isDirty` mora no form dentro do `EditForm`, e o cabeçalho está fora: precisa de ponte (ex.: estender o handle).
- **M8. Instruções.** Lista do app: Pausa, Forte, Suave, Crescendo, Só voz, Só base, Rall. + campo Personalizado. O protótipo mudou a lista e omitiu o personalizado. A lista está **duplicada** em `index.tsx` e `ChordSidebar.tsx`.
- **M9. Preferência enarmônica** (sustenido/bemol do aparelho) é aplicada à grade. O modal precisa respeitá-la.
- **M10. Acessibilidade.** Centenas de botões de acorde e palavra: ordem de tab, alvo ≥ 44 px (no protótipo, 20 px de altura visual + área de toque expandida), roving tabindex; menus com Radix para herdar ARIA.

### Baixos

- **B1. Nome "Texto".** O tipo `TEXT` (markdown) colide com "Editar como texto" (ChordPro). Usar outro rótulo no menu.
- **B2.** Existe `UnitForm.tsx.tmp.1133.7ec5d7cdd414` na pasta (resíduo) e `ChordPickerPanel` aparentemente órfão. **Não mexer** sem avisar; só reportar.
- **B3.** Textos fixos no código ("Inserir acima", "Repetir bloco") fora do `next-intl`.
- **B4.** A numeração de rótulo ("Verso 2") vem de `unitTypeIndex` no `column-logic`; a edição deve usar a mesma regra, não reinventar.
- **B5.** O protótipo usa paleta simplificada (4 grupos); o app tem cor por tipo em `unit-colors.ts` (10 tipos). Vale o app.

## C. Divergências conhecidas: protótipo × app

| Protótipo | App (vale o app) |
|---|---|
| Convenção como `[*Pausa]` | `{c:Pausa}` imediatamente antes do acorde (aparece acima do acorde) |
| Lista de convenções (Pausa, Break, Rall., Cresc., Dim., Suave, Forte), sem campo livre | `COMMENT_CHIPS` do app + "Personalizado..." |
| Acordes do tom fixos (C, Dm, Em, F, G, Am) e grade "nota × tipo" | `buildChordGrid` (Tríade, 7ª, Inv., Var.) + `applyEnharmonicToGrid` |
| Lápis no cabeçalho entra na edição | Lápis em `ServiceArrangementMeta` (o protótipo antigo usava ♪; o unificado usa o lápis) |
| Salvar grava "neste culto" | Salvar com diálogo de escopo quando há original |
| X pergunta só se houve alteração | X descarta sem confirmar (hoje) |
| Tom no cabeçalho durante a edição | Em edição, tom e lápis somem (branch atual) |
| Aviso "Salvo neste culto" | Não existe |
| Sem drag, sem "Adicionar instrução", sem Repetir | Existem hoje; ver decisões D4–D6 |
| Tom sempre C | `buildChordGrid(currentKey)` |
| Duas colunas CSS no desktop | `ColumnViewer` (distribuição própria) na leitura; coluna única na edição |
| Cores por 4 grupos | `unit-colors.ts` por tipo |
