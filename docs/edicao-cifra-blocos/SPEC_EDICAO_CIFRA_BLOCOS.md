# SPEC: Edição da cifra por blocos (modo de edição total, com acordes tocáveis)

> Documento de entrada para o Claude Code. Descreve o problema, o comportamento desejado, as referências visuais e os limites do trabalho. **Não prescreve estrutura de arquivos, nomes de componentes nem modelo de dados.** Leia o código existente primeiro e adapte-se às convenções do projeto.

## 1. Como trabalhar nesta tarefa

**Não implemente nada ainda.** A primeira entrega é uma **análise do estado atual com leitura crítica desta spec** (seção 5), seguida de um **plano de implementação** (seção 7) para aprovação. Só depois da aprovação do Tiago comece a implementar.

Ordem esperada:

1. Ler `docs/edicao-cifra-blocos/PRE_ANALISE_ESTADO_ATUAL.md` (ponto de partida, **não** verdade) e investigar o código (seção 5.1). Gravar o resultado em `docs/edicao-cifra-blocos/ANALISE.md`.
2. Fazer a **leitura crítica** da solução proposta (seção 5.2): o que contradiz o código, o que não foi previsto, o que pode quebrar.
3. Levantar **conflitos e decisões abertas** (seção 6) e **perguntar ao Tiago**. **Não resolva conflito sozinho**, nem "escolhendo o mais razoável". Se tiver recomendação, registre-a ao lado da pergunta.
4. Produzir o plano (seção 7) em `docs/edicao-cifra-blocos/PLANO.md` e parar para aprovação.
5. Implementar em etapas pequenas, cada uma verificável por si só.

Se algo desta spec contradisser o que o código mostra, **o código vence**: aponte a divergência na análise em vez de seguir a spec às cegas.

Esta spec foi escrita **sem acesso ao banco, ao app rodando nem ao Vercel**. Tudo que ela afirma sobre o código vem de leitura estática da branch `feat/referencias-midia-lista` e está marcado como **[a confirmar]**. Confirme cada item antes de se apoiar nele.

### Regra de ouro: o miolo das cifras não muda

A renderização da cifra (parser ChordPro, `ChordProLine`/`StyledLine`/`Item`, estilos, alinhamento acorde-sílaba, `ColumnViewer` e `column-logic`, seletor de tom e transposição existentes) **é reaproveitada como está**. Esta tarefa **não altera** esse código nem o aspecto da cifra na **leitura**. Se for inevitável tocar nele (por exemplo, para tornar um acorde tocável, ver A2 na pré-análise e D3), **pare e pergunte**; não faça e não "melhore de passagem".

### Regras do repositório que valem aqui

Siga `CLAUDE.md` e `AGENTS.md`: PRs só para `main`, commits em pt-BR, regras de Zod (sem `.optional()`/`.transform()` com `zodResolver`), UI flutuante global no layout raiz quando houver conflito com os listeners do vaul, banco local compartilhado (sem `migrate deploy`). **Não é esperada nenhuma mudança de schema do banco**: o conteúdo continua sendo a string ChordPro de cada unidade. Se a análise concluir o contrário, pare e pergunte.

## 2. Contexto

Chorder é o app de louvor de uma igreja (pt-BR). Na liturgia, a visão **Cifras** de cada música tem um modo de edição (lápis) em que se corrige a cifra daquele culto e, opcionalmente, do arranjo original. Hoje esse modo mostra, para cada bloco, **um campo de texto ChordPro à esquerda e um preview à direita**, mais um painel lateral "Dicionário" (acordes e instruções) que insere texto na posição do cursor.

Isso funciona para quem domina ChordPro e em tela grande. No celular, que é onde a equipe ajusta cifra no ensaio, é pesado: digitar colchetes, posicionar cursor e alternar entre campo e dicionário. O objetivo é editar **tocando no resultado**, sem digitar sintaxe.

Premissas já decididas pelo Tiago, que **não se rediscutem aqui**:

- **A edição só começa pelo botão de editar** (lápis). Fora do modo de edição, tocar num bloco **não faz nada**. É por isso que não há "selecionar bloco para editar": evita abrir edição sem querer.
- **O modo de edição mantém o cabeçalho e o fluxo de Salvar/Cancelar existentes**, inclusive o **diálogo de escopo** (liturgia | liturgia + original).
- Dentro do modo de edição, **os blocos substituem o par "campo de texto + preview"**. Cada bloco mostra a própria cifra renderizada e **os acordes de todos os blocos já são tocáveis**, sem selecionar o bloco antes.
- **O painel "Dicionário" e a toolbar mobile deixam de existir.** O seletor de acordes passa a ser **contextual**: um modal que abre junto do acorde tocado.
- Cada bloco tem, no cabeçalho, **um seletor de tipo** e **um menu contextual** (Subir, Descer, Duplicar, editar como texto, Apagar). Reordenar é por **Subir/Descer**.
- **Repetiu é outro bloco.** Duplicar cria uma **cópia independente**. **Nenhuma edição altera dois blocos de uma vez.** O botão **Repetir ×N** sai da interface.
- **Cada escolha vale na hora**, sem linha de "confirmar". **Não há botão de desfazer**: o usuário refaz a ação. (O que protege de erro grave é que nada é gravado até Salvar, e Cancelar descarta a sessão.)
- Botões de ação em **ícones, sem texto**, com rótulo de acessibilidade e dica (`title`). **Menus** podem ter texto.
- O modal tem **a largura exata do bloco**, responsivo.
- Entrar na edição **não pode "pular" a tela**: cabeçalho, mapa (se existir), colunas e rolagem mantêm a posição.

## 3. Referência visual

Pasta `docs/prototipo-cifras/` (compartilhada com a spec de referências de mídia):

- `cabecalho-e-edicao.html`: **protótipo único e navegável** (abra no navegador). Alterna celular/desktop e tema claro/escuro. O **lápis** de cada música entra no modo de edição (uma música por vez). Durante a edição o tom some do cabeçalho e Salvar/X substituem o lápis; as referências continuam acessíveis.
- `capturas/`: relevantes a esta spec: 07 edição (celular), 08 menu de tipo, 09 menu do bloco, 10 modal do acorde, 11 modal com grade expandida, 12 modo texto, 13 descartar, 18 edição (desktop), 19 modal (desktop).

**O protótipo ilustra layout e interação. Nada nele é especificação de código, de dados ou de estilo.** Letras, autores e a lista de acordes são de exemplo. A pré-análise (seção C) lista onde o protótipo **diverge do app**; nesses pontos **vale o app**, salvo decisão em contrário na seção 6.

## 4. Objetivo

No modo de edição da cifra:

1. cada bloco ser editado **tocando nos acordes e na letra**, sem digitar ChordPro (o texto continua disponível como alternativa por bloco);
2. o seletor de acordes ser **contextual**, no lugar do Dicionário;
3. mover, duplicar, trocar o tipo e apagar blocos por **um menu por bloco**;
4. a edição **não alterar** o miolo da cifra nem a leitura;
5. o resultado salvo ser **a mesma string ChordPro de sempre**, sem perda.

## 5. Fase 0: análise do estado atual e leitura crítica

### 5.1 O que investigar

Grave em `docs/edicao-cifra-blocos/ANALISE.md`, com arquivos e linhas, **o que existe hoje** e **o que precisa mudar**. No mínimo:

