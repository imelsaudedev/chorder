# Plano de Migração: chorder-alt → chorder

> **Para o agente executor:** Este documento contém tudo o que você precisa para realizar
> a migração. Leia-o completo antes de começar. Siga os passos em ordem.
> Não pule etapas. Confirme com o usuário antes de qualquer operação destrutiva.

---

## Contexto

O `chorder-alt` é um fork do `chorder` com ~270 commits de features novas.
O objetivo é substituir totalmente o código do `chorder` pelo do `chorder-alt`,
sem alterar o banco de dados de produção do chorder além do necessário (apenas
aplicar as migrations aditivas).

### Caminhos dos repositórios
- **chorder-alt** (fonte): `/home/tiago/chorder-alt` (Linux/WSL)
- **chorder** (destino): `C:\Repositorios\chorder` (Windows) → `/mnt/c/Repositorios/chorder` (WSL)

### Ponto de fork
Commit `69bfe6b` (docs: update AGENTS.md) — existe em ambos os repos.
Após esse ponto, chorder fez 4 commits e os reverteu todos. O HEAD do chorder
está na prática idêntico ao fork point. O chorder-alt é um superconjunto.

---

## O que será preservado do chorder (NÃO sobrescrever)

| Arquivo/Pasta | Motivo |
|---|---|
| `.github/workflows/` | CI/CD com GitHub Actions + Playwright E2E |
| `AGENTS.md` | Guia de arquitetura do chorder (branching, testes, devcontainer) |
| `app/(main)/feedback/` | Feature de feedback via GitHub Issues + Gemini (removida do chorder-alt) |

---

## O que será ganho (features do chorder-alt)

