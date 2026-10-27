# Plano de implementação — referências de mídia e novo cabeçalho da música

> Fase 1 da spec (`SPEC_REFERENCIAS_MIDIA.md`, seção 7). Decisões da seção 6 respondidas pelo Tiago no chat em 27/10/2026. **Aguardando aprovação — nenhum código foi alterado ainda.**

## Decisões (seção 6 + novas, resolvidas)

| # | Decisão | Resposta |
|---|---|---|
| D8 | Base da branch | Fechar o PR #65 sem mesclar; recomeçar do `main` |
| D5 | Mapa da música | Fora desta entrega — spec própria depois |
| — | Ordem API × UI | API granular de áudio primeiro, lista nova depois |
| D1 | Cabeçalho sticky | Só a linha do título; resto rola |
| D2 | Modo edição de cifra | Só Salvar/Cancelar; esconde tom e mapa; botão de referências continua visível |
| D3 | Renomear áudio | Mantém (ação secundária na linha, ao lado da lixeira) |
| D7 | Exclusão do Blob | Só depois da janela de desfazer (6s) |
| D9 | Autor/arranjo ausente | Omite o que faltar |
| D10 | Limites de upload | Mantém (MP3/M4A/AAC, 10MB) |
| i18n | Textos de mídia | Migrar para `i18n/messages` nesta entrega |
| A1 | Upload de áudio quebrado | Trocar para `fetch`+`FormData` simples, como `ArrangementInfoForm.tsx` já faz |
| Novo | Música sem arranjo original | Botão sugestivo "+ Referências" aparece sempre; ao adicionar a primeira referência, cria um arranjo mínimo (sem cifra) na hora |
| Novo | Mídia + Modo Palco | Fecha os players (áudio e vídeo) ao entrar no Modo Palco |
| D4 | Lista (técnico) | `Popover`, não `DropdownMenu` (confirmado pela leitura do risco A4) |
| D6 | Cores do mapa | Não se aplica — mapa fora de escopo |

## Fora de escopo (confirmado)

Mapa da música (D5), redesenho dos players, Modo Roteiro, miolo da cifra/`ColumnViewer`, tokens/tema, medleys/perfis, busca de título do YouTube, mais de um vídeo por música, pré-visualização de áudio antes de enviar.

## Etapas (cada uma com commit e verificação própria)

### Etapa 0 — Preparar a branch
- Fechar o PR #65 sem mesclar (`gh pr close 65`); a branch `feat/referencias-midia-inline` não entra no `main` — os chips são substituídos por completo pela lista nova.
- Nova branch a partir de `origin/main`: `feat/referencias-midia-cabecalho`.
- **Verificação:** `git log` confirma base em `main` atualizado; PR #65 aparece como "Closed" no GitHub, não "Merged".

### Etapa 1 — Corrigir o upload de áudio (A1)
- Trocar, no componente atual (`ServiceMediaReferences`), a chamada de `upload()` do `@vercel/blob/client` por `fetch` com `FormData`, igual `ArrangementInfoForm.tsx` (linhas 207-211).
- **Verificação:** subir um áudio de verdade no Preview e confirmar que aparece na lista e toca. Teste automatizado: ajustar `ServiceMediaReferences/index.test.tsx` pra mockar `fetch` em vez de `upload()`.

### Etapa 2 — API granular de áudio
- Duas rotas novas (nomes a definir na implementação, seguindo a convenção do projeto): adicionar 1 áudio a um arranjo (sem apagar os existentes) e remover 1 áudio por id. O `PATCH` atual de `youtubeUrl` continua como está (já é granular, o problema era só o array de áudios).
- Validação no servidor: tipo, tamanho, vídeo único (já existem pra vídeo; replicar/manter pra áudio).
- **Verificação:** testes de integração (`*.integration.test.ts`) cobrindo adicionar/remover concorrente (duas chamadas não apagam uma à outra). Pode ser testado manualmente com a UI atual antes da Etapa 4 existir.

### Etapa 3 — Arranjo mínimo on-demand
- Quando o botão sugestivo é acionado numa música sem `originalArrangementId`, criar um arranjo mínimo (sem cifra, tom padrão) no momento de salvar a primeira referência, e usar o id criado para a chamada da Etapa 2.
- **Verificação:** teste de integração cobrindo o caminho "música placeholder → adicionar vídeo → arranjo criado e vinculado". Teste manual: adicionar música nova sem cifra à liturgia, adicionar referência, confirmar que aparece um arranjo na lista de arranjos da música (esperado, documentado).

### Etapa 4 — Lista única (substitui os dois chips)
- Um `Popover` por música (não `DropdownMenu`, por causa do input de arquivo e do campo de texto — risco A4), com a estrutura da seção 9.4: vídeo (0-1), áudios (lista, com renomear mantido), envio em andamento, "+ Adicionar vídeo"/"+ Adicionar áudio".
- Tocar a linha reproduz e fecha a lista; lixeira remove com aviso + desfazer (6s); exclusão do Blob só depois da janela.
- Textos migrados para `i18n/messages` (namespace a decidir — provavelmente estender `ServiceView`).
- Acessibilidade: `aria-haspopup`, `aria-expanded`, Esc/Tab/Enter, anúncio `role="status"` de adicionar/remover.
- **Verificação:** reescrever `ServiceMediaReferences/index.test.tsx` cobrindo a lista nova; teste manual de teclado.

