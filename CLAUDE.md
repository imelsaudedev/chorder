# Contexto do projeto — chorder-alt

Fork do [chorder](https://github.com/henriquefreitassouza/chorder) adaptado para uso interno de uma comunidade de louvor. Ver `AGENTS.md` para arquitetura geral, stack e comandos de teste.

## O que é diferente do projeto original

- **Mudanças entram em `main` por Pull Request**: o remoto (`imelsaudedev/chorder`) rejeita push direto. Trabalhar em branch própria, abrir PR para `main` e esperar o check `CI / test` ficar verde. Ver "Fluxo de trabalho" abaixo.
- Deploy: **Vercel**. Produção é atualizada a cada merge em `main`; cada PR gera um deploy de **Preview** em HTTPS (serve para testar no celular).
- Banco de dados em **produção**: **Neon** (PostgreSQL serverless) com duas URLs (pooler + direta)
- Banco de dados **local**: PostgreSQL local em `localhost:5432`, banco `chorder` — o mesmo que o projeto original usa. Ver seção abaixo sobre conflito de migrations.
- Tema: azul da marca (`--secondary`) e laranja de destaque raro (`--accent`). Design system (tokens, escala, padrões de lista/filtros, plano do modo escuro): `docs/design-system.md` e a página `/design-system` (só Admin). Mudou um token ou padrão? Atualizar os dois.

## Fluxo de trabalho

1. `git switch -c <tipo>/<assunto> origin/main` — nunca commitar direto em `main`.
2. Antes de abrir o PR: `npx tsc --noEmit` e `yarn test` (ou `npx vitest run --project app`, que não precisa de banco).
3. `git push -u origin <branch>` e abrir o PR para `main`, com descrição em pt-BR.
4. Conferir o check `CI / test` e o deploy de Preview da Vercel; testar no preview quando a mudança é de UI/mobile.
5. Depois do merge, alinhar o `main` local: `git fetch origin && git reset --keep origin/main` (o `--keep` preserva alterações não commitadas).

**Vercel:**
- O Node.js do projeto é definido no painel (*Settings → Build and Deployment → Node.js Version*), hoje **24.x**. Quando uma versão é descontinuada, o deploy falha logo no início com a mensagem "Node.js Version … is discontinued" — a correção é no painel, não no código.
- O comando de build e o `ignoreCommand` vêm de `vercel.json` e sobrepõem o painel; "Overridden" nessas telas é esperado, não editar lá.
- O check `Vercel` do PR reflete o commit mais recente da branch; um deploy reexecutado de um commit anterior não o deixa verde.
- O preview pode usar o mesmo banco da produção: não salvar edições de músicas/cultos ao testar.

## Variáveis de ambiente

O projeto precisa de **duas** URLs do Neon:

```
DATABASE_URL=  # URL do pooler (para queries da app)
DIRECT_URL=    # URL direta sem "-pooler" (para prisma migrate deploy)
```

O `schema.prisma` usa `directUrl = env("DIRECT_URL")`. O Vercel tem ambas configuradas.

## Banco de dados local compartilhado com chorder

O `chorder` e o `chorder-alt` apontam para o **mesmo banco PostgreSQL local** (`chorder`). Como cada repo tem seu próprio histórico de migrations (migrations com timestamps e nomes diferentes para as mesmas colunas), o banco pode ficar em estado inconsistente quando se trabalha nos dois repos no mesmo ambiente.

**Diagnóstico:** `npx prisma migrate status` — mostra migrations pendentes e migrations no banco que não existem localmente.

**Solução local:** usar `prisma db push` em vez de `prisma migrate deploy`. O `db push` sincroniza o schema sem tocar no histórico de migrations, adicionando colunas faltantes sem reclamar de conflitos:

```bash
npx prisma db push --skip-generate
npx prisma generate          # se o dev server não estiver rodando
```

**Cuidado com perda de dados:** se o banco local tiver colunas/tabelas de outra branch (ex.: liturgia/planejamento de culto), o `db push` avisa que vai **apagá-las** ("There might be data loss"). Responder **não** e conferir antes, sem alterar nada: `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script`. Se o diff só remove coisas e não falta nada para a branch atual, não precisa do `db push`.

**Não usar `prisma migrate deploy` localmente** neste repo quando o banco tiver migrations do chorder — vai falhar por conflito de histórico. O `migrate deploy` é usado apenas no Vercel (via `DIRECT_URL`) onde o banco é exclusivo deste fork.

## Comandos essenciais

```bash
yarn dev                    # dev server local (usa cross-env, roda nativo no Windows)
npx tsc --noEmit           # checar TypeScript — rodar antes de todo push
npx prisma migrate dev     # criar nova migration (ambiente limpo ou devcontainer)
npx prisma db push         # sincronizar schema no banco local (ambiente compartilhado com chorder)
npx prisma migrate deploy  # aplicar migrations no Neon em prod (usar DIRECT_URL)
```

## Padrões obrigatórios

### Zod para campos Prisma

| Tipo Prisma | Schema Zod | Tipo resultante |
|---|---|---|
| `String` | `z.string()` | `string` |
| `String?` | `z.string().nullable()` | `string \| null` |

**Nunca usar `.optional()`, `.nullish()`, `.transform()` ou `.default()` em schemas usados com `zodResolver`.** Causa split de tipos input/output que quebra o react-hook-form.

Para campos de texto opcionais no form (como URLs):
```ts
youtubeUrl: z.string().url().or(z.literal("")).nullable()
// defaultValues: youtubeUrl: arrangement?.youtubeUrl ?? ""
```

### Botões dentro de formulários

```tsx
<Button type="button" onClick={...}>  // sempre type="button" se não for submit
```

### Ações sem permissão: esconder, não desabilitar

O que a pessoa não pode usar **some** da tela (nada de botão apagado com dica: no celular a dica nem aparece). A regra é por **permissão**, não por login. Em componentes use `useViewer()` (`components/auth/ViewerProvider.tsx`, alimentado pelo layout com os perfis vindos de `getLiveUserAuth`, que já considera a simulação de perfis do Admin): `canEditSongs`, `canViewChurchServices`, `canSeeUsageStats`, `isAdmin`. Sem provedor (testes, histórias) vale o visitante. Esconder na tela **não é segurança**: a rota do servidor continua recusando (`requirePermission`, `requireSongEditor`). **Uso das músicas** ("Último uso", "Uso em liturgias", contagem) é só da equipe (`canSeeUsageStats`): o `/api/songs` só devolve esses dados à equipe e o `/stats` é só Admin.

### Cifra e referências dentro da liturgia

**Cifra da cópia ("Só nesta liturgia"):** quem edita a liturgia (dona, compartilhada com permissão de editar, ou equipe numa liturgia da igreja) pode salvar a cifra da *cópia* do arranjo que está nela, mesmo sem editar músicas. O servidor (`POST /api/arrangements/[id]?preserveMedia=true`, via `lib/arrangement-copy-access.ts`) só aceita se a cópia pertence a uma liturgia que a pessoa edita, e grava só a cifra: nunca a música (título, autor, letra), o original ou as mídias. **"Na liturgia e no original"** e **referências** (vídeo e áudio: adicionar, renomear, remover) são só de quem edita músicas (`canEditSongs`); os demais só ouvem e assistem, e o botão some quando não há referência. O lápis "Editar cifras" some para quem só visualiza a liturgia (`useCanEditService`).

### Quem conduz e quem prega

**Dirigente** pode ser mais de uma pessoa (liturgia da igreja e pessoal): tabela `ServiceLeader` (`userId` opcional + `name` + `order`), editada por `components/service/PeopleField`. Sem conta, entra só o nome (convidado). O texto `Service.worshipLeader` ("Hugo, Ana e Caio") é **derivado** da lista no `createOrUpdateService` (`lib/service-leaders.ts`) e é o que a lista, a busca e o `GET /api/services` leem; filtros e estatísticas usam `leaders` (um nome por pessoa). Culto antigo sem a lista vale como um dirigente sem conta (`leadersOf`) e vira lista no próximo salvamento: não há backfill. Apagar a conta mantém o nome (`onDelete: SetNull`). **Pregador, tema e texto não são da liturgia: ficam só no item Sermão do roteiro** (`metadata.preacher` + `metadata.preacherId` opcional, `label` = tema, `metadata.reference`); culto só de canções não tem pregador. A gaveta da liturgia e o "Editar dados" não pedem pregador. A lista, o cabeçalho do editor, a busca e os filtros leem do item por `lib/sermon-summary.ts` (vários sermões: pregadores juntos, tema e texto do primeiro). As antigas colunas `Service.preacher`, `sermonTheme` e `sermonReference` **não existem mais** (migration `20261128000000`); em produção estavam vazias ou repetiam o item Sermão. `ServiceListItem.preacher/sermonTheme/sermonReference` são só o resumo derivado do plano. `GET /api/people?q=&for=leader|preacher` devolve só id, nome e foto a qualquer pessoa logada (nunca e-mail); com o campo vazio, quem vem primeiro é quem **conduziu** (`ServiceLeader`) ou quem **pregou** (itens Sermão dos últimos 40 cultos publicados da igreja; item só com o nome vira conta se bater exatamente com o de alguém); `/api/admin/users` segue só do Admin.

### Perfis de liturgia (Igreja × Pessoal)

O que muda entre uma liturgia da igreja e uma pessoal (título obrigatório, modelos, pregador, "dirigente" × "quem conduz") fica em `lib/service-profile.ts`, derivado do `scope`. Telas e formulários consultam `serviceProfile(scope)` em vez de testar `scope === "PERSONAL"`. Perfil novo = entrada nova no registro. Título em branco é gravado como nulo e aparece como "Sem título". O registro também define os tipos de item do menu "Adicionar item" (pessoal: Música, Leitura, Oração, Fala, Outro), a seção inicial ("Roteiro", sem escolha de tipo) e o aviso ao salvar; o editor lê o perfil por `useServiceProfile()`.

### UI flutuante global (modais, players, toasts)

Componentes que precisam aparecer sobre Drawers e headers com `backdrop-filter` devem ser renderizados no **nível do layout raiz** via contexto React, não via `createPortal`. Drawers (vaul) têm listeners de captura no `document` que bloqueiam eventos em portais.

```tsx
// app/layout.tsx
<MeuProvider>
  {children}
  <MeuWidgetGlobal />
</MeuProvider>
```

## Arquitetura: Modo Palco

Substituiu o fullscreen na página do culto (spec original e histórica em `docs/SPEC_MODO_PALCO.md`; o comportamento atual está aqui). Código em `components/service/StageMode/`.

- Entrada: botão `variant="secondary"` com ícone Maximize na tela do culto. Pede **tela cheia real** (Fullscreen API) com fallback silencioso (iPhone/Safari não tem); sair pelo sistema fecha o Palco.
- Todas as músicas do culto numa única rolagem contínua. Por padrão só `type === "SONG"` entra; com **Exibir roteiro** ligado (`modo-palco:showRoteiro`, off por padrão) os demais itens aparecem como `StageRoteiroItem`, a rolagem pausa em cada um e há vão de 2em entre música e conjunto de itens.
- Cabeçalho: só informação (título e mapa da música). Rodapé no padrão do sistema: − ▶ + (velocidade), seletor Rolagem/Geral, Configurações (Popover, padrão do `ServiceConfig`) e Sair.
- **Visão geral** (`StageOverview`): a música inteira numa tela, com encaixe automático de colunas × densidade. Constantes (piso 11px, conforto 14px, 300px/coluna, ≤70% de altura para 1 coluna, tolerância 1px) **ainda sem calibração em aparelho**. Ajustes manuais por música (colunas, fonte, densidade, cada um com Auto). Navegação por ◀ n/N ▶, setas/PageUp/PageDown e deslizar na vertical.
- Esconde a navegação via classe `stage-mode-active` em `<html>` + `.stage-mode-hidden` nos elementos a esconder (ver `app/globals.css`). **Não existe mais** `fullscreen-hidden` nem `:fullscreen`. A área rolável usa `no-scrollbar` (sem barra visível) para alinhar com cabeçalho e rodapé.
- Persistência só no aparelho (`localStorage`, via `hooks/useLocalStorageState`), chaves `modo-palco:*`: `fontSize` (fonte única), `showRoteiro`, `layout`, `mode` (Cifra/Letra/Convenções/Texto, único para todas as músicas, no popover de Configurações), `<arranjo>:scrollSpeed` e `<arranjo>:overview`. O **tom** também é só do aparelho, mas fora do prefixo `modo-palco:` porque vale na tela do culto e no Palco: `culto-tom:<arranjo>` (`components/service/ServiceView/useServiceTransposes.ts`). O tom do culto (`semitoneTranspose`, no banco) é decidido em grupo e ninguém o altera por aqui; o ajuste de cada pessoa guarda `{ value, base }` e deixa de valer se o tom do culto mudar (`base` diferente). O seletor de tom mostra um ponto e "Voltar ao do culto" quando o do aparelho difere do culto.
- Tela sempre ligada: `useWakeLock` (API nativa, **só funciona em HTTPS**; em HTTP aparece o aviso de que a tela pode apagar). Testar no Preview da Vercel ou num túnel HTTPS, não por `http://<ip>:3000`.
- Atualização automática: `hooks/useAutoRevalidate.ts` reconsulta (SWR `mutate`) a cada ~20s, só com a aba visível e com rede, o culto (`ServiceView` e Palco) e a cifra da página da música, para uma correção feita em outro aparelho aparecer sem recarregar. Pausa com edição com alterações abertas e com a **rolagem automática do Palco ligada** (o Palco avisa por `onAutoScrollChange`); volta na consulta seguinte. Para também após **30 min sem interação** (toque, clique, tecla, roda) para uma aba esquecida não manter o Neon acordado; ao voltar a usar a tela, consulta na hora. Ainda não cobre a aba Roteiro nem as listas. Cada consulta acorda o Neon (serverless).
- Atalhos de teclado e pedal (`useStageKeyboard`): ↑/↓ música anterior/próxima; ← / → velocidade da rolagem automática (na visão geral, ←/→ e PageUp/PageDown trocam de tela, como ↑/↓). Ignorados em campos, janelas e com Ctrl/Cmd/Alt/Shift.
- Botão voltar: entrar no modo empilha uma entrada no histórico (`useStageModeHistory`); voltar fecha o modo antes de sair da página.
- Rolagem automática: `requestAnimationFrame` com acúmulo de fração de pixel (`computeScrollStep`); para no divisor da próxima música e retoma sozinha depois de rolagem manual. Velocidades 0.25x–1x, base em `useAutoScroll.ts`.
- Blocos podem ser minimizados (chevron no cabeçalho do bloco), também no Palco; estado em `collapsed-units:<arrangementId>` por **posição** do bloco (`hooks/useCollapsedUnits.ts`) — reorganizar a cifra pode deslocar quais aparecem minimizados.

## Checklist ao adicionar campo a um modelo Prisma

1. `prisma/schema.prisma` — adicionar campo
2. Rodar `npx prisma migrate dev` — criar migration
3. `schemas/arrangement.ts` (ou schema correspondente) — adicionar campo Zod
4. `components/.../useXxxForm.ts` — adicionar ao `defaultValues`
5. `prisma/data.ts` — adicionar ao select/update
6. `mock/*.ts` — adicionar campo em todos os objetos
7. `**/*.stories.tsx` e `**/*.test.tsx` — adicionar campo em objetos inline
8. Rodar `npx tsc --noEmit` — zero erros antes de commitar

**Busca rápida para encontrar todos os pontos de impacto:**
```bash
grep -r "ClientArrangement\|isServiceArrangement" --include="*.ts" --include="*.tsx" -l
```

## Arquitetura: service arrangements

Service arrangements são **cópias** dos originais (`isServiceArrangement: true`, `originalArrangementId`). Ao adicionar um campo novo, decidir:

- **Congelado** (copiado no momento de adicionar ao service): tom, nome
- **Ao vivo** (sempre resolve do original): URLs de referência, conteúdo editorial

Para campos "ao vivo", resolver no `retrieveService` em `prisma/data.ts`:
```ts
originalArrangement: { select: { campoNovo: true } }
// ...
campoNovo: unit.arrangement.campoNovo ?? unit.arrangement.originalArrangement?.campoNovo ?? null
```

## O que NÃO incluir no tsconfig

Scripts em `prisma/seed/` têm imports locais e caminhos absolutos Windows que não existem no Vercel. Já estão excluídos em `tsconfig.json`:

```json
"exclude": ["node_modules", "prisma/seed"]
```

Manter essa exclusão ao adicionar novos scripts de seed.

## Mensagens de commit

Sempre em **português (pt-BR)**.
