# Plano de ação — redesign da lista de Liturgias

Base: protótipo em `docs/prototipo-liturgias/liturgias-lista.html` (decisões no README dele). Premissa deste plano: a lista de baixo (histórico) mostra por padrão **dirigente, pregador(a), tema e texto bíblico e nº de músicas**; o card de "próximo culto" acompanha a altura da coluna ao lado.

## O que o código já oferece

- `GET /api/services` devolve **todas** as linhas de `Service` com o `plan` inteiro (JSON). O histórico só cresce, então o payload cresce junto.
- O `plan` guarda unidades com `arrangementId`, **não** títulos de música. Contar músicas dá para fazer no cliente (unidades `SONG`); **buscar por título de música** exige resolver `arrangementId → música` no servidor.
- A tela é `app/(main)/services/page.tsx` + `ClientServicesPage` + `ClientServiceList` → `components/service/ServiceList` e `ServiceListEntry` (usam `<a>`, ⋯ com `opacity-0` até o hover, título cinza quando sem nome). Só a página de Liturgias usa esses componentes.
- Já existem, em Músicas, os blocos reaproveitáveis: `PageTitleBlock`, `SongsFilterBar` (chips + busca + ordenação), `CategoryPicker`, `ExpandingSearch`, `SortMenu`, estado na URL (`lib/songs-list-state.ts`, `hooks/useSongsListState.ts`) e `LastUsedIndicator`.
- Ícones do sistema: dirigente = `MicVocal` (`ServiceHeader`), pregador(a) = `MessageSquare` (item Sermão em `unitConfig.ts`). Cor primária azul = `--secondary`.

## Decisões ainda abertas (precisam de resposta antes do PR C)

1. **Próximos cultos:** lista (todos no mesmo padrão) ou **card + coluna**. Recomendo card + coluna se sempre houver 2+ cultos futuros; com 0 ou 1, cai para o card sozinho.
2. **Regra de "situação"** (rascunho, incompleta, completa): sugestão = sem músicas é rascunho; futura com menos de 5 músicas é incompleta; o resto, completa. Aceitar, ajustar ou tirar do primeiro corte?
3. **Busca por música:** entra no PR B/D (precisa de endpoint) ou fica para uma segunda etapa.

## Ordem dos PRs (cada um pequeno, a partir do `main`, com `tsc` + `yarn test` e descrição em pt-BR)

### PR A — Cabeçalho e ações
- `PageTitleBlock`: `actions` passam para a linha do título, à direita (no desktop a linha de cima de 36px continua reservada, então o h1 não se move). Resolve o h1 de Liturgias no celular.
- `ServicesPageMenu` (⋯) vira **Modelos** (botão secundário, só ícone no celular) e **Nova liturgia** (botão principal no tablet/desktop; o botão flutuante continua no celular, como em Músicas). Sem componente de menu novo.
- Testes: `PageTitleBlock` (ações na linha do título, com e sem `backLink`) e o link de Modelos.

### PR B — Dados da lista (leve e pesquisável)
- Novo `retrieveServicesList()` em `prisma/data.ts` e `GET /api/services?view=list`, devolvendo só o necessário: `slug, title, date, worshipLeader, preacher, sermonTheme, sermonReference, startTime, songCount, updatedAt` e `songTitles` (uma consulta só para resolver os arranjos → músicas), sem o `plan`.
- Tipo `ServiceListItem` em `prisma/models.ts` e hook `useFetchServicesList` em `api-client.ts`. `GET /api/services` original fica como está (outros pontos podem depender dele).
- Teste de integração em `route.integration.test.ts` (o CI usa `prisma db push`); mock em `mock/`.
- Sem migration: nada muda no schema.

### PR C — Próximos cultos e linha de item
- Componente novo `ServiceRow` (data = dia da semana + número, sem mês; título em preto; dirigente com `MicVocal`; pregador(a) com `MessageSquare`; passo de linha de 22px como na lista de músicas; alinhado pelo topo; ⋯ sempre visível, com "Editar dados"; `Link` do Next no lugar de `<a>`).
- Layouts: celular em uma coluna (título, depois dirigente/pregador(a)/tema/texto/músicas em linhas); tablet em colunas; desktop (≥1000px) em **Data | Culto e dirigente | Pregador(a) e tema/texto | Músicas**. Pregador(a) vazio vira "—" na coluna e some no celular.
- **Próximos cultos:** card do próximo (altura acompanha a coluna "Depois") + coluna compacta com os demais; no celular a coluna vai abaixo. Ou lista única, conforme a decisão 1.
- Remove `ServiceList` e `ServiceListEntry` antigos ao final do PR (ou no PR E).

### PR D — Histórico: busca, filtros, ordenação, agrupamento
- Reusa `SongsFilterBar`/`CategoryPicker`/`ExpandingSearch`/`SortMenu` generalizados (ou irmãos finos): chips **Ano, Dirigente, Pregador(a)** em cima; busca e ordenação à direita no tablet/desktop e abaixo no celular. Sem ordenação por nº de músicas.
- Estado na URL (`?query=&year=&leader=&preacher=&sort=&group=`), no padrão de `songs-list-state.ts` (com testes de parse/serialize).
- Agrupamento por mês (padrão), ano, dirigente ou nada; meses antigos recolhidos ("ver mais"); busca/filtro abre tudo; contagem e "Limpar filtros"; estado vazio.
- Busca em título, dirigente, pregador(a), tema, texto e (se aprovada) títulos de música.

### PR E — Acabamento
- Checagem no celular/tablet/desktop em navegador, acessibilidade (foco, nomes dos botões, contraste do azul), `FloatingAddLink` sem cobrir o fim da lista, storybook/stories, limpeza dos componentes antigos e do CSS não usado, atualização de `CLAUDE.md`/`AGENTS.md` se algo da arquitetura mudar.

## Riscos e cuidados

- O Preview pode usar o banco de produção: **não salvar edições** ao testar.
- Conflito de arquivos com os PRs abertos (#88 mexe em `ServiceArrangementHeader`/`ServiceSongUnitView`, não nesta tela; baixo risco). `PageTitleBlock` é compartilhado: PR A precisa conferir Músicas, Catálogo, Estatísticas e Modelos.
- A lista só cresce: o PR B evita trafegar o `plan`; se o histórico ficar muito grande, paginar por ano.
- Fora de escopo: duplicar liturgia (não existe), "modelo usado" (exigiria campo novo), mostrar músicas no card.

## Sequência sugerida

A → B → C → D → E. A e B são independentes e podem ir em paralelo. Depois que o #88 e o #89 forem mesclados, alinhar o `main` local com `git fetch origin && git reset --keep origin/main`.