- **Fluxo de edição na liturgia:** `ServiceSongUnitView`, `ServiceArrangementHeader` (Salvar, X, diálogo de escopo), `ServiceArrangementMeta` (lápis), `ServiceSongUnitEditForm` (form, `submitRef`, `preserveMedia`).
- **Lista e bloco de edição:** `SongUnitListForm` (e `InstructionToolbarContext`), `SortableUnitForm` (drag and drop, ressincronização de `order`), `UnitForm`, `AddUnitForm`, `ChordSidebar`, `ChordPickerPanel` (confirmar se está em uso), `useArrangementForm`/`useArrangementFormFields`.
- **Quem mais usa esses componentes:** `ArrangementForm` e as rotas `/songs/new` e `/songs/[song]/edit` (ver D1).
- **Dados e validação:** `schemas/song-unit.ts`, `schemas/arrangement.ts`, `prisma/models.ts` (`SONG_UNIT_TYPES`, `ClientSongUnit`), onde `repeatCount` e `notes` são lidos (leitura, Modo Palco).
- **Cifra:** `chopro/music.ts` (parser, `{c:}`/`{comment:}`), `chopro/chord-grid.ts`, `ChordProLine`/`StyledLine`/`Item`/`line-utils`, `ColumnViewer` e `column-logic` (numeração por tipo, `trim`, colunas), `unit-colors.ts`.
- **Configuração:** `SongConfig` (transposição, preferência enarmônica), `KeyButtonSet`, e **em que tom o conteúdo é guardado e mostrado durante a edição** (A5).
- **Camadas e layout:** z-index e sticky do cabeçalho, `--song-header-h`, `IntersectionObserver` da borda, componentes flutuantes existentes (Radix Popover/DropdownMenu), regra do `CLAUDE.md` sobre vaul.
- **Testes e stories a atualizar ou remover:** `ServiceSongUnitEditForm.test`, `ServiceSongUnitView.test`, `ServiceArrangementHeader.test`, stories de `UnitForm` e `SongUnitListForm`, e2e `visual-regression.spec.ts` e seus snapshots, `i18n/messages`.
- **Trabalho paralelo:** `docs/referencias-midia/` (mesmo cabeçalho/Meta) e as branches `fix/repeticao-bloco-ate-4x-v2` e `modo-palco`. Diga em que base de branch esta tarefa deve sair e se há conflito previsto.

### 5.2 Leitura crítica: o que provavelmente não foi previsto

Verifique cada item e registre **confirmado / refutado / parcial**, com evidência. Eles vêm da pré-análise, que é leitura estática.

1. **Caminho de escrita sem perda (A1).** O estado de verdade é uma string ChordPro. Um editor que reserializa pode alterar espaços, linhas vazias, diretivas desconhecidas e acordes incomuns (`[A4]`, `[D/F#]`). O que o leitor atual faz de `trim()`? Como garantir que abrir e salvar sem editar **não muda o conteúdo**?
2. **Acordes e palavras tocáveis sem tocar no miolo (A2).** Como obter alvo de toque por acorde/palavra com a mesma geometria do `StyledLine`, sem alterá-lo? Há alternativa que não duplique estilos?
3. **Colunas (A3).** A leitura distribui em colunas; a edição atual é uma coluna. O que "manter o posicionamento" exige tecnicamente? Subir/Descer na ordem das unidades, com blocos que mudam de coluna, é compreensível?
4. **Componente compartilhado (A4).** O que quebra no catálogo de músicas se `SongUnitListForm` mudar?
5. **Transposição durante a edição (A5).** Em que tom o conteúdo é guardado e inserido hoje? O que acontece com `transpose ≠ 0`?
6. **Bloco vazio (A6).** `content` vazio é inválido no schema e "Nova unidade"/"Inserir" criam blocos vazios. Como começa a edição de um bloco vazio no modo visual?
7. **Desempenho e estado (M1).** O que re-renderiza a cada toque de acorde? A seleção e o foco sobrevivem a `update(index, …)` e à `key` atual?
8. **Camadas (M3).** Onde o modal flutuante deve viver? Que tecnologia já usada serve (Popover, âncora virtual) e qual a limitação para "largura do bloco"?
9. **Dados legados (M5, M6).** `repeatCount > 1` e `notes` existentes: onde são exibidos e o que fazer com eles quando a UI de edição não os oferecer?
10. **Salvar e cancelar (M7).** Como o cabeçalho sabe se o formulário está alterado? Qual a menor mudança que preserva o diálogo de escopo?
11. **Conteúdo inválido (parser).** O que a edição visual faz com um bloco cujo ChordPro não faz parse hoje (`hasError`)?
12. **Acessibilidade e teclado (M10).** Ordem de tab, alvo de toque ≥ 44 px, ARIA dos menus.
13. **Testes e visual (seção 5.1).** O que cai e o que precisa de nova cobertura, incluindo regressão visual da edição.

## 6. Conflitos e decisões abertas (perguntar ao Tiago; não decidir sozinho)

Cada item traz a **recomendação inicial da spec**, que a análise pode refutar.

