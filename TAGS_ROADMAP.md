# Roadmap de implementação — sistema de tags/temas para músicas

Instruções para o Claude implementar o sistema de categorização temática de músicas em fases incrementais. Ao final de cada fase, apresentar o checklist de testes ao usuário antes de avançar.

---

## Contexto e decisões de arquitetura

- **Tags pertencem ao `Song`**, não ao `SongArrangement`. Tema é um atributo da música, não do arranjo.
- **Modelo escolhido: `TagGroup` + `Tag`** (estilo Planning Center). Um `TagGroup` é uma dimensão (ex.: "Tema", "Ocasião", "Andamento"); um `Tag` é um valor dentro da dimensão (ex.: "Adoração", "Comunhão", "Lento").
- **Vocabulário controlado**: usuários aplicam tags existentes; criação de novas tags é feita via página de administração separada.
- **Tags são "ao vivo"** nos service arrangements — resolver do `Song` original, nunca congelar na cópia de serviço.
- **Lógica de filtro**: OR dentro do mesmo grupo, AND entre grupos diferentes.

### Estrutura de dados alvo

```prisma
model TagGroup {
  id    Int    @id @default(autoincrement())
  name  String @unique
  color String @default("#6b7280")
  tags  Tag[]
}

model Tag {
  id         Int      @id @default(autoincrement())
  name       String
  tagGroupId Int
  group      TagGroup @relation(fields: [tagGroupId], references: [id])
  songs      Song[]

  @@unique([name, tagGroupId])
}

// Em Song, adicionar:
// tags Tag[]
```

---

## Fase 1 — Fundação do modelo (sem UI)

### Objetivo
Banco migrado, tipos atualizados, TypeScript compilando limpo. Nenhuma interface visível ainda — base para todo o resto.

### Arquivos a modificar

**1. `prisma/schema.prisma`**

Adicionar os modelos `TagGroup` e `Tag` conforme o esquema acima. Adicionar o campo `tags Tag[]` no modelo `Song`.

**2. Migration**

```bash
npx prisma migrate dev --name add-tag-groups-and-tags
```

Se o ambiente local compartilhar banco com o `chorder` original, usar `npx prisma db push --skip-generate` em vez de `migrate dev`. Ver CLAUDE.md — seção "Banco de dados local compartilhado com chorder".

Depois regenerar o cliente:
```bash
npx prisma generate
```

**3. `prisma/models.ts`**

Importar `Tag` e `TagGroup` do `@prisma/client`. Adicionar tipos client:

```ts
import { Tag, TagGroup, /* ... existentes */ } from "@prisma/client";

export type { Tag, TagGroup, /* ... existentes */ };

export type ClientTag = Pick<Tag, "id" | "name"> & {
  group: Pick<TagGroup, "id" | "name" | "color">;
};

export type ClientTagGroup = Pick<TagGroup, "id" | "name" | "color"> & {
  tags: Pick<Tag, "id" | "name">[];
};
```

Atualizar `ClientSong` para incluir tags:

```ts
export type ClientSong = Omit<Song, "id" | "legacyId"> & {
  id?: number;
  arrangements?: ClientArrangement[];
  tags?: ClientTag[];
};
```

**4. `schemas/song.ts`**

Adicionar campo `tags` no `songSchema`:

```ts
import { z } from "zod";

const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  group: z.object({
    id: z.number(),
    name: z.string(),
    color: z.string(),
  }),
});

export const songSchema = z.object({
  // ... campos existentes sem alteração ...
  tags: z.array(tagSchema),
});
```

**5. `prisma/data.ts`**

Na função `retrieveSongs` (linha ~81), adicionar `tags` com `include` ou `select` aninhado:

```ts
// Dentro do select de song, adicionar:
tags: {
  select: {
    id: true,
    name: true,
    group: {
      select: { id: true, name: true, color: true }
    }
  }
}
```

Na função `updateSongInfo` (linha ~147), adicionar suporte a receber e persistir tags:

```ts
// Receber tagIds?: number[] no parâmetro
// No update do Prisma:
tags: tagIds !== undefined ? { set: tagIds.map(id => ({ id })) } : undefined,
```

Adicionar as funções:

```ts
export async function retrieveTagGroups(): Promise<ClientTagGroup[]>
// retorna todos os grupos com suas tags, ordenados por name
```

**6. `mock/arrangements.ts`**

Em todos os objetos `song` dentro do mock, adicionar `tags: []`.

**7. Verificação final**

```bash
npx tsc --noEmit
```

Zero erros TypeScript antes de avançar.

---

### ✅ Checklist de testes — Fase 1

