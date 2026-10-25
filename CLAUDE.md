# Contexto do projeto — chorder-alt

Fork do [chorder](https://github.com/henriquefreitassouza/chorder) adaptado para uso interno de uma comunidade de louvor. Ver `AGENTS.md` para arquitetura geral, stack e comandos de teste.

## O que é diferente do projeto original

- **Mudanças entram em `main` por Pull Request**: o remoto (`imelsaudedev/chorder`) rejeita push direto. Trabalhar em branch própria, abrir PR para `main` e esperar o check `CI / test` ficar verde. Ver "Fluxo de trabalho" abaixo.
- Deploy: **Vercel**. Produção é atualizada a cada merge em `main`; cada PR gera um deploy de **Preview** em HTTPS (serve para testar no celular).
- Banco de dados em **produção**: **Neon** (PostgreSQL serverless) com duas URLs (pooler + direta)
- Banco de dados **local**: PostgreSQL local em `localhost:5432`, banco `chorder` — o mesmo que o projeto original usa. Ver seção abaixo sobre conflito de migrations.
- Tema: emerald no lugar de azul

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

Substituiu o fullscreen na página do culto (spec em `docs/SPEC_MODO_PALCO.md`). Código em `components/service/StageMode/`.

- Todas as músicas do culto numa única rolagem contínua; só as músicas (`type === "SONG"`) entram, itens de outros tipos ficam de fora.
- Esconde a navegação via classe `stage-mode-active` em `<html>` + `.stage-mode-hidden` nos elementos a esconder (ver `app/globals.css`). **Não existe mais** `fullscreen-hidden` nem `:fullscreen`.
- Persistência só no aparelho (`localStorage`, via `hooks/useLocalStorageState`), chaves `modo-palco:*`: fonte única (`modo-palco:fontSize`) e velocidade por arranjo (`modo-palco:<arranjo>:scrollSpeed`). O tom não é persistido.
- Tela sempre ligada: `useWakeLock` (API nativa, **só funciona em HTTPS**; em HTTP aparece o aviso de que a tela pode apagar). Testar no Preview da Vercel ou num túnel HTTPS, não por `http://<ip>:3000`.
- Botão voltar: entrar no modo empilha uma entrada no histórico (`useStageModeHistory`); voltar fecha o modo antes de sair da página.
- Rolagem automática: `requestAnimationFrame` com acúmulo de fração de pixel (`computeScrollStep`); para no divisor da próxima música e retoma sozinha depois de rolagem manual. Velocidades 0.25x–1x, base em `useAutoScroll.ts`.

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
