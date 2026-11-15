# Pré-análise do estado atual (leitura estática, a confirmar)

> Feita antes da spec, por leitura de arquivos em `D:\Repos\chorder` (branch `feat/referencias-midia-inline`, HEAD `8ad7f93`, 27/10/2026). **Não rodei o app, o banco nem o Vercel.** Tudo aqui é hipótese até o Claude Code confirmar na Fase 0 (`SPEC_REFERENCIAS_MIDIA.md`, seção 5). Onde este documento e o código divergirem, o código vence.

## 1. Mapa do que existe

**Repositórios em `D:\Repos`:** `chorder` (principal, com `.git`), `chorder-modo-palco`, `chorder-service-plan-editor`, `chorder-design-system` (worktrees cujo `.git` aponta para `D:/Repos/chorder/.git/worktrees/...`, hoje marcados *prunable*), `chorder-service-plan-editor.stale-backup` e `tools`.

**Branch atual `feat/referencias-midia-inline`** (publicada em `origin`), 2 commits à frente de `origin/main` (`6dc18a8`, #64):
- `25f933a` "referências de vídeo e áudio ficam acessíveis sem entrar em editar cifras": renomeia `ServiceMediaButtons` para `ServiceMediaReferences`, tira a mídia de `ServiceArrangementHeader` (que só a mostrava em edição) e a coloca em `ServiceSongUnitView`. Hoje são **chips** no corpo do arranjo.
- `8ad7f93`: adiciona `YoutubePlayerProvider`/`AudioPlayerProvider` ao Storybook.
- Há mudanças locais não commitadas: `vitest.config.ts` modificado; `.claude/` e `.gitattributes` não rastreados.
- Outras branches relevantes: `feat/service-media-buttons` (versão anterior da feature), `fix/video-sobrescrito-ao-salvar-liturgia`, `service-plan-editor` (traz `docs/SPEC_LITURGIA_CIFRAS.md` e `docs/INTEGRAR_MAIN_MODO_PALCO.md`), `design-system-tokens` (`docs/design-system/*`, `PLANO_DS_TOKENIZACAO.md`), `modo-palco`/`fix/modo-palco-bugs`.

**Docs úteis:** `CLAUDE.md` (fluxo de PR, Vercel, Modo Palco, regra "service arrangements são cópias; URLs de referência são **ao vivo**, resolvidas do original"), `AGENTS.md` (testes), `docs/SPEC_MODO_PALCO.md`, `docs/arquitetura-plano-culto.md`, `docs/checklist-editor-culto.md`.

**Código da feature:**
| Arquivo | Papel |
|---|---|
| `components/service/ServiceView/ServiceMediaReferences/index.tsx` | Chips de vídeo (edição inline, 1 URL) e de áudio (diálogo com lista, rótulo editável, Salvar em lote). |
| `components/service/ServiceView/ServiceSongUnitView.tsx` | Renderiza o cabeçalho, as referências (se `originalArrangementId`) e a cifra. |
| `components/service/ServiceView/ServiceArrangementHeader.tsx` | Cabeçalho `sticky top-0 z-10`: título, `KeyButtonSet` (desktop), ⋮ (celular, com tom e "Editar cifras"), lápis (desktop), Salvar/Cancelar em edição. |
| `components/common/AudioPlayer/{context,Widget}.tsx` | Estado global do áudio. `play(audios, title)` → `currentIndex: 0`. Barra `fixed bottom-0 z-[9999]`, seletor de faixas, avança para a próxima ao terminar. |
| `components/common/YoutubePlayer/{context,Widget}.tsx` | Janela `fixed bottom-4 right-4 z-[9999]`, iframe de 288 px (`w-72`), título opcional, extração do id de 4 formatos de link. |
| `app/layout.tsx` | Monta os dois providers e os dois widgets na raiz. |
| `prisma/schema.prisma` | `SongArrangement.youtubeUrl String?`; `ArrangementAudio {id, arrangementId, url, label, order}` com `onDelete: Cascade`. Sem título/duração do vídeo. |
| `app/api/arrangements/[arrangementId]/route.ts` | `PATCH` aceita `youtubeUrl` e/ou `audios[]` (apaga o que não vier no array). |
| `app/api/upload-audio/route.ts` | `POST` com `formData` (tipos mp3/m4a/aac, 10 MB, `put` no Vercel Blob); `DELETE` por url. |
| `prisma/data.ts` | `hydrateArrangement`, `retrieveService`, `updateArrangement` (com `preserveMedia`), `duplicateArrangement`. |

## 2. Achados (a confirmar)

Severidade: **A** = pode quebrar o que existe ou a entrega; **M** = pode gerar bug visível; **B** = cuidado de detalhe.

### A1 (A). Upload de áudio pelo fluxo de serviço pode estar quebrado
`ServiceMediaReferences` faz `upload(path, file, { access: "public", handleUploadUrl: "/api/upload-audio" })` de `@vercel/blob/client`. Esse modo envia **JSON** para a rota (protocolo `handleUpload`, geração de token de cliente). A rota atual só faz `request.formData()` + `put()` e **não implementa `handleUpload`**. Em tese, a chamada falha com erro de parse (resposta 500) e o chip mostra "Erro ao enviar arquivo.".
O outro ponto de upload (`ArrangementInfoForm.tsx`, linhas ~209 e ~225) usa `fetch` com `FormData` e funciona com a rota como está.
A versão anterior (`ServiceMediaButtons` na `main`) já usava o mesmo `upload()`, então o problema, se real, **não nasceu nesta branch**.
**Verificar:** testar o upload no Preview; ler a documentação do `@vercel/blob` 2.x; checar se existe outra rota/handler que eu não vi. O limite de 10 MB também ultrapassa o limite de corpo de função serverless da Vercel (~4,5 MB), o que explicaria o uso do upload direto do cliente. Se confirmado, a spec precisa decidir (D10) como o upload será feito de fato (rota `handleUpload` ou upload via servidor com limite menor).

### A2 (A). "Ao vivo" pode não ser ao vivo para cópias antigas
`hydrateArrangement` faz `youtubeUrl: row.youtubeUrl ?? row.originalArrangement?.youtubeUrl` e `audios: row.audios.length ? row.audios : original.audios`. Ou seja, se a **cópia da liturgia** tiver URL ou áudios próprios, eles **ganham** do original. A criação atual da cópia (`prisma/data.ts` ~1085) não copia mídia, mas cópias antigas (ou criadas por outros caminhos) podem ter. Resultado possível: o usuário adiciona/remove no original e **a tela não muda**, ou aparece referência "fantasma" que a lixeira (que grava no original) não consegue remover.
`duplicateArrangement` (~765) copia `audios`; verificar se algum fluxo usa isso para criar cópia de liturgia.
**Verificar:** consulta somente leitura no banco local e, com autorização, no Neon (Tiago executa): quantas linhas `isServiceArrangement = true` têm `youtubeUrl` não nulo ou `ArrangementAudio`. Decidir: inverter a prioridade (original primeiro quando há `originalArrangementId`) e limpar as sobras.

### A3 (A). `PATCH` com array de áudios apaga trabalho alheio
O `PATCH` faz `deleteMany` de tudo que não está em `audios[]` e depois atualiza/cria. O cliente manda **o array que tinha ao abrir a lista**. Com salvamento imediato por ação (a proposta), duas abas ou duas pessoas ensaiando ao mesmo tempo se sobrescrevem. O diálogo atual limitava o risco por ser em lote e raro.
**Mitigação sugerida:** operações granulares (adicionar, remover, reordenar) e atualização otimista.

### A4 (A). Popover, não `DropdownMenu`
A lista tem campo de texto (link do YouTube) e dispara um `<input type="file">`. Em `DropdownMenu` do Radix: a *typeahead* captura teclas (espaço e letras) quando o foco está no campo; e clicar num item **fecha e desmonta** o conteúdo, então um `<input type="file">` renderizado dentro dele some antes do evento `change`. Usar `Popover` e manter o input de arquivo **fora** do conteúdo. O `CLAUDE.md` também alerta que UI flutuante global precisa viver na raiz por causa dos listeners de captura do `vaul`: conferir se a lista fica dentro de algum Drawer em alguma tela (não parece, no `ServiceView`).

### M1 (M). Cabeçalho sticky e `--song-header-h`
O cabeçalho atual é um bloco sticky pequeno (título + controles). O novo tem três a quatro linhas e o mapa. Se tudo ficar sticky, ocupa boa parte da tela do celular e cobre blocos ao rolar. Além disso, `--song-header-h` (medida por `ResizeObserver`) é usada como `top` da barra do editor em `SongUnitListForm` (linha ~99): mudar o que é sticky muda o deslocamento da barra do editor e a borda "stuck" (`IntersectionObserver`, `threshold: 1`). Há dois observers e testes que podem depender disso.

### M2 (M). Barra de áudio × botão Palco × aviso de desfazer
Barra: `fixed bottom-0 left-0 right-0 z-[9999]`. Palco: `fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50` (em `ServiceView/index.tsx` ~260). O botão Palco fica **atrás** da barra e coberto por ela quando o áudio toca. O aviso de desfazer (novo) também precisa de lugar e de z-index acima da barra. A janela do YouTube também fica em `bottom-4 right-4`, no mesmo canto do Palco. Falta padding no fim da página para a barra não cobrir a última linha.

### M3 (M). Player global não sabe "de quem" é a faixa
`AudioPlayerContext`: `{ audios, currentIndex, title, isOpen }`; `YoutubePlayerContext`: `{ url, title, isOpen }`. Nenhum guarda o `arrangementId`. Para realçar o botão da música que está tocando (e não o de todas) é preciso estender o contexto. `play()` também sempre usa `currentIndex: 0`: tocar "a segunda linha" exige uma faixa inicial. O widget de áudio mostra um seletor de faixas e avança sozinho; verificar como isso convive com "tocar uma linha".

### M4 (M). Revalidação global após cada ação
Hoje: `mutate((key) => key.startsWith("/api/services"))` depois de salvar. Com ações pequenas e frequentes, isso reconstrói a liturgia inteira, pode fechar popovers e perder foco/rolagem. Preferir atualização otimista do arranjo afetado.

### M5 (M). Desfazer × exclusão do Blob
Hoje `handleSave` apaga os arquivos do Blob **depois** de gravar. Com desfazer de 6 s, apagar o arquivo antes impede restaurar; apagar depois deixa órfãos se a aba fechar. Decidir política (D7). Checar se `del()` já falha silenciosamente (há `.catch(() => {})`).

### M6 (M). Mapa e o miolo da cifra
`ColumnViewer` renderiza os blocos sem `id`/âncora (usa `key` interno) e os distribui por colunas via `column-logic.ts`; a ordem visual em 2–3 colunas não é a ordem das unidades. Um mapa com rolagem exige identificar cada bloco, o que viola a "regra de ouro" sem aprovação. Tipos `TEXT` (sem cor) e blocos repetidos (`repeatCount`) precisam de regra.

### B1 (B). Regressões funcionais
- O diálogo atual permite **renomear** áudios e **editar o link** do vídeo; a nova lista só adiciona e remove.
- O chip de vídeo hoje aceita qualquer texto que o campo permita (sem validar link no cliente); o widget só mostra se conseguir extrair o id e **retorna `null` em silêncio** se falhar (o usuário clica e nada acontece).
- O limite de 10 MB é validado no cliente (e na rota, que o upload cliente não usa).

### B2 (B). Testes e stories
- Existem testes para `ServiceMediaReferences` (95 linhas) e `ServiceArrangementHeader`, e stories que dependem de `YoutubePlayerProvider`/`AudioPlayerProvider` (commit `8ad7f93`) e do formato `audios` dos mocks (`mock/*.ts`). Mudar formato exige atualizar tudo (checklist do `CLAUDE.md`).
- O `vitest.config.ts` tem alteração local não commitada; descobrir o que é antes de rodar a suíte.
- O banco local é compartilhado com o repositório `chorder` original (ver `CLAUDE.md`): não rodar `migrate deploy`; usar `db push` com cuidado.

### B3 (B). Dados do cabeçalho novo
- **Autor** = `song.artist` (nullable); **arranjo** = `arrangement.name` (nullable). Definir o que mostrar quando faltar (D9).
- "Tom do plano" = `arrangement.key` da cópia; "tom em uso" = `transposeChord(key, key, transpose)` (como o header atual). Enharmonia: `KeyButtonSet` zera a preferência enarmônica a cada mudança de tom.
- Strings: o componente atual tem pt-BR fixo; o header usa `useTranslations("ServiceView")` (`editChords`, `saveChanges`, `saveScopeTitle`, `serviceOnly`, `serviceAndOriginal`). Seguir `i18n/messages`.

### B4 (B). Outras observações
- O widget do YouTube não tem botão "abrir no YouTube"; a janela cobre a cifra no celular e não pode ficar em segundo plano (YouTube exige o player visível). A spec **mantém** isso.
- Nenhum controle de mídia existe no Modo Palco hoje (nenhuma ocorrência de `audio`/`youtube` em `components/service/StageMode`), mas os providers estão na raiz: **a mídia continua tocando se o Modo Palco for aberto com ela ligada**. Decidir se o Modo Palco fecha os players ao entrar.
- `ServiceMediaReferences` só aparece quando `arrangement.originalArrangementId` existe. Música sem original (arranjo avulso) fica **sem acesso à mídia**. Definir o comportamento.

## 3. O que eu não consegui verificar
- Se há PR aberto para `feat/referencias-midia-inline` e o estado do CI.
- O conteúdo do banco (local e Neon) e das variáveis de ambiente (`BLOB_READ_WRITE_TOKEN` está em `.env.example`).
- O comportamento real do app no celular.
- O conteúdo das branches `service-plan-editor`, `design-system-tokens` e `modo-palco` além dos nomes de arquivo (os worktrees estão com `.git` quebrado nesta máquina; a leitura foi feita só no clone principal).