Executar antes de iniciar a Fase 2:

- [ ] `npx tsc --noEmit` retorna zero erros
- [ ] `npx prisma migrate status` (ou `db push`) mostra schema aplicado sem erros
- [ ] `yarn dev` sobe sem erros no terminal
- [ ] A aplicação abre no browser e a listagem de músicas carrega normalmente
- [ ] `yarn test` continua passando (nenhum teste quebrou)
- [ ] Nenhuma música sumiu ou quebrou após a migration

---

## Fase 2 — Exibição read-only + seed de dados

### Objetivo
Visualizar chips de tags na ficha de uma música. Validar o modelo com dados reais antes de implementar edição.

### Arquivos a modificar/criar

**1. Script de seed** (`prisma/seed/tags.ts` ou inline no seed existente)

Criar grupos e tags canônicas:

```
TagGroup "Tema"      (#7c3aed) → Adoração, Louvor, Arrependimento, Esperança, Santidade, Gratidão, Salvação
TagGroup "Ocasião"   (#0891b2) → Abertura, Encerramento, Comunhão, Batismo, Oferta, Oração
TagGroup "Andamento" (#059669) → Lento, Médio, Animado
TagGroup "Idioma"    (#d97706) → Português, Inglês, Espanhol
```

Associar pelo menos 3–5 músicas existentes a algumas tags para testar o display.

Rodar o seed:
```bash
npx ts-node prisma/seed/tags.ts
# ou via script no package.json, conforme padrão do projeto
```

**2. Componente de exibição de tags** (`components/song/SongTags/index.tsx`)

Componente simples e reutilizável:

```tsx
// Props: tags: ClientTag[]
// Renderiza chips com fundo na cor do grupo (com opacidade reduzida)
// Não tem interação — apenas display
```

**3. Exibir tags na ficha da música**

Localizar onde `SongInfoForm` ou o header da música exibe título e artista. Renderizar `<SongTags tags={arrangement.song?.tags ?? []} />` abaixo do artista.

Não adicionar em `SongMetaModal` ainda — apenas display na view.

---

### ✅ Checklist de testes — Fase 2

Executar antes de iniciar a Fase 3:

- [ ] Abrir uma música que recebeu tags no seed — chips aparecem abaixo do artista
- [ ] Chips têm a cor correta do grupo (Tema roxo, Ocasião azul, etc.)
- [ ] Músicas sem tags continuam abrindo normalmente (sem crash, sem chips vazios)
- [ ] `npx tsc --noEmit` continua com zero erros
- [ ] `yarn test` continua passando

---

## Fase 3 — Atribuição de tags via modal de edição

### Objetivo
Usuário consegue adicionar e remover tags de uma música pelo `SongMetaModal`.

### Arquivos a modificar/criar

**1. `app/api/tags/route.ts`** (novo arquivo)

```ts
// GET /api/tags
// Retorna todos os TagGroups com suas Tags
// Chamar retrieveTagGroups() de prisma/data.ts
```

**2. `app/api-client.ts`**

Adicionar hook:

```ts
export function useFetchTagGroups() {
  const { data, isLoading } = useSWR<ClientTagGroup[]>("/api/tags", fetcher);
  return { tagGroups: data ?? [], isLoading };
}
```

**3. `app/api/arrangements/route.ts`** (POST create)

Adicionar `tagIds: z.array(z.number()).optional()` na validação. Passar para `createArrangementWithSong` ao criar.

**4. `app/api/arrangements/[id]/route.ts`** (POST update)

Mesmo padrão: aceitar `tagIds` e passar para `updateArrangementWithSong` → que por sua vez chama `updateSongInfo` com os IDs.

**5. Componente multi-select de tags** (`components/song/TagSelect/index.tsx`)

Padrão shadcn/community: **Popover + Command (cmdk) + Badge chips**.

Estrutura interna:
- `Popover` com trigger mostrando os chips selecionados (ou "Adicionar tags...")
- Dentro do `Popover`: `Command` com `CommandInput` para filtrar, lista de grupos como `CommandGroup`, cada tag como `CommandItem` com checkmark se selecionada
- Tags selecionadas renderizadas como `Badge` com × (botão `type="button"`)
- Ao clicar em uma tag já selecionada: deseleciona
- Ao clicar no ×: remove do array de selecionados

Tipos de props:
```ts
interface TagSelectProps {
  value: ClientTag[];                         // tags atualmente selecionadas
  tagGroups: ClientTagGroup[];               // opções disponíveis
  onChange: (tags: ClientTag[]) => void;
}
```