- **D1. Escopo.** Só a edição na liturgia, ou também a edição de música no catálogo (que usa o mesmo `SongUnitListForm`)? *Recomendação:* componente novo usado primeiro na liturgia; o catálogo continua com o editor atual até nova decisão. Só unificar se a análise mostrar que separar duplica demais.
- **D2. "Posicionamento da view".** Significa (a) manter a **posição de rolagem e a identidade dos blocos** ao entrar na edição, ou (b) também **manter as colunas da leitura** na edição? *Recomendação:* (a) obrigatório; (b) só se não exigir tocar no `ColumnViewer`. Edição em coluna única é aceitável na primeira entrega, se (a) for cumprido.
- **D3. Como tornar o acorde tocável sem alterar o miolo.** (a) componente novo que replica o alinhamento; (b) props aditivas no miolo. *Recomendação:* (a), com teste visual de paridade contra a leitura; (b) só com aprovação explícita.
- **D4. Drag and drop.** Remover (Subir/Descer cobre) ou manter no desktop? *Recomendação:* remover do bloco novo; não apagar o código antigo até D1 ser decidido.
- **D5. `repeatCount`.** O botão sai. E o dado legado (`> 1`)? *Recomendação:* continuar exibindo o selo na leitura, sem controle novo na edição; sem migração de dados. Perguntar se deve haver "converter repetição em blocos".
- **D6. "Adicionar instrução" por bloco (`unit.notes`).** O protótipo não mostra. *Recomendação:* **manter** (é dado existente exibido na leitura), como item do menu do bloco ou linha abaixo do título. Perguntar onde.
- **D7. Seletor expandido.** O ícone de grade abre o quê? *Recomendação:* a **grade existente** (`buildChordGrid`: Tríade, 7ª, Inv., Var., com preferência enarmônica) e o campo de digitar para qualquer outro acorde. O "nota × tipo" do protótipo só se o Tiago confirmar que o quer além disso.
- **D8. Convenções.** `{c:texto}` imediatamente antes do acorde, com a lista do app e "Personalizado...". O protótipo trouxe Break e Dim. e tirou Só voz/Só base: perguntar a lista final; **fonte única** (hoje duplicada).
- **D9. Tom na edição.** *Recomendação:* editar e mostrar acordes **no tom em que estão guardados**; se `transpose ≠ 0`, avisar ou fixar em 0 durante a edição (conforme a análise de A5).
- **D10. Inserir acima/abaixo e "Nova unidade".** O protótipo só tem Duplicar, Subir, Descer, Texto, Apagar. *Recomendação:* manter "Nova unidade" no fim da lista e **Inserir acima/abaixo** no menu, porque é como se adiciona bloco no meio. Perguntar.
- **D11. Cancelar com confirmação.** Hoje o X descarta direto. *Recomendação:* confirmar **só se houver alteração**, reaproveitando o diálogo de descarte existente. Perguntar se o Tiago aceita a mudança de comportamento.
- **D12. Apagar o último bloco.** *Recomendação:* permitir só se o schema do arranjo de liturgia aceitar lista vazia; caso contrário, desabilitar com explicação.
- **D13. Base de branch.** Sair de `main` ou da branch das referências de mídia, que mexe no mesmo cabeçalho? Tiago define.
- **D14. Tecnologia do modal.** Radix Popover (âncora virtual), elemento posicionado no container rolável (como no protótipo) ou outra? *Recomendação:* a que a análise mostrar compatível com o `CLAUDE.md` e com a largura do bloco, sem listeners conflitantes.

## 7. Plano de implementação (a produzir, sujeito a aprovação)

Entregue `PLANO.md` com etapas pequenas, cada uma com commit, verificação e risco. Ordem sugerida (a análise pode reordenar):

