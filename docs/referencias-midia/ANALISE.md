# Análise do estado atual (Fase 0) — referências de mídia e cabeçalho da música

> Escrito pelo Claude Code em 27/10/2026, lendo o código real em `D:\Repos\chorder` (branch `feat/referencias-midia-inline`, HEAD `8ad7f93`, PR #65 aberto, CI verde, preview no ar, **ainda não testado nem mesclado**). Cada achado da pré-análise foi confirmado ou refutado por leitura direta — citado com arquivo:linha.

## 5.1.A — Branch e trabalho em andamento

**PR #65 existe e está aberto** (`feat/referencias-midia-inline` → `main`), CI verde (`test`, `Vercel`, `Vercel Preview Comments`), preview em `https://chorder-7xspwi2e2-imel-saudes-projects.vercel.app`. Ainda não testado pelo Tiago nem mesclado. Esta spec chegou **antes** da aprovação — ver D8.

**Branches relacionadas, estado real (refutando/precisando a pré-análise):**

| Branch | Estado real |
|---|---|
| `feat/service-media-buttons` | **Já mesclada em `main`** há tempo (`git merge-base --is-ancestor` confirma). É a origem histórica do componente (`ServiceMediaButtons`, renomeado nesta branch para `ServiceMediaReferences`). Não há conflito: é só histórico. |
| `fix/video-sobrescrito-ao-salvar-liturgia` (#64) | Mesclada por **squash** em `main` (commit `6dc18a8`). A branch local no worktree `chorder-service-plan-editor` ainda aponta pro commit pré-squash (`6b421a1`) — por isso `git log main..branch` mostra "1 commit à frente", mas é um artefato do squash, não trabalho perdido. O conteúdo já está em `main`. |
| `fix/modo-palco-bugs` (#62) | Mesma situação: squash-mesclada, branch local do worktree `chorder-modo-palco` ainda no commit pré-squash. Sem conflito real. |
| `service-plan-editor` | `git diff origin/main...origin/service-plan-editor` vazio — **já totalmente contida em `main`** (é a base do editor de liturgia atual, PR #60). |
| `design-system-tokens` | **Não está em `origin`** (nunca teve PR aberto). Diff contra `main`: só `app/globals.css` (+78 linhas, tokens de cor aditivos) e `docs/design-system/*` (documentação). **Sem overlap** com os arquivos que esta tarefa vai tocar. Risco de conflito: baixo. |

**Refutação de um achado da pré-análise:** "os worktrees `chorder-*` estão com `.git` apontando para caminhos de outra máquina (prunable)" — **não confirmado nesta máquina**. `git worktree list` retorna os 4 worktrees com caminhos válidos (`D:/Repos/chorder-design-system`, `chorder-modo-palco`, `chorder-service-plan-editor`) e nenhum aparece como `prunable`. Pode ter sido verdade numa leitura anterior ou noutra máquina; aqui está saudável.

**Mudanças locais não commitadas** (confirmado): `vitest.config.ts` tem um bloco `server.fs.strict: false` adicionado localmente (não é da feature, é ajuste de ambiente Windows); `.claude/` e `.gitattributes` não rastreados. Nenhum dos dois pertence a esta feature.

## 5.1.B — Referências hoje (fluxo completo)

`components/service/ServiceView/ServiceMediaReferences/index.tsx` (criado nesta branch, renomeado de `ServiceMediaButtons`):

- **`YoutubeChip`**: sem vídeo → botão tracejado "Vídeo de referência" com `Plus`. Clicar entra em edição inline (`Input` + Salvar/Cancelar, sem modal) — `PATCH /api/arrangements/{originalArrangementId}` com `{ youtubeUrl }`. Com vídeo → chip vermelho com Play (toca), lápis (reabre o input) e `X` (remove, `PATCH` com `{ youtubeUrl: null }`, sem confirmação nem desfazer).
- **`AudioChip`**: sem áudio → botão tracejado "Áudio de referência". Com áudio → chip verde "Áudio de referência (N)" que toca `currentAudios[0]` via `play(currentAudios, title)` (sempre a primeira faixa — ver M3) + lápis que abre um `Dialog` com a lista completa: cada linha tem rótulo editável e lixeira (remoção fica pendente até "Salvar"); "Adicionar áudio" dispara `<input type="file">` fora do `Dialog`; ao salvar, `PATCH` manda o **array inteiro** de `audios` (ver A3) e só depois apaga do Blob os itens pendentes de remoção (ver M5).
- Ambos sempre operam sobre `originalArrangementId` (nunca a cópia da liturgia) e revalidam com `mutate(key => key.startsWith("/api/services"))` (ver M4).

`ServiceSongUnitView.tsx` (linha ~72-79 nesta branch): renderiza `ServiceArrangementHeader`, depois `ServiceMediaReferences` (só se `arrangement.originalArrangementId` existir — ver achado B4 abaixo), depois o formulário de edição ou `ArrangementView`, **nessa ordem**, sem fazer parte do cabeçalho sticky.

`ServiceArrangementHeader.tsx`: depois desta branch, **não tem mais nenhuma referência de mídia** — só título, `KeyButtonSet` (desktop) / ⋮ com tom e "Editar cifras" (celular), lápis (desktop), e Salvar/Cancelar em edição.

`ServiceSongUnitEditForm.tsx`: usa `useCreateOrUpdateArrangement(id, { preserveMedia: true })` tanto para a cópia quanto para o original (linhas 51-54) — por isso salvar a cifra nunca mais sobrescreve mídia (regressão do #64 já coberta).

## 5.1.B — Players

- `components/common/AudioPlayer/context.tsx`: `{ audios, currentIndex, title, isOpen }`; **não guarda `arrangementId`**. `play(audios, title)` sempre fixa `currentIndex: 0` (confirmado, context.tsx:29-30).
- `components/common/AudioPlayer/Widget.tsx`: barra `fixed bottom-0 left-0 right-0 z-[9999]` (linha 27), com seletor de faixas (`switchTo`) e avanço automático (`onEnded` chama `handleNext` se houver próxima, linha 56) — isso já existe e **convive mal** com "tocar uma linha abre direto aquela faixa" só porque falta uma faixa inicial no `play()`.
- `components/common/YoutubePlayer/context.tsx`: `{ url, title, isOpen }`, mesma ausência de `arrangementId`.
- `components/common/YoutubePlayer/Widget.tsx`: janela `fixed bottom-4 right-4 z-[9999]` (linha 29), `w-72` (288px), tem `extractYoutubeId` com os 4 padrões de link citados na spec (linhas 6-18) — **é a função a reaproveitar em 9.5**.
- `app/layout.tsx`: monta os dois providers e os dois widgets na raiz (confirmado, consistente com a regra do `CLAUDE.md` sobre UI flutuante global).

## 5.1.B — Dados e API

- `prisma/schema.prisma`: `SongArrangement.youtubeUrl String?`; `ArrangementAudio { id, arrangementId, url, label, order }`, `onDelete: Cascade`. Sem título/duração do vídeo — confirma D4 (sem metadado pra exibir nome do vídeo).
- `app/api/arrangements/[arrangementId]/route.ts`, `PATCH` (linhas 45-84): aceita `youtubeUrl` e/ou `audios[]`; para áudios faz `deleteMany` de tudo que não estiver no array enviado, depois `update`/`create` um por um. **Confirma A3**: um `PATCH` com o array desatualizado apaga qualquer áudio adicionado por outra aba/pessoa entre a abertura da lista e o salvar.
- `app/api/upload-audio/route.ts`: `POST` faz `request.formData()` + `put()` da API de servidor `@vercel/blob` (não a de cliente) — ver A1 abaixo, achado confirmado com evidência nova.
- `prisma/data.ts`: `hydrateArrangement` (linha 794-800): `youtubeUrl: row.youtubeUrl ?? row.originalArrangement?.youtubeUrl ?? null` — **a cópia da liturgia tem prioridade sobre o original quando teria algum valor próprio**. Mas a criação de cópia de liturgia (linha 1092-1103, dentro de `persistServicePlan`/equivalente) **nunca grava `youtubeUrl`/`audios`** na cópia — logo, em cópias criadas pelo fluxo atual, a cópia nasce sempre vazia e a priorização nunca entra em jogo na prática. O risco é só para **cópias antigas**, de antes do `preserveMedia` (#64) existir, que possam ter recebido mídia própria por um save de cifra sem essa proteção. **Precisa de consulta somente leitura no banco (local e, com autorização do Tiago, Neon) para confirmar se existe alguma.** Não executei essa consulta — está fora do que devo fazer sem autorização explícita.
- `duplicateArrangement` (linha 739-...): função **diferente**, duplica um arranjo dentro do catálogo de músicas (não relacionada à cópia de liturgia); não é usada no fluxo de "adicionar música ao culto".

### A1 — CONFIRMADO: upload de áudio pelo fluxo de referências está quebrado

Evidência nova, decisiva: `ArrangementInfoForm.tsx` (linhas 207-211), que **funciona** (upload de áudio na tela padrão de edição de arranjo), usa `fetch` com `FormData` simples — exatamente o que a rota `app/api/upload-audio/route.ts` espera (`request.formData()`). Já `ServiceMediaReferences` (e antes, `ServiceMediaButtons`) usa `upload()` de `@vercel/blob/client` (pacote na versão `2.4.0`, confirmado em `package.json:62`) com `handleUploadUrl: "/api/upload-audio"` — esse helper de cliente, na v2, implementa o protocolo `handleUpload` (gera um token assinado chamando a rota com um corpo JSON, faz upload direto pro Blob, depois chama a rota de novo com `blob.upload-completed`). A rota atual **não implementa esse protocolo** — só sabe ler `formData()`. Uma chamada da `ServiceMediaReferences` tentando subir áudio deve falhar já na primeira etapa (a rota tenta `request.formData()` num corpo JSON, o que ou lança ou devolve um resultado inútil). **Isso é um bug pré-existente, herdado do `main` antes desta branch** — não foi introduzido pelo PR #65, mas qualquer spec nova que mantenha upload de áudio herda esse problema até ser corrigido.

**Ainda não testei isso no Preview** (testar upload real exigiria usar a feature, o que o Tiago ainda não fez). Recomendo testar isso especificamente no roteiro de teste manual antes de mesclar o PR #65 atual, independente desta spec nova.

## 5.1.C — Cabeçalho e cifra hoje

- Cabeçalho: `sticky top-0 z-10` (`ServiceArrangementHeader.tsx`), com `ResizeObserver` publicando `--song-header-h` em `ServiceSongUnitView.tsx:52` e `IntersectionObserver` (`threshold: 1`) pra borda "stuck" (linhas 36-44). **Confirmado**: `--song-header-h` é consumido em `components/song/ArrangementForm/SongUnitListForm/index.tsx:99` (`style={{ top: "var(--song-header-h, 0px)" }}`) — é o `top` da barra de ferramentas do editor de cifra. Qualquer mudança no que é sticky ou na altura do cabeçalho precisa manter essa variável coerente, senão a barra do editor flutua no lugar errado.
- Tom: `SongConfig` eleva `transpose` até `ServiceView/index.tsx`; `arrangement.key` é o tom da **cópia** (gravado quando a música entra na liturgia), e é isso que a spec chama de "tom do plano".
- Blocos: `ColumnViewer/index.tsx` usa `key={`unit-${unitIdx}`}` (índice dentro da coluna, não um id estável) e distribui as unidades entre colunas via `findBestDistribution` (`column-logic.ts`), um algoritmo de balanceamento de altura que **pode reordenar visualmente** (ex.: a unidade 5 pode aparecer no topo da coluna 2 enquanto a unidade 3 ainda está na coluna 1). **Confirma M6 com precisão**: não há nenhum id/âncora hoje; criar um exige tocar neste arquivo. Além disso, unidades do tipo `TEXT` não têm cor (`unitColorClasses` não as cobre com uma cor de bloco) e blocos repetidos (`repeatCount > 1`) aparecem **uma vez só** com um selo "×N" — então o mapa (9.9) precisa de uma regra própria pra esses dois casos, que a spec não define.
- Botão Palco: `components/service/ServiceView/index.tsx:260`, `fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50`.
- Nenhum controle de mídia existe em `components/service/StageMode/*` (busca por `audio|youtube` não encontrou nada) — **confirma B4**: Modo Palco já não tem nenhum controle, mas os providers são globais (`app/layout.tsx`), então **se uma mídia estiver tocando e o usuário entrar no Modo Palco, ela continua tocando** (não testei ao vivo, é inferência direta do código: nada em `StageMode` chama `close()`).
- i18n: `ServiceView` em `i18n/messages/pt-BR.json:119-127` só tem chaves de salvar/editar cifra (`editChords`, `saveScopeTitle`, `serviceOnly`, `serviceAndOriginal`, `cancelEdit`, `saveChanges`, `saveError`) — **nenhuma chave de mídia**. `ServiceMediaReferences` usa só texto pt-BR fixo no componente. Confirma B3: não segue a convenção de `useTranslations` que o resto do cabeçalho usa.

### M2 — CONFIRMADO com precisão: colisão de z-index/posição

- Barra de áudio: `fixed bottom-0 left-0 right-0 z-[9999]` (full-width).
- Janela do YouTube: `fixed bottom-4 right-4 z-[9999]`.
- Botão Palco: `fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50`.

No celular, a janela do YouTube e o botão Palco usam **exatamente o mesmo canto** (`bottom-4 right-4`), e o Palco perde porque seu z-index é menor. A barra de áudio cobre a largura toda, então qualquer coisa na borda inferior (inclusive o futuro aviso de desfazer) fica atrás dela se não ganhar z-index maior ou um deslocamento.

## 5.1.D — Dados de produção

**Não consultei o banco** (nem local nem Neon) — a spec e as instruções do projeto pedem autorização explícita antes de qualquer leitura em produção, e mesmo a leitura local exigiria rodar contra um banco compartilhado com o `chorder` original. Isto fica como pendência: **antes de aprovar o plano**, alguém com acesso precisa rodar uma consulta somente leitura (ex. `SELECT count(*) FROM "SongArrangement" WHERE "isServiceArrangement" = true AND "youtubeUrl" IS NOT NULL`, e o equivalente para `ArrangementAudio` ligado a arranjos com `originalArrangementId` não nulo) pra decidir se A2 é um problema real ou só teórico.

## 5.1.E — Testes e stories afetados

Direto, sem precisar de leitura adicional (editados nesta própria sessão):

- `components/service/ServiceView/ServiceMediaReferences/index.test.tsx` — 6 testes, cobre estado vazio, chip com mídia, edição inline de vídeo (sem modal), salvar/remover via `PATCH`, abertura do diálogo de áudio. **Toda a estrutura muda** se a lista virar um popover único (9.4) em vez de dois chips independentes.
- `components/service/ServiceView/ServiceArrangementHeader.test.tsx` — os testes de mídia foram removidos nesta branch (mídia saiu do componente); os testes restantes (pencil, scope dialog, isSaving) **mudam bastante** se o cabeçalho ganhar a estrutura de 4-6 linhas da seção 9.1 e o seletor de tom virar botão próprio (hoje é `KeyButtonSet` direto no desktop e dentro do ⋮ no celular).
- `components/service/ServiceView/ServiceSongUnitView.test.tsx`/`.stories.tsx` — mocka `./ServiceMediaReferences` como `<div data-testid="media-references" />`; continua válido desde que o nome do arquivo/export não mude.
- `.storybook/preview.tsx` — agora tem `YoutubePlayerProvider`/`AudioPlayerProvider` globais (commit `8ad7f93`, desta sessão); qualquer novo componente de mídia precisa continuar dentro desse decorator.
- `mock/arrangements.ts`, `mock/service.ts` — já têm `youtubeUrl`/`audios` no formato atual; se o formato do tipo `Audio` mudar (ex. operações granulares em vez de array completo, seção 10), todos os mocks e stories que usam esses arquivos precisam de atualização (checklist do `CLAUDE.md`).

## 5.2 — Leitura crítica

### 1. O que a spec presume e o código desmente?

- A pré-análise presumiu que os worktrees estão com `.git` quebrado/prunable — **refutado** nesta máquina (seção 5.1.A).
- A pré-análise listou `feat/service-media-buttons` e `fix/video-sobrescrito-ao-salvar-liturgia` como branches "relacionadas" sem deixar claro que já estão mescladas — **esclarecido**: zero conflito real, são apenas histórico ou artefato de squash.
- A2 (prioridade da cópia sobre o original) é presumida como risco ativo; o código mostra que **a criação normal de cópia nunca grava mídia própria**, então o risco só existe para dados históricos — não é um bug ativo do fluxo atual, é uma pergunta de dados (precisa de consulta, seção 5.1.D).

### 2. O que não foi previsto?

- **Arranjo sem original** (`arrangement.originalArrangementId` nulo): hoje `ServiceMediaReferences` simplesmente não renderiza (`ServiceSongUnitView.tsx`, `{arrangement.originalArrangementId && (...)}`). A spec não diz o que o novo botão de referências deve fazer nesse caso — ocultar o botão inteiro (atual) ou desabilitá-lo com alguma explicação? Confirma B4, mas falta decisão.
- **Modo edição de cifra**: D2 já cobre isso, mas a spec não detalha se o aviso "No plano: X" e o mapa continuam visíveis durante a edição (hoje nenhum dos dois existe, então é território novo).
- **Múltiplas músicas tocando mídia na mesma página**: a spec pede (9.8) que o contexto saiba "qual arranjo" está tocando pra realçar o botão certo, mas não diz o que fazer se o usuário voltar pra uma música cujo áudio já não existe mais (foi removido por outra aba enquanto tocava) — o player deveria fechar sozinho, mas isso depende de um link entre o contexto e os dados atualizados do arranjo, que hoje não existe.
- **Tablet** (mencionado como caso a cobrir em 5.2.2, mas a spec só define regras para "celular" e "desktop"): a spec não diz em que largura o layout troca de celular pra desktop — hoje o projeto usa breakpoints Tailwind padrão (`sm`/`md`/`lg`) em vários lugares (`ColumnViewer` usa `640px`/`1024px`/`1280px` pra colunas); a spec não ancora a nenhum desses.

### 3. O que pode quebrar?

| Risco | O que quebra | Condição | Como detectar | Mitigação |
|---|---|---|---|---|
| Upload de áudio (A1) | Qualquer tentativa de adicionar áudio pela lista nova | Sempre, se a rota não mudar | Testar upload real no Preview | Trocar pra `handleUpload` de verdade na rota, ou voltar a usar `fetch`+`FormData` como `ArrangementInfoForm` já faz (mais simples, sem token de cliente) |
| `--song-header-h` (M1) | Barra de ferramentas do editor de cifra flutua na altura errada | Cabeçalho ganha mais linhas e só o título fica sticky (D1) | Teste visual/manual na tela de edição de cifra | Recalcular `--song-header-h` só com a altura da parte que continua sticky, não do cabeçalho inteiro |
| z-index (M2) | Aviso de desfazer e/ou botão Palco ficam inacessíveis atrás da barra/janela | Áudio ou vídeo tocando ao mesmo tempo que se remove uma referência | Teste manual: tocar áudio, remover uma referência, checar se o aviso aparece visível | Padding no fim da página (já previsto em 9.8) + z-index do aviso maior que `9999`, ou mover o Palco de canto |
| `PATCH` de áudios (A3) | Duas pessoas/abas editando a mesma música perdem o trabalho uma da outra | Salvamento em lote do array inteiro, que a spec quer trocar por operações granulares (9.6) | Difícil de testar sozinho; revisão de código da nova API | Implementar a API granular (adicionar/remover individual) antes ou junto da lista nova |
| Mapa sem id estável (M6) | Rolar até o bloco certo pode levar ao bloco errado se a ordem visual ≠ ordem dos dados | Qualquer culto com 2+ colunas | Teste manual em celular (1 coluna, sem risco) vs. desktop (2-4 colunas) | Decidir D5 primeiro; se aprovado, dar um id estável por unidade (não por posição de coluna) |
| Testes/stories (B2) | Suite de testes quebra em massa | Qualquer mudança de estrutura do componente de referências ou do cabeçalho | `npx vitest run --project app` e `--project storybook` depois de cada etapa | Atualizar testes na mesma etapa que o componente, não depois |

### 4. A solução proposta é a melhor para este código?

Em linhas gerais, sim — a spec já incorpora a lição do PR #65 (mídia como ponto único, independente da edição de cifra) e vai além ao propor uma lista única em vez de dois chips, o que resolve um problema real: hoje, com dois chips lado a lado, a "aparência limpa" que o Tiago quer (seção 2) já começa a ficar apertada no celular com vídeo + áudio + edição inline simultânea. Duas ressalvas:

- **O mapa da música (9.9) é a peça de maior risco e menor relação custo/benefício desta entrega.** Exige tocar o único lugar do código que hoje não tem nenhum id estável (`ColumnViewer`), com uma ordem visual que diverge da ordem dos dados. Nenhum outro item da spec depende do mapa. Separar o mapa numa entrega própria (D5) reduz o risco desta spec a quase zero no "miolo da cifra".
- **A API granular (seção 10) é pré-requisito, não consequência, da lista nova.** Construir a lista de referências sobre o `PATCH` atual (array inteiro) e trocar a API depois duplica trabalho — qualquer teste manual feito com a API antiga vai precisar ser refeito. Recomendo inverter a ordem sugerida na seção 7 ("dados e API, depois lista") para garantir que a API granular realmente vem primeiro, não em paralelo.

### 5. O que contraria o `CLAUDE.md`/`AGENTS.md`?

- Nada na spec contraria a regra de UI flutuante global (os players já vivem em `app/layout.tsx`; a spec não propõe movê-los).
- A spec pede textos novos em pt-BR fixo nos exemplos da seção 9.10, mas o `CLAUDE.md` não tem uma regra explícita de "sempre usar `useTranslations`" — o próprio componente atual (`ServiceMediaReferences`) já usa texto fixo, então isso é uma inconsistência **pré-existente**, não introduzida por esta spec. Vale decidir se esta entrega migra pra `i18n/messages` ou mantém o padrão atual (texto fixo) — não é um conflito, é uma oportunidade não explicitada.
- Checklist de campo novo Prisma (`CLAUDE.md`): se a API granular (seção 10) precisar de novo campo ou tabela, o checklist de 8 passos se aplica; a spec já menciona isso na seção 10, só reforçando aqui.