- Sistema completo de tags (TagGroup, Tag, filtro, admin, catálogo em planilha)
- Múltiplos áudios por arranjo com player (react-h5-audio-player + Vercel Blob)
- YouTube por arranjo
- `SongUnit.notes` — instruções por bloco ChordPro
- `SongUnit.repeatCount` — badge de repetição por bloco
- Modo fullscreen com status bar e navegação por teclado
- Página `/stats` (estatísticas de uso)
- `/admin/catalogo` (edição de metadados em planilha)
- `/admin/tags` (gestão de grupos com ordenação)
- Design system (componente Tag, Text, tipografia Space Grotesk)
- Seletor enarmônico (C#/Db etc.)
- Edição inline de cifras na view do culto
- SongPicker com histórico de liturgias recentes
- YoutubePlayer e AudioPlayer (widgets flutuantes via contexto)

---

## Pré-requisitos — verificar antes de começar

### 1. Vercel Blob (OBRIGATÓRIO para upload de áudio)

O chorder-alt usa `@vercel/blob` para armazenar arquivos de áudio.
O chorder **não tem** essa infraestrutura.

**Ação necessária (manual, feita pelo usuário no dashboard):**
1. Acessar o dashboard do projeto **chorder** no Vercel
2. Ir em **Storage → Create → Blob**
3. Criar um store (nome sugerido: `chorder-audio`)
4. Copiar o `BLOB_READ_WRITE_TOKEN` gerado
5. Adicioná-lo nas variáveis de ambiente do projeto chorder no Vercel

> ⚠️ Sem isso, o upload de áudio quebra em produção. O build passa, mas a feature falha.

**Confirmar com o usuário:** "O Vercel Blob está configurado no projeto chorder?"

### 2. DIRECT_URL do Neon (OBRIGATÓRIO para prisma migrate deploy)

O chorder-alt usa `directUrl = env("DIRECT_URL")` no `schema.prisma` para
que `prisma migrate deploy` funcione com o Neon (que usa pooler por padrão).

**Ação necessária:**
- Verificar se o projeto chorder no Vercel já tem `DIRECT_URL` configurada
- Se não tiver: é a mesma URL do `DATABASE_URL` mas sem `-pooler` no hostname
  - Exemplo: `DATABASE_URL` = `postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/db`
  - `DIRECT_URL` = `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/db`

**Confirmar com o usuário:** "A variável DIRECT_URL está nas env vars do chorder no Vercel?"

### 3. Variáveis de ambiente do feedback (OBRIGATÓRIO para a feature funcionar)

O chorder tem uma feature de feedback que cria GitHub Issues automaticamente com
título gerado por IA (Gemini). Ela exige duas variáveis de ambiente no Vercel:

| Variável | O que é | Onde obter |
|---|---|---|
| `GITHUB_ISSUES_TOKEN` | Personal Access Token com escopo `issues: write` no repo `imelsaudedev/chorder` | GitHub → Settings → Developer settings → Tokens |
| `GEMINI_API_KEY` | Chave da Google AI Studio (Gemini) | [aistudio.google.com](https://aistudio.google.com) |

> ⚠️ Sem `GITHUB_ISSUES_TOKEN`, o submit do formulário retorna erro 500.
> Sem `GEMINI_API_KEY`, o título do issue é gerado como fallback (primeiros 50 chars) — não quebra, mas degrada.

**Confirmar com o usuário:** "O GITHUB_ISSUES_TOKEN e o GEMINI_API_KEY estão nas env vars do Vercel do chorder?"

### 4. Branching no chorder

O chorder tem GitHub Rulesets que **bloqueiam push direto em `main`**.
A migração deve ser feita via branch + PR.

```bash
git -C /mnt/c/Repositorios/chorder checkout -b feat/migrar-chorder-alt
```

---

## Migrations de banco — análise de risco

O banco de produção do chorder tem 6 migrations aplicadas (até `remove_title`).
As 8 migrations abaixo do chorder-alt precisam ser aplicadas. **Todas são seguras**
porque o chorder nunca usou YouTube, áudio ou tags — as colunas sendo removidas
estarão vazias.

| Migration | Operação | Risco |
|---|---|---|
| `20260526020813_add_youtube_url_to_song` | ADD COLUMN `Song.youtubeUrl` | 🟢 Aditivo |
| `20260526020946_move_youtube_url_to_arrangement` | DROP `Song.youtubeUrl` (vazia) → ADD `SongArrangement.youtubeUrl` | 🟢 Seguro |
| `20260526150539_add_audio_url_to_arrangement` | ADD COLUMN `SongArrangement.audioUrl` | 🟢 Aditivo |
| `20260603000000_add_tag_groups_and_tags` | CREATE TABLE TagGroup, Tag, \_SongToTag | 🟢 Aditivo |
| `20260605000000_add_notes_to_song_unit` | ADD COLUMN `SongUnit.notes` | 🟢 Aditivo |
| `20260606000000_add_repeat_count_to_song_unit` | ADD COLUMN `SongUnit.repeatCount DEFAULT 1` | 🟢 Aditivo |
| `20260609000000_add_arrangement_audio` | CREATE TABLE ArrangementAudio, migra `audioUrl` (0 linhas), DROP `audioUrl` | 🟡 Migração de dados — segura pois audioUrl está vazia |
| `20260611000000_add_order_to_tag_group` | ADD COLUMN `TagGroup.order DEFAULT 0` | 🟢 Aditivo |

> As migrations são aplicadas automaticamente pelo build do Vercel via
> `prisma migrate deploy`. Não é necessário rodar manualmente.

---

## Passo a passo da migração

### Passo 1 — Confirmar pré-requisitos

```
Perguntar ao usuário:
1. O Vercel Blob está criado no projeto chorder?
2. O BLOB_READ_WRITE_TOKEN está nas env vars do Vercel?
3. O DIRECT_URL está nas env vars do Vercel?
4. Há algum dado de áudio ou YouTube no chorder que precisa ser preservado?
```

Não prosseguir sem confirmação dos itens 1–3.

---

### Passo 2 — Criar branch no chorder

```bash
git -C /mnt/c/Repositorios/chorder checkout main
git -C /mnt/c/Repositorios/chorder pull
git -C /mnt/c/Repositorios/chorder checkout -b feat/migrar-chorder-alt
```

---

### Passo 3 — Substituir os arquivos

Copiar tudo do chorder-alt para o chorder, **exceto** os itens preservados.

```bash
CHORDER_ALT=/home/tiago/chorder-alt
CHORDER=/mnt/c/Repositorios/chorder

# Listar o que vamos copiar (verificação antes de executar)
rsync -av --dry-run \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='AGENTS.md' \
  --exclude='app/(main)/feedback/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.log' \
  "$CHORDER_ALT/" "$CHORDER/"
```

Revisar a saída do `--dry-run` com o usuário antes de executar sem `--dry-run`.

```bash
# Executar a cópia real (somente após revisão)
rsync -av \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='AGENTS.md' \
  --exclude='app/(main)/feedback/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.log' \
  "$CHORDER_ALT/" "$CHORDER/"
```

---

### Passo 4 — Verificar e ajustar branding

O chorder-alt tem branding específico ("Missão 2026 - Amanhar").
Verificar com o usuário se deve ser mantido ou revertido para genérico.

```bash
# Localizar onde o título está definido
grep -rn "Missão 2026\|Amanhar" /mnt/c/Repositorios/chorder/app --include="*.tsx" --include="*.ts" 2>/dev/null
```

Se necessário ajustar:
- `app/layout.tsx` — `<title>` e metadata
- `components/common/LogoHeader/` — logo da organização

**Perguntar ao usuário:** "Manter o branding do chorder-alt ou restaurar o título genérico?"

---

### Passo 4.5 — Restaurar a feature de feedback

O rsync excluiu `app/(main)/feedback/` — ela continua intacta no chorder. Mas
três integrações adicionais precisam ser restauradas manualmente:

#### 4.5.1 — Adicionar dependências ao package.json

O chorder-alt não tem `@google/genai` nem `@octokit`. Adicionar ao `package.json`
do chorder (checar versões atuais no chorder antes de copiar):

```bash
# Verificar versões atuais no chorder original
node -e "const p=require('/mnt/c/Repositorios/chorder/package.json'); console.log(p.dependencies['@google/genai'], p.dependencies['@octokit/core'], p.dependencies['@octokit/types'])"
```

Adicionar manualmente no `package.json` do chorder (já copiado pelo rsync com
as deps do chorder-alt), na seção `dependencies`:

```json
"@google/genai": "^1.10.0",
"@octokit/core": "^7.0.3",
"@octokit/types": "^14.1.0"
```

Depois rodar `yarn install` novamente.

#### 4.5.2 — Adicionar o link no NavBar

O NavBar do chorder-alt não tem o link para `/feedback`. Localizar onde os links
de navegação estão definidos no NavBar do chorder-alt (agora copiado para o chorder):

```bash
grep -n "songs\|services\|href" /mnt/c/Repositorios/chorder/components/common/NavBar/index.tsx
```

Adicionar o link de feedback na mesma posição em que estava no NavBar original
do chorder (mobile e desktop). O link original era:

```tsx
href="/feedback"
label={t("feedback")}
active={currentPage === "feedback"}
```

Verificar a estrutura exata do NavBar copiado para saber como inserir.

#### 4.5.3 — Restaurar as chaves i18n do Feedback

O chorder-alt sobrescreveu os arquivos de mensagens. Adicionar o namespace
`Feedback` de volta em `i18n/messages/pt-BR.json`:

```json
"Feedback": {
  "title": "Feedback",
  "contentBug": "Descreva o bug ou problema que você encontrou",
  "contentFeature": "Descreva a funcionalidade que você gostaria de ver implementada",
  "contentOther": "Compartilhe qualquer outro comentário, sugestão ou feedback geral",
  "contentRequired": "O conteúdo é obrigatório",
  "bug": "Bug",
  "feature": "Funcionalidade",
  "other": "Outro",
  "nameLabel": "Nome",
  "namePlaceholder": "Seu nome (opcional)",
  "nameDescription": "Você pode se identificar para que possamos entrar em contato caso necessário.",
  "submit": "Enviar",
  "successTitle": "Obrigado pelo seu feedback!",
  "successMessage": "Agradecemos por compartilhar suas ideias e sugestões",
  "submitAnother": "Enviar outro feedback",
  "invalidFeedback": "Feedback inválido.",
  "serverError": "Erro no servidor. Por favor, tente novamente mais tarde."
}
```

E em `i18n/messages/en.json` verificar se o namespace `Feedback` também precisa
ser adicionado (o chorder pode ter a versão em inglês).

```bash
# Checar se en.json do chorder tinha Feedback
node -e "const j=require('/mnt/c/Repositorios/chorder/i18n/messages/en.json'); console.log(JSON.stringify(j.Feedback, null, 2))" 2>/dev/null
```

> ⚠️ Sem essas chaves, a página `/feedback` quebra com erro de tradução faltando.

---

### Passo 5 — Verificar o favicon

O chorder-alt tem um favicon personalizado (bird emerald do Lucide).

```bash
ls /mnt/c/Repositorios/chorder/app/favicon* /mnt/c/Repositorios/chorder/public/ 2>/dev/null
```

**Perguntar ao usuário:** "Manter o favicon do chorder-alt ou restaurar o original?"

---

### Passo 6 — Instalar dependências

```bash
# No Windows (PowerShell ou terminal do chorder)
cd C:\Repositorios\chorder
yarn install
```

Ou via WSL:
```bash
cd /mnt/c/Repositorios/chorder && yarn install
```

Verificar se há erros de dependência. O chorder-alt adicionou:
- `@radix-ui/react-tooltip`
- `@vercel/blob`
- `react-h5-audio-player`

---

### Passo 7 — Checar TypeScript

```bash
cd /mnt/c/Repositorios/chorder && npx tsc --noEmit 2>&1
```

Zero erros é obrigatório antes de continuar.

Se houver erros relacionados a mocks ou stories desatualizados do chorder, corrigi-los.
Consultar o CLAUDE.md do chorder-alt para entender os padrões de tipagem Zod e Prisma.

---

### Passo 8 — Rodar testes locais

```bash
cd /mnt/c/Repositorios/chorder && yarn vitest run --project=app
```

Todos os testes unitários devem passar. Se falhar algum relacionado a mocks
desatualizados (tipos de `ClientArrangement`, `ClientServiceUnit` etc.), atualizar
adicionando os novos campos (`youtubeUrl`, `audios`, `notes`, `repeatCount`).

---

### Passo 9 — Commit e PR

```bash
git -C /mnt/c/Repositorios/chorder add -A
git -C /mnt/c/Repositorios/chorder status
# Revisar arquivos com o usuário antes de commitar
```

```bash
git -C /mnt/c/Repositorios/chorder commit -m "feat: migrar chorder-alt para chorder

Substitui o código do chorder pelo chorder-alt, que é um superconjunto
com as seguintes features adicionais:
- Sistema de tags (TagGroup, Tag, filtro, admin, catálogo)
- Múltiplos áudios por arranjo com Vercel Blob
- YouTube por arranjo
- Modo fullscreen com status bar
- Estatísticas (/stats), admin catálogo e admin tags
- Design system atualizado (Space Grotesk, Tag, Text)
- Seletor enarmônico, edição inline de cifras
- SongUnit.notes e SongUnit.repeatCount
- 8 migrations aditivas para o banco Neon

Preservado: .github/workflows/ (CI/CD) e AGENTS.md"

git -C /mnt/c/Repositorios/chorder push -u origin feat/migrar-chorder-alt
```

Criar o PR via GitHub (ou `gh pr create`) e aguardar o CI passar.

---

### Passo 10 — Verificar o build do Vercel (preview deploy)

O Vercel gera um preview deploy para cada PR. Verificar:

1. O build passou (`prisma migrate deploy` + `next build`)?
2. A página de músicas carrega?
3. A página de liturgias carrega?
4. O filtro de tags aparece (pode estar vazio — não há tags no chorder ainda)?
5. O upload de áudio funciona no preview?

---

### Passo 11 — Merge e deploy em produção

Após o CI e o preview deploy estarem ok:
1. Aprovar e fazer merge do PR no GitHub
2. O Vercel faz deploy automático em produção
3. As 8 migrations são aplicadas no Neon automaticamente

---

### Passo 12 — Pós-deploy: configurar tags iniciais

O banco do chorder não terá tags. O usuário pode criar os grupos e tags via
`/admin/tags` após o deploy.

Se quiser pré-popular com as mesmas tags do chorder-alt, verificar se há
um seed disponível:

```bash
ls /home/tiago/chorder-alt/prisma/seed/ 2>/dev/null
```

---

## Problemas conhecidos e como resolver

### Build falha com "Unknown argument `order`"
**Causa:** Prisma generate não rodou após schema change.
**Solução:** `rm -rf .next && npx prisma generate`

### "Database `chorder_test` does not exist"
**Causa:** Banco de testes não existe localmente.
**Solução:** Criar o banco ou rodar só os testes unitários: `yarn vitest run --project=app`

### TypeScript erro em mocks com campos novos
**Causa:** Objetos mock não têm os campos `youtubeUrl`, `audios`, `notes`, `repeatCount`.
**Solução:** Adicionar os campos com valores default (`null`, `[]`, `null`, `1`) em todos
os arquivos `mock/*.ts` e `**/*.stories.tsx` e `**/*.test.tsx` que constroem `ClientArrangement`.

### Upload de áudio retorna 500
**Causa:** `BLOB_READ_WRITE_TOKEN` não configurado.
**Solução:** Configurar no Vercel (ver Passo 1).

### `prisma migrate deploy` falha no Vercel
**Causa:** `DIRECT_URL` não configurada.
**Solução:** Adicionar a URL direta do Neon (sem `-pooler`) como `DIRECT_URL`.

---

## Checklist final

```
[ ] Vercel Blob criado e BLOB_READ_WRITE_TOKEN configurado
[ ] DIRECT_URL configurada nas env vars do Vercel
[ ] GITHUB_ISSUES_TOKEN configurado nas env vars do Vercel
[ ] GEMINI_API_KEY configurado nas env vars do Vercel
[ ] Branch feat/migrar-chorder-alt criada
[ ] rsync executado (excluindo .github/, AGENTS.md, app/(main)/feedback/)
[ ] Dependências do feedback adicionadas ao package.json (@google/genai, @octokit/core, @octokit/types)
[ ] Link /feedback restaurado no NavBar (mobile + desktop)
[ ] Namespace Feedback adicionado ao pt-BR.json e en.json
[ ] Branding revisado com o usuário
[ ] yarn install sem erros
[ ] npx tsc --noEmit com zero erros
[ ] yarn vitest run --project=app com todos passando
[ ] Commit e PR criados
[ ] CI do GitHub Actions passou
[ ] Preview deploy do Vercel funcionando
[ ] Testar /feedback no preview: submit cria issue no GitHub com título gerado pelo Gemini
[ ] PR aprovado e mergeado
[ ] Deploy em produção verificado
[ ] Tags criadas via /admin/tags (opcional)
```

---

## Referências

- **chorder-alt CLAUDE.md**: padrões de código, Zod, botões em forms, UI flutuante
- **chorder AGENTS.md**: workflow de branching, testes, devcontainer
- Análise original desta migração: conversa de 2026-06-11 (contexto em memória do agente)