1. **Modelo de bloco (sem UI).** Módulo puro que lê a string ChordPro de um bloco em partes tocáveis (acordes, texto, convenções `{c:}`, o resto intocado) e a grava de volta. Testes de **identidade** (abrir/gravar sem editar não muda nada) e de cada operação (trocar, inserir, remover, mover, convenção) sobre conteúdo real do seed/mock.
2. **Casca do bloco.** Cabeçalho com seletor de tipo e menu do bloco (reaproveitando `TypeDropdown` e Radix DropdownMenu), Subir/Descer/Duplicar/Apagar com `order` ressincronizado. Ainda com o corpo antigo.
3. **Corpo visual.** Cifra do bloco com acordes e palavras tocáveis, paridade visual com a leitura (D3). Sem edição ainda.
4. **Modal do acorde.** Trocar, grade, digitar, convenções, ajustar posição, remover, inserir por palavra, fechar. Teclado.
5. **Modo texto por bloco** e tratamento de bloco vazio/inválido.
6. **Sessão de edição.** Salvar com escopo, Cancelar com confirmação (D11), remoção do Dicionário, da toolbar mobile e do Repetir da edição (conforme D1, D4, D5).
7. **Acabamento.** Acessibilidade, estados de foco, `prefers-reduced-motion`, i18n, testes, stories, regressão visual, limpeza combinada.

## 8. Comportamento esperado

### 8.1 Entrar e sair da edição
- O lápis atual inicia a edição. **A posição de rolagem e a altura dos blocos não mudam** ao entrar (medir antes/depois).
- Em leitura, tocar em bloco, acorde ou letra **não faz nada**.
- **Salvar** mantém o fluxo atual (diálogo de escopo se houver original). **X**: ver D11. Depois de salvar, a leitura mostra o resultado.
- Nada é gravado antes de Salvar. Não há aviso de "salvo automaticamente".

### 8.2 Cabeçalho do bloco (edição)
- À esquerda, o **seletor de tipo** (ponto de cor + nome com numeração, igual à da leitura), abrindo a lista dos tipos de `SONG_UNIT_TYPES` com as cores de `unit-colors.ts`. Trocar o tipo troca a cor e renumera.
- À direita, o **menu do bloco**. Itens: **Subir**, **Descer** (desabilitados nas pontas), **Duplicar**, **editar como texto / editar visual**, **Apagar** (em vermelho, após separador). Inserir acima/abaixo e instrução do bloco conforme D6 e D10. Rótulo do item de texto **não** pode ser "Texto" (colide com o tipo `TEXT`).
- Mover e duplicar **mantêm o bloco à vista** (rolagem mínima) e dão um destaque breve; respeitam `prefers-reduced-motion`.
- **Duplicar** cria a cópia logo abaixo, **não a seleciona** e não abre nenhum modo: ela é só outro bloco.
- **Apagar** não pede confirmação.
- O mapa da música, se existir na tela, **reflete a edição** (ordem, tipo, numeração). Seus botões usam as **siglas mínimas** da seção 8.2.1.

#### 8.2.1 Siglas dos tipos e rótulo "Final"

Decididas pelo Tiago. Valem no mapa da música, no Modo Palco e em qualquer rótulo curto; **o seletor de tipo e o cabeçalho do bloco mantêm o nome completo**.

| Tipo | Rótulo | Sigla | Numeração |
|---|---|---|---|
| Intro | Intro | I | só se houver mais de uma |
| Verso | Verso | V1, V2… | sempre |
| Pré-refrão | Pré-refrão | PR | nunca |
| Refrão | Refrão | R1, R2… | sempre |
| Ponte | Ponte | P | sempre |
| Interlúdio | Interlúdio | IL | só se houver mais de um |
| Solo | Solo | S | só se houver mais de um |
| Final | **Final** (antes "Saída") | F | só se houver mais de um |
| Bloco | Bloco | B | só se houver mais de um |
| Texto | Texto | T | só se houver mais de um |

- A numeração segue a ordem dos blocos da música e **se atualiza ao mover, duplicar, trocar o tipo e apagar** (ex.: duplicar um Verso renumera os seguintes).
- **O rótulo de `ENDING` muda de "Saída" para "Final"**: só o texto de `UnitTypes.ENDING`; o valor interno e o schema não mudam. Esta é a **única exceção** ao "não mudar `UnitTypes`". Afeta leitura, Palco, seletor de tipo, testes e snapshots que citam "Saída": listar na análise.
- Regra e textos em **um só lugar** (chaves `UnitTypesShort.*` em `i18n` e uma função única que recebe tipo e posição), reaproveitada pelo mapa, pela edição e pelo Palco. Se obter o número exigir mexer no miolo (`column-logic`), parar e perguntar (regra de ouro).
- Chips com `aria-label` e `title` com o nome completo ("Refrão 2"). Mínimo de 36 px de largura por chip e alvo de toque ≥ 44 px (área de toque pode exceder o desenho).

