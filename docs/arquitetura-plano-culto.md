# Arquitetura do plano de culto (liturgia)

Este documento registra uma decisão de arquitetura tomada ao retomar o editor de
liturgia (branch `service-plan-editor`) depois de alguns meses parado, e o
raciocínio por trás dela — para quem for mexer nisso sem ter acompanhado essa
retomada.

## O que mudou

`Service.plan` (JSON) é a única fonte de verdade persistida do culto. Antes,
existia também uma tabela relacional `ServiceUnit`, mantida em paralelo e
sincronizada a cada save — essa sincronização foi removida do código (embora a
tabela em si ainda exista no banco por enquanto, ver seção "O que NÃO foi
feito" abaixo).

`ClientService.units` (o array "flat" de músicas usado pela aba Cifras e pelo
botão de setlist do Holyrics) continua existindo com a mesma forma de sempre,
mas agora é **calculado na leitura** a partir do `plan`, não é mais uma tabela
separada. Nenhum desses consumidores precisou mudar.

## Por que

### O bug que motivou a mudança

A sincronização antiga (`syncSongUnits`) tinha um defeito sério: o id do
arranjo resolvido no save nunca era gravado de volta no `plan` persistido.
Resultado — **todo save de um culto existente apagava e recriava as cópias de
arranjo de todas as músicas**, mesmo sem nenhuma mudança. Isso incluía órfãos
no banco a cada save e risco real de uma edição de cifra em andamento (aba
Cifras → "editar cifra") ficar presa a uma cópia de arranjo que acabara de
virar órfã.

A causa raiz: nada identificava uma música do plano de forma estável entre um
save e outro — tudo era resolvido por posição no array. Sem uma identidade
estável, não tinha como saber se "a 3ª música da seção 2" no save de agora é a
mesma música do save anterior ou uma diferente.

### As decisões de produto por trás da simplificação

Perguntei ao usuário sobre o uso real antes de decidir simplificar o modelo de
dados, e as respostas abriram caminho pra eliminar a tabela em vez de só
corrigir a sincronização:

- **Várias pessoas editam o mesmo culto em momentos diferentes** (dirigente
  escolhe músicas, pregador confirma tema depois) → precisa de proteção contra
  sobrescrita (ver Fase 4 do plano), mas não de colaboração em tempo real.
- **Estatísticas (ranking de música por dirigente) não são críticas** → removeu
  a justificativa de manter uma tabela relacional separada só para consultas
  rápidas; dá pra escanear o `plan` de todos os serviços sem problema, na
  escala desta aplicação.
- **O registro do culto congela depois que ele acontece** → não precisa de
  histórico/auditoria de versões.
- **Vários templates fixos são esperados** → confirma que a biblioteca de
  templates (`ServiceTemplate`) é o caminho certo, sem mudança estrutural.

## Como funciona agora

### Identidade estável

Cada seção do plano tem `id: string`, cada unidade tem `clientId: string` —
gerados no client (`crypto.randomUUID()`) no momento da criação
(`usePlanEditor.addSection`/`addUnit`, `useTemplateEditor`,
`buildSectionsFromTemplate`) e nunca reaproveitados de outro contexto. Planos
salvos antes dessa mudança não têm esses ids no JSON; `retrieveService()`
preenche o que faltar na leitura, então qualquer culto antigo sai do primeiro
carregamento com ids completos (persistidos de volta no próximo save).

### Save (`createOrUpdateService` → `syncPlanArrangements`, em `prisma/data.ts`)

Roda dentro de uma transação. Compara o plano novo com o plano anteriormente
persistido, casando unidades do tipo `SONG` pelo `clientId` (não pela
posição):

- **Mesmo `clientId`, mesma música** (`arrangement.songId` igual ao que a
  cópia anterior tinha) → atualiza a cópia existente (`name`/`key`), reaproveita
  o mesmo `arrangementId`. Não recria nada.
- **`clientId` novo, ou música trocada nesse `clientId`** → cria uma cópia nova
  (`isServiceArrangement: true`, copiando os blocos de acorde do arranjo
  original).
- **Cópia que existia antes e não sobrou referenciada por nenhuma unidade do
  plano novo** (música removida, ou trocada) → apagada como órfã.

O `plan` persistido no banco guarda só a forma do item (`clientId`, `type`,
`arrangementId`, `order`, `durationMin`, `label`, `metadata`) — nunca o objeto
`arrangement` completo. Conteúdo de música/arranjo é sempre resolvido do banco
na leitura, nunca lido de volta do JSON.

### Leitura (`retrieveService`, `retrieveStats`, `retrieveRecentServices`)

Todas escaneiam `plan.sections[].units[]`, coletam os `arrangementId`
referenciados, e resolvem os dados de arranjo/música numa consulta em lote
(`songArrangement.findMany({ where: { id: { in: [...] } } })`) — em vez de
depender de uma relação de tabela.

### O que NÃO mudou

- `SongArrangement`, `isServiceArrangement`, `originalArrangementId` — o
  mecanismo de "cópia de serviço" de um arranjo continua exatamente igual. O
  fluxo de editar cifra na aba Cifras e escolher "salvar só na cópia" ou
  "salvar também no original" (`ServiceArrangementHeader` →
  `ServiceSongUnitEditForm` → `PATCH /api/arrangements/[id]`) não passa pelo
  `plan` nem nunca passou — ele só ficou mais confiável, porque agora o id da
  cópia não muda mais embaixo dele entre um save do culto e outro.
- `ServiceTemplate` — sem mudança estrutural.

## O que NÃO foi feito (de propósito)

**A tabela `ServiceUnit` ainda existe no banco.** O código não lê nem escreve
mais nela, mas ela não foi removida do `schema.prisma` nem apagada via
migration. Isso foi uma decisão explícita: apagar a tabela é uma migration
automática (`prisma migrate deploy` roda sozinho a cada push em `main`, via o
script de build), e cultos antigos que ainda não tiverem `plan` construído
(ver `prisma/seed/backfill-legacy-plan.ts`) perderiam as músicas pra sempre se
a tabela sumisse antes do backfill rodar contra o banco de produção (Neon).

Ela fica como uma rede de segurança dos dados antigos até uma limpeza
deliberada e futura: rodar o backfill contra o Neon de produção, confirmar
zero cultos sem `plan`, só então gerar a migration que remove `ServiceUnit`.
Não faça essa migration sem ter confirmado o backfill em produção primeiro.

## Ponteiros

- `prisma/data.ts` — `createOrUpdateService`, `syncPlanArrangements`,
  `retrieveService`, `retrieveStats`, `retrieveRecentServices`.
- `components/service/ServicePlanEditor/hooks/usePlanEditor.ts` — geração de
  ids estáveis no editor principal.
- `components/service/ServicePlanEditor/ServiceItemDrawer/index.tsx` —
  `commitSongUnit`, onde uma música é adicionada/trocada num item do plano.
- `prisma/seed/backfill-legacy-plan.ts` — script de adoção de cultos antigos.
- `docs/checklist-editor-culto.md` — checklist manual de QA do editor.
