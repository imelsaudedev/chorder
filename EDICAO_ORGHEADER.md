# Edição de Logo e Nome da Organização

## Status Atual
O `OrgHeader` está integrado nas páginas de Services e Songs, puxando dados de `config/organization.ts`.

## ❓ Como o Usuário Troca a Imagem e Nome?

**Atualmente:** Precisa de um desenvolvedor

Para o usuário final trocar sem código, escolha uma estratégia abaixo.

## 3 Estratégias de Edição

### 1️⃣ SIMPLES: Editar arquivo de config (Atual)

**Para:** Alterações raras, ambiente controlado

**Como fazer:**
```ts
// config/organization.ts
export const organizationConfig = {
  name: "Novo Nome",           // ← Editar aqui
  description: "Nova descrição", // ← Editar aqui
  logo: {
    type: "emoji",             // ← ou "initials" ou "image"
    value: "🎶",               // ← Novo emoji/iniciais/URL
  },
};
```

**Deploy:** Fazer commit e push (vai para prod automaticamente)

**Quem pode fazer:** Dev/Admin com acesso ao repo

---

---

### 2️⃣ MÉDIA: Variáveis de Ambiente

**Para:** Configs sensíveis, sem rebuild necessário

**Como fazer:**

1. Criar `.env.local`:
```
NEXT_PUBLIC_ORG_NAME="Novo Nome"
NEXT_PUBLIC_ORG_DESCRIPTION="Descrição"
NEXT_PUBLIC_ORG_LOGO_TYPE="emoji"
NEXT_PUBLIC_ORG_LOGO_VALUE="🎵"
```

2. Atualizar `config/organization.ts`:
```ts
export const organizationConfig = {
  name: process.env.NEXT_PUBLIC_ORG_NAME || "IMeL Saúde",
  description: process.env.NEXT_PUBLIC_ORG_DESCRIPTION || "Gerenciador de Liturgias",
  logo: {
    type: (process.env.NEXT_PUBLIC_ORG_LOGO_TYPE as any) || "emoji",
    value: process.env.NEXT_PUBLIC_ORG_LOGO_VALUE || "🎵",
  },
};
```

**Vantagem:** Muda no Vercel dashboard sem rebuild

---

### 3️⃣ AVANÇADA: Admin Panel + Database

**Para:** Edição dinâmica em tempo real

**Estrutura:**
```
┌─────────────────────────────────┐
│ Pages Admin                     │
│ ├─ /admin/organization          │
│ │  └─ Form para editar logo     │
│ └─ Salva em DB                  │
│                                 │
│ API                             │
│ ├─ GET  /api/organization       │
│ └─ POST /api/organization       │
│                                 │
│ Config                          │
│ ├─ organization.ts              │
│ │  └─ Lê de DB/API (SWR)       │
│ └─ OrgHeader                    │
│    └─ Renderiza config          │
└─────────────────────────────────┘
```

**Steps:**
1. Criar tabela `Organization` no Prisma
2. Criar `/admin/organization` page
3. Criar endpoints `/api/organization`
4. Usar SWR/cache em `config/organization.ts`
5. OrgHeader busca config e renderiza

---

## 🎯 Recomendação Atual

**Estratégia 1 (config file)** enquanto o site tiver UMA organização.

Se precisar editar dinamicamente depois: migrar para **Estratégia 2** (env vars) — é o meio termo entre simples e flexível.

---

## Opções de Logo

### Emoji (Atual)
```ts
logo: { type: "emoji", value: "🎵" }
```
✅ Simples, sem uploads  
❌ Limitado visualmente

### Initials
```ts
logo: { type: "initials", value: "IS" }
```
✅ Profissional, cores customizáveis  
❌ Precisa de fonte certa

### Image
```ts
logo: { type: "image", value: "/logo.png" }
```
✅ Máxima flexibilidade  
❌ Precisa gerenciar arquivo

---

## Para o Futuro (Admin Panel)

Se quiser implementar edição avançada, criar:

```
/app/admin/organization/page.tsx
├─ Form com inputs: name, description
├─ Logo picker (emoji search, upload, initials)
└─ Salva em DB

/app/api/organization/route.ts
├─ GET → retorna config atual
└─ POST → atualiza DB
```

---

## 🎯 Para o Usuário Final (Sem Código)

Se quiser que qualquer usuário da app possa trocar logo/nome **sem acesso ao código**:

### Opção: Admin Panel Simples

Criar uma página `/admin/organization` onde o usuário logado pode:

```
┌─────────────────────────────┐
│ Configurar Organização      │
│                             │
│ Nome: [___IMeL Saúde___]   │
│ Descrição: [__Gerenciador__]│
│                             │
│ Logo: ◉ Emoji              │
│       ○ Iniciais           │
│       ○ Upload Imagem      │
│                             │
│ Emoji: [🎵 ▼ ]             │
│ ou Valor: [___🎵___]       │
│                             │
│ [Salvar]                    │
└─────────────────────────────┘
```

**Fluxo:**
1. Usuário admin entra em `/admin/organization`
2. Preenche formulário (nome, logo)
3. Clica "Salvar"
4. Dados salvos em banco de dados
5. OrgHeader carrega dados da DB em tempo real (SWR cache)

**Setup necessário:**
- Criar tabela `Organization` no Prisma
- Criar página admin + form
- Criar endpoints POST/GET `/api/organization`
- Atualizar `config/organization.ts` para buscar de API

**Esforço:** ~2-3 horas (1 tela + 1 tabela + 2 endpoints)

---

## 📋 Recomendação Atual

👉 **Mantém como está** (config file) enquanto:
- Poucas mudanças de branding
- Dev faz commits ocasionais

👉 **Migra para Admin Panel** quando:
- Usuário não-técnico precisa mudar
- Mudanças frequentes
- Múltiplas organizações futuro