### 8.3 Acorde (modal contextual)
- Tocar num acorde o **seleciona** e abre o modal **na largura exata do bloco**, acima do acorde; abaixo, se não couber. Fica acima do cabeçalho sticky e dentro da tela.
- Conteúdo, de cima para baixo, separado por linhas:
  1. **Acordes do tom** (derivados da grade, respeitando a preferência enarmônica), o acorde atual marcado, o **ícone de grade** (D7) e, no desktop, o **campo de digitar** ao lado do ícone, **sem lista suspensa de sugestões**.
  2. (Se a grade estiver aberta) o conteúdo expandido, também aplicando na hora.
  3. **Convenções** (D8): tocar aplica ao acorde; tocar de novo remove.
  4. **Ações do acorde**: mover uma letra ◀ ▶ (desabilitado quando não há letra para atravessar), **remover** acorde, **fechar**.
- **Toda escolha aplica imediatamente** e atualiza o bloco. **Não há linha de confirmar** e **não há botão de desfazer.**
- Tocar de novo no acorde selecionado, tocar fora do modal ou **Esc** fecha. Com a grade aberta, **Esc** fecha primeiro a grade.
- A edição vale **só para o bloco editado**. Blocos idênticos não são alterados.
- Digitar um acorde inválido mostra um aviso breve e **não altera** nada; Enter confirma o válido.

### 8.4 Letra e inserção
- Tocar numa **palavra** insere um acorde no início dela e o seleciona (já abrindo o modal). Se já houver acorde ali, só o seleciona.
- O acorde inserido nasce no **acorde do tom (I)** ou outro padrão definido na análise.
- Remover um acorde devolve sua sílaba ao trecho anterior; **a letra nunca se perde**.

### 8.5 Modo texto por bloco
- Troca o corpo do bloco pelo **ChordPro puro**, editável, e volta. Alterações de texto valem para o bloco imediatamente.
- Blocos do tipo `TEXT` seguem com o editor de markdown atual; o modo visual de acordes **não se aplica** a eles.
- Bloco **vazio** ou com ChordPro **inválido** abre direto no modo texto (ou mostra o ponto de partida definido na análise).

### 8.6 Teclado (desktop)
- **←/→** e **Tab/Shift+Tab** navegam entre acordes; **Alt+←/→** ajustam a posição; **Delete/Backspace** remove o acorde; uma letra **A–G** foca o campo de digitar com a letra; **Esc** fecha grade, depois modal.
- Menus (tipo e bloco) navegam por **setas**, abrem e fecham por teclado, e devolvem o foco ao gatilho.

### 8.7 Dados e salvamento
- O conteúdo salvo é a **string ChordPro** de cada unidade. Abrir e salvar **sem editar não altera nada** (critério de aceitação).
- Acordes, convenções e letra **não sofrem `trim`/normalização** na escrita.
- `order` permanece consistente após mover, duplicar, inserir e apagar.
- Sem migração de dados e sem mudança de schema do banco.

### 8.8 Acessibilidade e aparência
- Alvos de toque ≥ 44 px (a área de toque pode exceder o desenho do acorde). Botões só com ícone têm rótulo acessível e `title`.
- Foco visível; o modal é `group`/`dialog` com nome do acorde; menus com semântica de menu.
- Tema claro e escuro. Cores por tipo vêm de `unit-colors.ts`. Botões e modal em estilo **outline padrão** do projeto (sem fundo colorido próprio).
- Sem animação com `prefers-reduced-motion`.

## 9. Textos (pt-BR; passar por `next-intl`)

| Contexto | Texto |
|---|---|
| Menu do bloco | Subir · Descer · Duplicar · Editar como texto / Editar visual · Apagar |
| Tipos | os de `UnitTypes.*`, com `ENDING` = "Final" (único ajuste) |
| Siglas | `UnitTypesShort.*`: I · V · PR · R · P · IL · S · F · B · T |
| Rótulos de acessibilidade | Mover para cima · Mover para baixo · Duplicar bloco · Remover bloco · Ações do bloco {nome} · Acorde {acorde} · Todas as notas e tipos · Mover acorde uma letra para a esquerda/direita · Remover acorde · Fechar · Digitar acorde |
| Placeholder do campo | `Am7` |
| Aviso de acorde inválido | Acorde não reconhecido: {texto} |
| Cancelar com alteração | Descartar as alterações feitas? · Continuar · Descartar (reaproveitar o diálogo existente, se houver) |
| Convenções | as de D8 |

