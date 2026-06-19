# Contexto do projeto — chorder-alt

Fork do [chorder](https://github.com/henriquefreitassouza/chorder) adaptado para uso interno de uma comunidade de louvor. Ver `AGENTS.md` para arquitetura geral, stack e comandos de teste.

## O que é diferente do projeto original

- Push direto em `main` (sem feature branches ou PRs)
- Deploy: **Vercel**, automático a cada push em `main`
- Banco de dados em **produção**: **Neon** (PostgreSQL serverless) com duas URLs (pooler + direta)
- Banco de dados **local**: PostgreSQL local em `localhost:5432`, banco `chorder` — o mesmo que o projeto original usa. Ver seção abaixo sobre conflito de migrations.
- Tema: emerald no lugar de azul

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

**Não usar `prisma migrate deploy` localmente** neste repo quando o banco tiver migrations do chorder — vai falhar por conflito de histórico. O `migrate deploy` é usado apenas no Vercel (via `DIRECT_URL`) onde o banco é exclusivo deste fork.

## Comandos essenciais

```bash
yarn dev                    # dev server local
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
