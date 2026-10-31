# PLANO: Edição da cifra por blocos

> Produzido depois da Fase 0 (`ANALISE.md`) e das decisões do Tiago (seção G de `ANALISE.md`, correspondente à seção 6 da spec). Cada etapa é um PR pequeno para `main`, com `npx tsc --noEmit` + testes antes do push, CI verde e validação do Tiago antes do merge — o mesmo fluxo já seguido nos PRs #66-#69. Nenhuma etapa deixa o app num estado pior do que estava.

## Decisões que moldam este plano (resumo; detalhe em `ANALISE.md` seção G)

- **D1 — também o catálogo**: o componente novo substitui `SongUnitListForm` nos dois fluxos (liturgia e `/songs/.../edit`), não só na liturgia.
- **D2 — colunas sempre dinâmicas**: o editor reusa (sem alterar) `findBestDistribution` e recalcula a distribuição em colunas a cada mudança de conteúdo.
- **D3 — componente novo** para acorde/palavra tocável, sem tocar `ChordProLine`/`StyledLine`/`Item`.
- **D4 — sem drag-and-drop**: só Subir/Descer.
- **D5 — sem `repeatCount` novo**: repetição é sempre duplicar o bloco; leitura não muda.
- **D9 — tom base sempre**: o editor nunca transpõe ao inserir/mostrar acorde (corrige o bug ativo de A5 nos dois fluxos).
- **D11 — cancelar com confirmação** só se houver alteração, nos dois fluxos.
- **D12 — nunca zero blocos**: apagar fica desabilitado no último bloco restante.
- **D13 — base**: `origin/main` atual (`eb868e5`), já resolvida.
- **D14 — tecnologia do modal em aberto**: decidir na Etapa 4, critério "mobile-first, reaproveitável por bloco no desktop".
- **Siglas no Modo Palco**: fora desta entrega. Como "mapa da música" também não existe hoje, a tabela condicional de siglas da seção 8.2.1 **não é construída nesta entrega** — só a numeração simples "por tipo, na ordem dos dados" (usada no seletor de tipo do bloco) e a troca `ENDING` → "Final" no i18n.

## Etapas

### Etapa 1 — Modelo de bloco (sem UI)

**O quê:**
- Módulo puro (ex. `chopro/block-model.ts`) que lê a string ChordPro de uma unidade em partes tocáveis (acordes, palavras, convenções `{c:}`, resto intocado) e grava de volta **sem perda** — identidade garantida mesmo com espaços, linhas vazias, diretivas desconhecidas e acordes incomuns (`[A4]`, `[D/F#]`). Reaproveita `parseChordPro`/`chordsheetjs` para ler; escreve um serializador próprio (não existe hoje).
- Função nova de numeração por tipo **na ordem dos dados** (não por coluna, diferente de `unitTypeIndex` do `column-logic.ts` — não tocamos nele). Usada pelo seletor de tipo do bloco (seção 8.2 da spec: "nome com numeração, igual à da leitura").
- Rename `UnitTypes.ENDING`: "Saída" → "Final" no `i18n/messages/pt-BR.json` (confirmado: nenhum teste/snapshot cita "Saída" diretamente).
- Fonte única para `COMMENT_CHIPS` (hoje duplicada em `SongUnitListForm/index.tsx` e `ChordSidebar.tsx`), lista mantida como está (D8).
- Limpeza: remover `UnitForm.tsx.tmp.1133.7ec5d7cdd414` (resíduo) e `ChordPickerPanel.tsx` (código morto confirmado, zero importadores).

**Verificação:** testes de identidade (abrir/serializar sem editar = string idêntica) sobre conteúdo real (`prisma/seed`/mocks existentes); teste de cada operação (trocar acorde, inserir, remover, mover, aplicar/remover convenção) isoladamente, sem UI. `tsc` + suíte completa.