**6. `components/song/SongMetaModal/`**

- Adicionar `useFetchTagGroups()` para buscar as opções
- Adicionar campo `tags` no estado do form (usar `useState<ClientTag[]>`, não react-hook-form, dado que tags são objetos complexos)
- Renderizar `<TagSelect />` abaixo do campo "Artista"
- Ao submeter: incluir `tagIds: tags.map(t => t.id)` no payload do update

---

### ✅ Checklist de testes — Fase 3

Executar antes de iniciar a Fase 4:

- [ ] Abrir o modal de edição de uma música → campo de tags aparece com as tags atuais da música
- [ ] Clicar no campo → popover abre com os grupos e tags disponíveis
- [ ] Digitar "ador" → filtra para "Adoração" (e variações)
- [ ] Clicar em "Adoração" → tag aparece como chip no campo
- [ ] Clicar no × de um chip → tag é removida do campo
- [ ] Salvar → fechar o modal → reabrir → tags persistiram corretamente
- [ ] Remover todas as tags → salvar → reabrir → campo de tags vazio (sem crash)
- [ ] `npx tsc --noEmit` com zero erros
- [ ] `yarn test` continua passando

---

## Fase 4 — Filtro por tags na listagem de músicas

### Objetivo
Na página de listagem de músicas, o usuário consegue filtrar por tags. Lógica: OR dentro do grupo, AND entre grupos.

### Arquivos a modificar

**1. Localizar a listagem de músicas**

Provavelmente em `app/songs/` ou `app/` — identificar o componente que renderiza a lista e recebe os dados de `useFetchSongs`.

**2. `app/api/songs/route.ts`** (ou equivalente)

Adicionar suporte a query params de filtro:

```
GET /api/songs?tagIds=1,3,7
```

Na query Prisma, implementar a lógica:
- Agrupar os `tagIds` recebidos por `tagGroupId`
- Para cada grupo: `AND { tags: { some: { id: { in: idsDoGrupo } } } }`

Exemplo com dois grupos:
```ts
// tagIds=[1,2,5] onde 1,2 são do grupo "Tema" e 5 é do grupo "Ocasião"
where: {
  AND: [
    { tags: { some: { id: { in: [1, 2] } } } },  // OR dentro de Tema
    { tags: { some: { id: { in: [5] } } } },       // AND com Ocasião
  ]
}
```

**3. `app/api-client.ts`**

Atualizar `useFetchSongs` para aceitar `tagIds?: number[]` e incluí-los na query string.

**4. Componente de filtro** (`components/song/TagFilter/index.tsx`)

Linha horizontal de chips por grupo, acima da lista de músicas:

```
[Tema ▾]  Adoração × | Louvor ×       [Ocasião ▾]  Comunhão ×       [Limpar filtros]
```

- Cada grupo renderiza um `Popover` com checkboxes das tags
- Tags ativas aparecem como chips removíveis na linha
- "Limpar filtros" aparece quando há qualquer filtro ativo
- Em mobile: a linha de chips rola horizontalmente com `overflow-x: auto` e gradiente de fade nas bordas

**5. Conectar filtro à listagem**

Estado `selectedTagIds: number[]` na página da listagem. Passar para `useFetchSongs`. Re-fetch automático via SWR quando o estado muda.

---

### ✅ Checklist de testes — Fase 4

Executar antes de iniciar a Fase 5:

- [ ] Abrir a listagem de músicas → linha de filtro de tags aparece acima da lista
- [ ] Clicar em "Tema" → popover com as tags do grupo abre
- [ ] Selecionar "Adoração" → lista filtra para músicas com essa tag; chip "Adoração ×" aparece na linha de filtro
- [ ] Com "Adoração" ativo, selecionar "Louvor" → lista expande (OR: mostra músicas com qualquer um dos dois)
- [ ] Selecionar "Comunhão" (grupo Ocasião) → lista restringe (AND: músicas com Adoração ou Louvor E com Comunhão)
- [ ] Clicar no × de "Adoração" no chip ativo → filtro removido, lista atualiza
- [ ] "Limpar filtros" remove todos os chips e restaura a lista completa
- [ ] Sem nenhum filtro ativo → todas as músicas aparecem (comportamento original preservado)
- [ ] Testar no mobile: chips rolam horizontalmente, popover não sai do viewport
- [ ] `npx tsc --noEmit` com zero erros
- [ ] `yarn test` continua passando

---

## Fase 5 — Administração de vocabulário

### Objetivo
Página para criar e gerenciar grupos e tags. Necessário para que a equipe possa evoluir o vocabulário sem precisar de um desenvolvedor.

