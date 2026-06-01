# Análise de Risco: Merge chorder-alt → chorder

## Cenário
Se todo o código do `chorder-alt` substituísse o `chorder`, o que quebraria?

---

## 🔴 BREAKING CHANGES (Que quebram)

### 1. Componente Deletado
**Arquivo:** `components/service/ServiceForm/ServiceInfoFormSkeleton.tsx` — **DELETADO**

**Risco:** ⚠️ **CRÍTICO**
- Se chorder importa esse arquivo em algum lugar, terá erro de build
- **Verificar em chorder:**
  ```bash
  grep -r "ServiceInfoFormSkeleton" --include="*.ts" --include="*.tsx"
  ```

**Solução:**
- Restaurar arquivo com conteúdo do chorder original
- OU ajustar imports para usar `ServiceForm/Skeleton` unificado

---

### 2. Nova Provider no Layout Raiz
**Arquivo:** `app/layout.tsx` → `<SongMetaModalProvider>`

**Risco:** ⚠️ **MÉDIO**
- Adiciona novo contexto que toca toda a árvore de componentes
- `SongMetaModal` agora precisa ser renderizado no layout
- Se chorder tem sua própria estrutura de contextos, isso pode conflitar

**Impacto:**
- Forms agora abrem drawer via context em vez de página separada
- URLs de `/songs/new` e `/songs/[id]/edit` continuam existindo, mas comportam-se diferente

---

### 3. Modal Responsivo (Drawer com direção responsiva)
**Arquivo:** `components/common/ResponsiveModal/index.tsx` — **NOVO**

**Risco:** 🟢 **BAIXO**
- Usa **Drawer em ambos** (mobile e desktop)
- Apenas `direction` muda: `"bottom"` (mobile) vs `"right"` (desktop)
- Mais consistente que Dialog/Drawer misto

**Impacto em chorder:**
- ServiceMetaModal e SongMetaModal abrem como Drawer (mesma UI em ambos)
- Mudança de direção conforme tela: não é breaking, apenas layout responsivo

---

### 4. Fluxo de Edição de Metadados
**Afetados:** `components/song/ArrangementForm/index.tsx`, `components/service/ServiceForm/index.tsx`

**Antes (chorder):**
```
User taps pencil → Navigate to /songs/[id]/edit
```

**Depois (alt):**
```
User taps header (título clicável) → Trigger context provider → Drawer abre
```

**Risco:** 🟡 **MÉDIO**
- URLs `/songs/[id]/edit?meta=true` podem não mais funcionar como esperado
- Botão de voltar funciona diferente (drawer não cria novo "página" no histórico)

---

## 🟡 BEHAVIORAL CHANGES (Que mudam comportamento)

### 5. Header Clicável + Ícone Lápis
**Antes:** Botão separado (ícone lápis) que abre página de edição
**Depois:** Título inteiro é clicável, abre drawer

**Risco:** 🟢 **BAIXO** (UX improvement, não quebra funcionalidade)

---

### 6. Footer com Grid Layout
**Antes:** Botões em linha ou stackados conforme viewport
**Depois:** Grid no mobile (2 colunas), flex no desktop

**Risco:** 🟢 **BAIXO** (visual apenas)

---

### 7. Ícone Plus no Floating Button
**Antes:** SVG Plus customizado com sizes diferentes
**Depois:** `size-6` uniforme em mobile e desktop

**Risco:** 🟢 **BAIXO** (visual apenas)

---

## 🟢 SAFE CHANGES (Que não quebram)

### 8. Tradução Nova
- `Messages.editService`, `Messages.deleteService` — adiciona sem remover
- **Risco:** 🟢 **NENHUM** (additive)

### 9. Text Hierarchy (heading-lg)
- Títulos maiores em forms
- **Risco:** 🟢 **NENHUM** (visual apenas)

### 10. Responsive Header (data/dirigente em duas linhas)
- **Risco:** 🟢 **NENHUM** (layout responsivo)

### 11. Database Schema
- **Risco:** 🟢 **NENHUM** (não há mudanças em schema)

---

## ⚠️ VERIFICAÇÕES NECESSÁRIAS ANTES DO MERGE

```bash
# 1. Verificar imports de ServiceInfoFormSkeleton
grep -r "ServiceInfoFormSkeleton" ../chorder --include="*.ts" --include="*.tsx"

# 2. Verificar imports de SongMetaModalProvider
grep -r "SongMetaModalProvider" ../chorder --include="*.ts" --include="*.tsx"

# 3. Verificar imports de ResponsiveModal
grep -r "ResponsiveModal" ../chorder --include="*.ts" --include="*.tsx"

# 4. Verificar /edit route handling
grep -r "\\[id\\]/edit" ../chorder --include="*.ts" --include="*.tsx"

# 5. Rodando testes
cd ../chorder && npm test
```

---

## 📊 RESUMO DE IMPACTO

| Item | Tipo | Risco | Ação |
|------|------|-------|------|
| ServiceInfoFormSkeleton deletado | Breaking | 🔴 CRÍTICO | Verificar uso em chorder |
| SongMetaModalProvider novo | Breaking | 🟡 MÉDIO | Mover para layout |
| ResponsiveModal novo (Drawer) | Styling | 🟢 BAIXO | Drawer com direção responsiva |
| Header clicável | Behavioral | 🟢 BAIXO | Testar navegação |
| Grid footer | Styling | 🟢 BAIXO | Aceito |
| Tradução nova | Safe | 🟢 NENHUM | Aceito |

---

## 🎯 RECOMENDAÇÃO

**NÃO fazer merge direto.** Em vez disso:

### Estratégia Segura de Merge (3 etapas)

#### Etapa 1: Cherry-pick Seguro (Grupo A)
```bash
git cherry-pick \
  <commit-botao-flutuante> \
  <commit-traducao> \
  <commit-estilo-titulo>
```
**Tempo:** 5 min, risco mínimo

#### Etapa 2: Teste em Staging
- Rodas testes em chorder com Grupo A
- Verifica se nada quebrou

#### Etapa 3: Selective Merge de B (com adaptação)
- Header responsivo: adaptar se chorder usa mesmo layout
- Labels customizados: adaptar ActionMenu se chorder o usa

#### Etapa 4: Decidir sobre C
- Context API / Drawer / Header clicável: futuro maior refactor

---

## 🛑 DECISÃO A TOMAR

**Pergunta para o time:**

> "Queremos refatorar o fluxo de criação/edição em chorder para usar modal drawer responsivo (como alt), ou preferimos manter página separada?"

**Se SIM:** Prepare-se para:
- Adicionar SongMetaModalProvider ao layout
- Adicionar ResponsiveModal
- Mudança de UX significativa (positiva)
- ~2-3 days de work

**Se NÃO:** Use estratégia cherry-pick (Group A apenas)