**Risco:** alto (é a base de tudo que vem depois), mas o PR em si é de baixo impacto visual — nenhuma tela muda.

### Etapa 2 — Lista com colunas dinâmicas + casca do bloco

**O quê:** componente novo de nível superior (substituto de `SongUnitListForm`), ainda **não conectado a nenhuma tela real** — só Storybook/testes, para poder revisar isoladamente sem afetar produção.

- Container que distribui os blocos em colunas chamando `findBestDistribution` (reuso, sem alterar `column-logic.ts`), recalculando a cada mudança de conteúdo (D2).
- Cabeçalho de cada bloco: seletor de tipo (reaproveita `TypeDropdown`/cores de `unit-colors.ts`) com a numeração nova da Etapa 1; menu do bloco (Radix `DropdownMenu`) com Subir, Descer, Duplicar, Inserir acima/abaixo, Notas do bloco (D6), Editar como texto, Apagar (desabilitado se for o único bloco restante, D12) — mais "Nova unidade" no fim da lista (D10).
- Subir/Descer: adaptar a lógica já existente (hoje morta) de `hooks/moveUpDown.ts` — trocar de "swap" para "insert/move" compatível com `useFieldArray`, já que mover um bloco pode trocá-lo de coluna.
- Sem drag-and-drop (D4) — `SortableUnitForm.tsx` não é reaproveitado; fica como está, só para o editor antigo, até a Etapa 6 remover o editor antigo dos dois fluxos.
- Corpo do bloco ainda é o `textarea` + preview antigos (placeholder temporário) — isso vem na Etapa 3.

**Verificação:** stories cobrindo cada item do menu, teste de `order` consistente após mover/duplicar/inserir/apagar (critério de aceitação 7), teste do guard do último bloco (D12). `tsc` + suíte.

**Risco:** médio. Nada em produção muda ainda.

### Etapa 3 — Corpo visual tocável

**O quê:** substitui o `textarea`+preview (placeholder da Etapa 2) por uma renderização própria da cifra do bloco com acordes e palavras como alvos de toque (D3) — reaproveitando a estrutura de dados (`ChordLyricsPair` por item de linha) sem importar/alterar `ChordProLine`/`StyledLine`/`Item`. Replica os três detalhes finos que causam divergência visual se esquecidos: `commentAbove` (convenção acima do acorde), `isConnection` (sílabas conectadas) e o padding condicional (`pt-[1.375em]`).

- Sempre no tom base (D9): o corpo do bloco ignora o `transpose` ambiente do `SongConfig` — nunca transpõe ao exibir ou (na Etapa 4) inserir acorde.
- Toque num acorde/palavra ainda **não abre o modal** nesta etapa (ou abre um placeholder) — o modal de verdade é a Etapa 4.

**Verificação:** teste de paridade visual (screenshot ou comparação de DOM) contra o mesmo conteúdo renderizado pela leitura (`ColumnViewer`), nos casos com convenção, sílaba conectada e acorde incomum. `tsc` + suíte.

**Risco:** alto — é onde mais facilmente diverge da leitura sem ninguém notar de cara.

### Etapa 4 — Modal do acorde

**O quê:** modal contextual (seção 8.3): acordes do tom (grade real do app, D7, com preferência enarmônica), ícone de grade expandida, campo de digitar (desktop), convenções (D8), ações (mover uma letra ◀▶, remover, fechar). Teclado (seção 8.6).

- **Decidir D14 aqui**: avaliar Radix Popover adaptado (herda foco/ARIA/Esc, mas exige `getBoundingClientRect` pra forçar largura do bloco) vs. elemento posicionado manualmente no container rolável (largura exata por construção, ARIA/foco à mão) vs. outra abordagem — critério do Tiago: mobile-first, reaproveitável por bloco também no desktop. Prototipar as opções mais prováveis antes de travar, já que não há precedente no projeto (M3/D14).
- Inserir acorde numa palavra (seção 8.4): tocar uma palavra insere no início dela e seleciona; acorde novo nasce no acorde do tom (I) ou outro padrão a definir aqui.