### Etapa 5 — Contexto dos players ganha `arrangementId`
- `AudioPlayerContext`/`YoutubePlayerContext` passam a guardar qual arranjo está tocando, para o botão da música certa ficar realçado (9.3) e `play()` aceitar uma faixa inicial (tocar a segunda linha começa nela, não sempre na primeira).
- Modo Palco: ao entrar, fecha os dois players (`close()` de ambos os contextos).
- **Verificação:** teste de componente no widget/contexto; teste manual tocando uma faixa que não é a primeira, e entrando no Modo Palco com algo tocando.

### Etapa 6 — Novo cabeçalho
- Reestrutura `ServiceArrangementHeader`/`ServiceSongUnitView` pra seção 9.1/9.2: título (sticky), autor·arranjo, linha de controles (tom + referências + lápis), aviso "No plano: X · Voltar ao plano".
- Celular: balão de tom (`Tom X ⌄`); desktop: `KeyButtonSet` aberto na linha.
- Recalcula `--song-header-h` só com a altura da linha sticky nova (M1).
- Remove o ⋮ do celular (tom e referências ganham botão próprio; lápis fica à vista).
- **Verificação:** `ServiceArrangementHeader.test.tsx`/`.stories.tsx` reescritos; teste manual em 360px, 768px e 1280px; conferir a barra de ferramentas do editor de cifra (`SongUnitListForm`) continua no lugar certo.

### Etapa 7 — Espaço e z-index (M2)
- Padding no fim da página enquanto a barra de áudio existir; z-index do aviso de desfazer acima de `9999`; mover o botão Palco pra não coincidir com o canto da janela do YouTube, ou dar prioridade visual a um dos dois.
- **Verificação:** teste manual com áudio tocando + remover uma referência (aviso visível) + Modo Palco acessível.

## Riscos por etapa (resumo; detalhe completo em `ANALISE.md`)

| Etapa | Risco | Mitigação |
|---|---|---|
| 1 | Upload continuar falhando por outro motivo (ex. `BLOB_READ_WRITE_TOKEN` ausente no Preview) | Testar no Preview antes de seguir pra Etapa 2 |
| 2 | API granular introduzir regressão no fluxo de áudio existente | Testes de integração antes de tocar na UI |
| 3 | Criar arranjos "fantasma" demais se o botão for clicado por engano | Só cria ao salvar de fato uma referência, nunca ao abrir a lista vazia |
| 4 | Regressão de acessibilidade/teclado em relação aos chips atuais | Roteiro de teclado no teste manual (seção 12 da spec) |
| 5 | `close()` no Modo Palco fechar mídia que a pessoa queria manter | Confirmado como comportamento desejado pelo Tiago; documentar no texto do botão se necessário |
| 6 | `--song-header-h` desalinhar a barra do editor de cifra | Testar a tela de edição de cifra manualmente depois da Etapa 6 |
| 7 | Resolver uma sobreposição e criar outra (ex. aviso cobrir o mapa — não aplicável, mapa fora de escopo) | Teste manual dedicado, com áudio tocando, ao final |

## Plano de testes

- **Unitário/componente:** `npx vitest run --project app` a cada etapa (nunca deixar quebrado entre commits).
- **Storybook:** `npx vitest run --project storybook` — novo componente de lista precisa de story própria com os dois providers (já configurados em `.storybook/preview.tsx`).
- **Integração:** novos testes para as rotas granulares de áudio (Etapa 2) e para a criação do arranjo mínimo (Etapa 3).
- **E2E/manual, aparelho real:** roteiro da spec (seção 12), rodado no Preview de cada PR relevante — pelo menos depois das Etapas 4, 6 e 7.
- `npx tsc --noEmit` antes de cada push.

## Entrega

Decidido: agrupar em 3 PRs.

1. **Dados e API** (Etapas 0, 1, 2) — fechar PR #65, nova branch, corrigir upload de áudio, API granular. Testável com a UI atual (chips), sem mudança visual.
2. **Lista de referências e novo cabeçalho** (Etapas 3, 4, 6) — arranjo mínimo on-demand (movida pra cá: só faz sentido junto do botão que a aciona), substitui os chips pela lista única em `Popover`, reestrutura o cabeçalho (tom, sticky, aviso de plano).
3. **Players e espaçamento** (Etapas 5, 7) — `arrangementId` no contexto dos players, fecha mídia ao entrar no Modo Palco, resolve sobreposição de z-index.

Cada PR segue o fluxo normal do `CLAUDE.md`: branch própria a partir de `main` atualizado, `tsc`/testes antes do push, preview da Vercel pro Tiago testar, merge só depois da aprovação.
