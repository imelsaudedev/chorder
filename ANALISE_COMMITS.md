# Análise de Mudanças — chorder-alt vs chorder

## 1. ÚLTIMO DIFF (ClientSongsPage.tsx)

### Mudança Realizada
Refatoração do botão flutuante de criar nova música de um layout customizado para o padrão de sistema.

**Antes:**
```tsx
<Button
  variant="secondary"
  className="rounded-full shadow-lg h-10 w-10 sm:h-12 sm:w-auto sm:pl-4 sm:pr-8 flex items-center justify-center gap-2"
>
  <Plus className="size-6 shrink-0" />
  <span className="hidden sm:inline whitespace-nowrap">{t("newSong")}</span>
</Button>
```

**Depois:**
```tsx
<Button
  variant="secondary"
  size="lg"
  className="rounded-full shadow-lg"
>
  <Plus className="hidden sm:inline" />
  <span className="sm:hidden"><Plus /></span>
  <span className="hidden sm:inline">{t("newSong")}</span>
</Button>
```

**Impacto:**
- Usa `size="lg"` do sistema (h-10 px-6)
- Remove todos os paddings customizados
- Mantém apenas `rounded-full` como override
- Comportamento responsivo: ícone no mobile, ícone + label no desktop

---

## 2. DIFERENÇAS COM CHORDER ORIGINAL

### A. Mudanças de UX (Podem ser migradas)

#### 2.1 - Layout de Forms
- **Song/Service Creation/Edit**: Mudança de página completa → modal drawer responsivo
- **Header Editável**: Título clicável para editar metadados (abre drawer) + ícone lápis
- **Cancel Button**: Movido para footer, alinhado com save button
- **Footer Layout**: Grid no mobile (buttons lado a lado), flex no desktop

#### 2.2 - Visual/Styling
- **Text Hierarchy**: Títulos em `heading-lg` em vez de `heading-sm` em forms
- **Button Flutuante**: Padrão de sistema com `rounded-full` (não existe em chorder)
- **Header Subtítulo**: Data e dirigente em duas linhas no mobile, uma linha no desktop
- **Ícones**: Lápis ao lado de títulos para indicar editabilidade

#### 2.3 - Internacionalização
- Nova chave: `Messages.editService` ("Editar liturgia")
- Nova chave: `Messages.deleteService` ("Apagar liturgia")
- Atualização de labels em ActionMenu

### B. Mudanças de Estrutura (NÃO podem ser migradas facilmente)

#### 2.4 - Context API
- **SongMetaModalProvider**: Context para compartilhar state do modal de metadados entre form e pages
- Acoplamento: Forms abrem drawer via `setMetaModalOpen(true)`

#### 2.5 - Remoção de Componentes
- Deletado: `ServiceInfoFormSkeleton.tsx` (consolidado em `ServiceForm/Skeleton.tsx`)
- Impacto: Simplificou arquitetura, mas rompe imports em chorder se ele usar esse componente

#### 2.6 - Responsive Modal
- **ResponsiveModal**: Drawer no mobile, Dialog no desktop
- Usa `vaul` Drawer com `direction="right"` no desktop, `"bottom"` no mobile
- Chorder usa Dialog padrão do Radix

---

## 3. COMMITS PROPOSTOS (Segmentados por Migratibilidade)

### GRUPO A: Seguro para Migrar (0 dependências de DB)
Estes podem ser cherry-picked para chorder sem risco de conflito ou dados

#### Commit A1: "refactor: button floatante usar padrão de sistema com rounded-full"
**Arquivos:**
- `app/(main)/songs/ClientSongsPage.tsx`
- `app/(main)/services/ClientServicesPage.tsx`
- `components/common/FloatingAddLink/index.tsx`

**O que faz:** Refatora botão flutuante de criar música/serviço para usar `size="lg"` e apenas override `rounded-full`

**Por que é seguro:** Puro CSS/layout, zero impacto em lógica ou dados

---

#### Commit A2: "chore: adicionar chaves de tradução editService e deleteService"
**Arquivos:**
- `i18n/messages/pt-BR.json`
- `i18n/messages/en.json`

**O que faz:** Adiciona chaves `Messages.editService` e `Messages.deleteService`

**Por que é seguro:** Apenas tradução, zero impacto funcional

---

#### Commit A3: "style: aumentar titulo em forms de heading-sm para heading-lg"
**Arquivos:**
- `components/song/ArrangementForm/index.tsx`
- `components/service/ServiceForm/index.tsx`
- `components/service/ServiceForm/Skeleton.tsx`

**O que faz:** Títulos mais prominentes em forms de criação/edição

**Por que é seguro:** Puro estilo, zero lógica afetada

---

### GRUPO B: Parcialmente Migrar (Requer Adaptação)
Podem ser migrados com ajustes contextuais em chorder

#### Commit B1: "refactor: header com data e dirigente em layout responsivo"
**Arquivos:**
- `components/service/ServiceForm/index.tsx`
- `components/service/ServiceHeader/index.tsx`

**O que faz:** Data e dirigente em `flex-col` no mobile, `flex-row` no desktop

**Por que é parcial:** Chorder pode não ter essas informações no header de forms. Precisa adaptação.

**Estratégia de migração:**
- Verificar se chorder mostra data/dirigente no form
- Se sim: copiar `flex-col gap-0.5 sm:flex-row sm:gap-3`
- Se não: pular

---

#### Commit B2: "refactor: ActionMenu com labels customizados para liturgia"
**Arquivos:**
- `components/service/ServiceHeader/ServiceActionMenu.tsx`
- `components/common/ActionMenu/index.tsx` (já aceita `editLabel` e `deleteLabel`)

**O que faz:** Menu de ações mostra "Editar liturgia" / "Apagar liturgia"

**Por que é parcial:** Chorder usa labels genéricos ("Edit" / "Delete"). Migração é opcional (enhancement).

**Estratégia:** Pura customização de label, safe to cherry-pick se quiser UX melhorada

---

### GRUPO C: NÃO Migrar (Context/Arquitetura)
Mudam o fluxo de dados e acoplam com estrutura interna

#### ❌ NÃO Migrar: SongMetaModalProvider
**Razão:** Adiciona Provider novo que toca layout raiz. Chorder seria preciso restruturar modal state.

#### ❌ NÃO Migrar: Drawer Responsivo
**Razão:** Muda Dialog → Drawer em mobile. Requer novo componente `ResponsiveModal` com vaul.

#### ❌ NÃO Migrar: Header Clicável para Editar
**Razão:** Acopla form header com modal trigger. Chorder usa página separada para edição.

#### ❌ NÃO Migrar: Footer Grid Layout
**Razão:** Dependente de `FormFooter` customizado com grid. Chorder não tem esse padrão.

---

## 4. RESUMO DE MIGRATIBILIDADE

| Categoria | Commits | Risco | Esforço |
|-----------|---------|-------|--------|
| **A: Seguro** | 3 | 🟢 Nenhum | 5 min cada |
| **B: Parcial** | 2 | 🟡 Médio | 10 min + testes |
| **C: Não Migrar** | ∞ | 🔴 Alto | Não aplica |

**Recomendação:**
1. Comece com **Grupo A** (3 commits simples)
2. Avalie Grupo B conforme contexto de chorder
3. Deixe Grupo C para futuro se chorder quiser refatorar fluxos