**Verificação:** teste de cada ação do modal, teste de que a edição vale só para o bloco tocado (critério de aceitação 6), teste de teclado. `tsc` + suíte.

**Risco:** alto — peça mais nova, zero precedente de UI parecida no projeto.

### Etapa 5 — Modo texto por bloco e bloco vazio/inválido

**O quê:** alternar o corpo do bloco para ChordPro puro editável (seção 8.5); bloco vazio (`content: ""`) ou com erro de parse (`hasError`) abre direto em modo texto. Blocos `TEXT` continuam com `MarkdownUnitForm` (sem editor visual de acordes).

**Verificação:** teste de blocos vazio/inválido/`TEXT`, teste de ida e volta entre modo visual e texto sem perda. `tsc` + suíte.

**Risco:** baixo-médio.

### Etapa 6 — Sessão de edição: conectar nos dois fluxos (D1)

**O quê:** troca `SongUnitListForm` pelo componente novo **nos dois lugares**:
- `ServiceSongUnitEditForm.tsx` (liturgia) — mantém o diálogo de escopo existente (`EditOrSaveCancelGroup`); `isDirty` passa a subir via `EditFormHandle` pra acionar `ConfirmDiscardDialog` no X (D11, comportamento novo aqui).
- `ArrangementForm/index.tsx` (catálogo) — `isDirty`/`ConfirmDiscardDialog` já existem e funcionam assim; só reconectar à lista nova. `FormFooter` do catálogo não muda.

Remove, dos dois fluxos: `ChordSidebar` (Dicionário), a toolbar mobile (`InstructionToolbarContext`), o botão Repetir. Remove `SortableUnitForm.tsx` e o drag-and-drop de uma vez (D4), já que depois desta etapa nenhum fluxo o usa mais.

**Verificação:** suíte completa dos dois fluxos, medir re-render com ~15 blocos (M1, critério "parece instantâneo" mais do que contagem de renders). Teste manual nos dois fluxos (roteiro da seção 12 da spec) antes de pedir validação no preview da Vercel.

**Risco:** alto — é o ponto em que os dois fluxos reais de produção mudam de uma vez. Maior PR do plano; considerar dividir em 2 PRs (liturgia primeiro, catálogo depois) se o diff ficar grande demais pra revisar de uma vez.

### Etapa 7 — Acabamento

**O quê:** acessibilidade (roving tabindex nas grades, ARIA nos menus/modal, alvo de toque ≥44px, `prefers-reduced-motion`), textos pendentes da seção 9 via `next-intl` (inclusive os fixos hoje: "Inserir acima/abaixo", "Dicionário", "Repetir bloco" — este último só se algo ainda referenciar), regressão visual nova (a liturgia nunca teve snapshot do modo de edição — criar; o catálogo precisa atualizar `song-edit.png`), limpeza final (`hooks/moveUpDown.ts` se não tiver sido totalmente absorvido pela Etapa 2, qualquer `console.log`/comentário temporário). Nota final de entrega: o que ficou fora, o que foi limpo, riscos restantes.

**Verificação:** suíte completa, `tsc`, e2e de regressão visual nas 3 telas protegidas + a nova tela de edição, tema claro e escuro, roteiro de teste manual completo (seção 12).

**Risco:** baixo-médio, mas é onde os critérios de aceitação 11-14 são fechados.

## Observação sobre tamanho

Etapas 1-5 constroem o componente novo isolado (sem afetar produção); etapa 6 é o ponto de não-retorno onde os dois fluxos reais mudam. Se o Tiago preferir, posso reavaliar o corte das etapas depois da Etapa 2 (quando a forma real do código estiver mais clara) — nenhuma etapa aqui é definitiva ao ponto de não poder ser subdividida mais na hora.
