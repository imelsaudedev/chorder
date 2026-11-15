# Checklist de testes — Editor de plano de culto

## Criação de culto

- [ ] Criar culto a partir do template padrão — seções e itens aparecem com horários calculados
- [ ] Criar culto **sem template** — já abre com uma seção "Culto" padrão
- [ ] Botão salvar está desabilitado enquanto não houver nenhuma seção
- [ ] Criar culto com bloco livre ("Bloco livre...") — label fica editável, tipo ESPECIAL não causa erro
- [ ] Salvar culto recém-criado sem nenhuma música (só itens não-SONG)

## Reordenação via drag-and-drop

- [ ] Arrastar **item** dentro de uma seção — reordena corretamente
- [ ] Arrastar **item** entre seções diferentes — move sem perder dados
- [ ] Arrastar **seção** — reordena seções; horários atualizam em tempo real
- [ ] Indicador de drop (linha azul) aparece na posição correta durante o drag

## Seleção e adição de músicas

- [ ] Adicionar música com **um único arranjo** — vai direto, sem abrir seletor de arranjo\
  - [ ] Adicionar música com **múltiplos arranjos** — abre seletor de arranjo
- [ ] Adicionar a **mesma música duas vezes** no mesmo culto — cria dois `SongArrangement` distintos sem colisão de `arrangementId @unique`
- [ ] Adicionar música, salvar, reabrir o culto e conferir os **blocos de acorde** na aba Cifras
- [ ] Trocar a música de um item existente — arranjo antigo substituído e sem registro órfão no banco

## Re-salvar culto existente

- [ ] Abrir culto salvo, não mudar nada, salvar novamente — sem erros 500, sem duplicar registros
- [ ] Abrir culto salvo, **mudar só a duração** de um item, salvar — `ServiceUnit` correto atualizado
- [ ] Abrir culto salvo, **remover uma música**, salvar — `ServiceUnit` e `SongArrangement` órfãos deletados
- [ ] Abrir culto salvo, **reordenar músicas** via drag-and-drop, salvar — ordem reflete na aba Cifras

## View do culto — abas Liturgia e Cifras

- [ ] Aba **Liturgia** exibe seções, itens com horário, duração e ícone corretos
- [ ] Aba **Cifras** exibe músicas em sequência com blocos de acorde
- [ ] Toggle "Todos os itens" na aba Cifras intercala itens não-SONG entre as músicas
- [ ] Toggle ligado com item FALA que tem speaker — aparece `· Nome` no separador
- [ ] Toggle ligado com música sem seleção (placeholder) — item omitido sem crash
- [ ] Fullscreen na aba Cifras não é afetado pelo toggle "Todos os itens"

## Campos da música na chord view

- [ ] Músicas aparecem na ordem correta na aba Cifras após salvar
- [ ] Tom da música (`semitoneTranspose`) aparece corretamente
- [ ] Música adicionada antes do fix de unidades — exibe blocos de acorde (migração aplicada)

## Integridade de dados

- [ ] Culto com música A, salvar; trocar A por B, salvar — `SongArrangement` de A deletado, sem vazamento
- [ ] Culto com 2 músicas, remover uma, salvar — só 1 `ServiceUnit` restante para aquele `serviceId`
- [ ] Adicionar música, salvar, editar acordes na chord view, voltar ao editor e salvar novamente — edições de acorde **não sobrescritas**

## Itens não-SONG

- [ ] FALA com quem faz + descrição — texto aparece no accordion no editor
- [ ] ORACAO — mesmo comportamento da FALA
- [ ] LEITURA com versão + texto — texto aparece no accordion
- [ ] AVISOS e SERMAO — label inline editável (não abre drawer)
- [ ] PRELUDIO — apenas duração, sem drawer

## Marcadores de tempo

- [ ] Horário de início do culto refletido na primeira seção e primeiro item
- [ ] Alterar a duração de um item atualiza os horários de todos os itens seguintes em tempo real
- [ ] Item sem duração (`durationMin: null`) — horário fica invisível, cálculo dos subsequentes não quebra

## Cultos antigos (migrados do formato sem `plan`)

- [ ] Abrir culto migrado — aba Liturgia mostra seções e itens corretamente
- [ ] Salvar culto migrado sem alterações — não altera a ordem das músicas nem cria duplicatas
- [ ] Músicas de cultos migrados exibem blocos de acorde na aba Cifras

## Casos de borda

- [ ] Culto sem nenhuma música (só FALA, LEITURA etc.) — `syncSongUnits` processa lista vazia sem erro
- [ ] Música cujo **arranjo original foi deletado** depois de adicionada — chord view não quebra
- [ ] **Double-click no botão salvar** — não cria duplicatas de `SongArrangement`
- [ ] Template com músicas placeholder (sem `arrangementId`) — salvar não gera erro 500