### Arquivos a criar/modificar

**1. `app/admin/tags/page.tsx`** (ou rota equivalente ao padrão de admin do projeto)

Lista de grupos com suas tags. Para cada grupo: nome, cor, lista de tags, botões de editar/excluir. Botão "Novo grupo".

**2. APIs necessárias**

```
POST   /api/admin/tag-groups          → criar grupo
PATCH  /api/admin/tag-groups/[id]     → renomear / recolorir grupo
DELETE /api/admin/tag-groups/[id]     → remover grupo (bloquear se tiver tags associadas a músicas)

POST   /api/admin/tags                → criar tag dentro de um grupo
PATCH  /api/admin/tags/[id]           → renomear tag
DELETE /api/admin/tags/[id]           → remover tag (bloquear se estiver associada a músicas)
POST   /api/admin/tags/merge          → mesclar tag origem → tag destino (anti-sprawl)
```

**3. UX anti-sprawl a implementar**

- Ao criar nova tag: buscar tags com nome similar e exibir aviso ("Tag similar já existe: 'adoração'. Usar ela?")
- Impedir exclusão de tag que esteja associada a ≥1 música (mostrar contagem)
- Operação de merge: move todas as associações de uma tag para outra e deleta a origem

---

### ✅ Checklist de testes — Fase 5

Executar antes de iniciar a Fase 6:

- [ ] Acessar `/admin/tags` → página lista todos os grupos e suas tags
- [ ] Criar novo grupo "Instrumentação" com cor → aparece na lista
- [ ] Criar tag "Acústico" dentro do grupo → aparece no grupo
- [ ] Abrir modal de edição de uma música → novo grupo e tag aparecem disponíveis
- [ ] Tentar deletar tag que está associada a músicas → sistema bloqueia com contagem
- [ ] Deletar tag sem associações → removida com sucesso
- [ ] Mesclar "worshp" (typo) em "adoração" → músicas com a tag errada ficam com a correta
- [ ] `npx tsc --noEmit` com zero erros
- [ ] `yarn test` continua passando

---

## Fase 6 — Polish incremental

Implementar na ordem abaixo, testando cada item antes do próximo:

### 6a. Contagem de resultados nos chips de filtro

No componente `TagFilter`, ao lado de cada tag no popover mostrar `(N)` com o número de músicas que possuem aquela tag (considerando filtros já ativos nas outras dimensões). Calcular server-side ou client-side dependendo do tamanho do catálogo.

**Teste:** marcar "Adoração (12)" → lista mostra exatamente 12 músicas.

---

### 6b. Bottom sheet no mobile para o filtro

Em viewport < 768px, substituir o `Popover` de cada grupo por um bottom sheet (drawer vaul — já usado no projeto). Garantir que eventos não sejam bloqueados pelo listener de captura do vaul. Ver CLAUDE.md — seção "UI flutuante global".

**Teste:** no mobile, tocar em "Tema" → drawer abre por baixo com as tags; selecionar e fechar funciona sem travamento.

---

### 6c. Cores por grupo nos chips do TagSelect (modal)

No `TagSelect`, chips de tags diferentes grupos têm cores diferentes (usar `group.color`). Ajustar contraste do texto (branco ou preto) com base na luminância da cor de fundo.

**Teste:** no modal de edição, "Adoração" aparece com fundo roxo e "Comunhão" com fundo azul.

---

### 6d. Presets de filtro salvos (estado da arte)

Campo "Salvar como preset" no filtro ativo. Persiste o conjunto de `tagIds` com um nome (ex.: "Domingo de manhã"). Presets listados acima do filtro como botões de atalho.

Armazenar em `localStorage` para início rápido, depois migrar para banco se precisar de sincronização entre dispositivos.

**Teste:** filtrar por "Lento + Comunhão" → salvar como "Comunhão reflexiva" → limpar filtros → clicar no preset → filtros restaurados automaticamente.

---

## Referências e padrões do projeto a respeitar

- **Zod**: usar `z.array(...).optional()` **nunca** em campos usados com `zodResolver`. Tags como array direto: `z.array(tagSchema)` com `defaultValues: tags: []`.
- **Botões**: sempre `type="button"` nos × dos chips.
- **Commit messages**: sempre em português (pt-BR).
- **TypeScript**: `npx tsc --noEmit` com zero erros antes de cada commit.
- **Service arrangements**: tags resolvem sempre do `Song` original — não copiar no snapshot de serviço.
- **Busca de pontos de impacto**: `grep -r "ClientSong\|ClientArrangement" --include="*.ts" --include="*.tsx" -l`