Substituir os textos fixos de `UnitForm` ("Inserir acima/abaixo", "Repetir bloco") por chaves de `i18n`.

## 10. Fora de escopo

- Cabeçalho da música, referências de mídia, mapa da música (apenas **não quebrar**, e refletir a edição se já existir).
- Modo Palco e Modo de leitura (nenhuma mudança visual).
- Desfazer/refazer, edição em vários blocos de uma vez, bloco vinculado a outro.
- Mudar o parser, o `ColumnViewer` ou a aparência da leitura (salvo aprovação, D3). A exceção é o texto do rótulo `ENDING` → "Final" e as siglas do mapa (8.2.1).
- Edição de letra por toque (só acordes e convenções; a letra se edita no modo texto).
- Migração de dados ou mudança de schema.

## 11. Critérios de aceitação

1. Fora do modo de edição, tocar em qualquer parte da cifra não altera nada.
2. Ao entrar na edição, a rolagem e a altura dos blocos não mudam.
3. **Abrir a edição e salvar sem alterar produz exatamente o mesmo conteúdo** (teste automatizado em amostra real).
4. Trocar, inserir, remover e mover um acorde altera **só** o trecho tocado; a letra e o restante do bloco permanecem idênticos.
5. Uma convenção aplicada aparece acima do acorde na edição **e na leitura**, e é a mesma `{c:...}` que o app já entende.
6. Nenhuma edição altera mais de um bloco.
7. Subir/Descer/Duplicar/Apagar mantêm `order` correto, na ordem das unidades, também com mais de uma coluna.
8. O modal tem a largura do bloco em celular e desktop, não fica atrás do cabeçalho e não sai da tela.
9. Salvar com original mantém o diálogo de escopo; Cancelar segue D11.
10. Bloco vazio, inválido e `TEXT` têm comportamento definido e sem erro.
11. Funciona por teclado (seção 8.6) e com leitor de tela nos menus e no modal.
12. Tema escuro e claro corretos; sem regressão visual na leitura.
13. Testes novos e atualizados passam; nada que dependia do Dicionário/toolbar fica quebrado.
14. O mapa usa as siglas da 8.2.1 (I, V1, PR, R1, P, IL, S, F, B, T), com numeração correta depois de mover, duplicar, trocar tipo e apagar, e `ENDING` aparece como "Final" em todo o app.

## 12. Roteiro de teste manual

1. No celular, abra uma música da liturgia, toque em blocos e acordes: nada acontece.
2. Toque no lápis: a tela não pula. Toque num acorde de um bloco qualquer: o modal abre na largura do bloco.
3. Troque o acorde por um do tom; por um da grade; digitando (desktop). Cada escolha vale na hora.
4. Aplique Pausa e depois a retire. Salve e confira na leitura que a convenção aparece acima do acorde.
5. Toque numa palavra no meio da frase, ajuste com ◀ ▶ e remova o acorde.
6. Duplique um refrão, edite um acorde só na cópia e confira que o original não mudou.
7. Suba e desça blocos, inclusive com duas colunas na leitura. Troque o tipo de um bloco.
8. Abra um bloco como texto, edite, volte ao visual.
9. Apague um bloco, depois Cancele: ele volta. Faça de novo e Salve.
10. Abra e salve sem editar: confira (diff) que o conteúdo não mudou.
11. Repita em tema escuro e com navegação por teclado.

## 13. Entregáveis

- `docs/edicao-cifra-blocos/ANALISE.md` (estado atual + leitura crítica), `PLANO.md` e, depois da aprovação, o código em PRs pequenos para `main`.
- Testes novos (modelo de bloco com identidade, operações, comportamento do modal, regressão visual) e stories atualizadas.
- Lista de decisões da seção 6 com a resposta do Tiago, registrada em `ANALISE.md`.
- Nota final com o que ficou fora, o que foi limpo (ou deixado para depois) e riscos restantes.
