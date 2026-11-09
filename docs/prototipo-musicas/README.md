# Protótipo da tela de Músicas (explorar por categorias)

Protótipos navegáveis da nova tela de Músicas, usados pela spec [`../SPEC_CATEGORIZACAO_VISAO.md`](../SPEC_CATEGORIZACAO_VISAO.md). Abrir no navegador (duplo clique, sem dependências; as fontes vêm do Google Fonts e, sem internet, caem numa fonte padrão).

- `musicas-explorar.html` — a tela completa (home, página de uma categoria, lista, adicionar a uma liturgia).
- `item-lista.html` — só o item da lista, nas três larguras, com o botão de referências e o popover por arranjo.

Controles do topo de `musicas-explorar.html`: **Tela** (celular, tablet, desktop), **Item da lista** (novo × atual), **Moldura** (nenhuma, só a lista, tudo), **Alfabeto** (linha × ícone), **Botões** (contorno × fundo), **Lista no celular** (com margem × largura total) e "Restaurar exemplo". Os padrões são os escolhidos: moldura só na lista, alfabeto em ícone, botões com fundo, lista em largura total.

**O protótipo ilustra estrutura, layout e interação.** As medidas abaixo são as que foram escolhidas olhando o protótipo; a implementação usa os componentes reais e confere no navegador (revisão visual no fim).

## Exemplo × real

- Títulos, artistas, as duas primeiras linhas da letra e datas de uso vêm do acervo local. Os números de uso do protótipo foram contados na tabela antiga `ServiceUnit`; na implementação vêm de `Service.plan` (já feito em `retrieveSongUsage`).
- A classificação (tags), as referências de vídeo/áudio e os arranjos extras são inventados. Cerca de metade das músicas fica sem classificação de propósito.
- As liturgias do fluxo "Adicionar a uma liturgia" são de exemplo.

## Decisões

### Home
- O **Tipo** é o destaque: cards em grade, sem rolagem lateral (2 colunas no celular, mais nas telas maiores). Cada card abre a página daquela categoria.
- Os demais grupos são **prateleiras** de uma linha, com rolagem lateral. Grupo sem músicas classificadas não aparece; grupo "proposto" ganha o selo "em construção".
- A home termina com a **lista completa** (mesmos blocos da página de categoria). A busca do topo leva até a lista na primeira letra digitada.
- A apresentação de cada grupo é configurável (`destaque`, `prateleira` ou `filtro`).

### Página de uma categoria
- **Capa** em largura total, só com **cor** (a imagem de capa fica para depois). O link **Voltar** (sem fundo, alinhado ao conteúdo, 16 px do topo e 24 px no desktop) e todos os textos da capa usam **uma tinta só, calculada pelo contraste**: branco com gradiente escuro, ou tinta escura com gradiente claro, o que precisar de menos reforço até as duas regiões (topo e base) chegarem a 4,5. O ícone de personalizar segue a mesma tinta e aparece só no hover (sempre visível no toque).
- **Bloco 1 — filtros** (sem moldura): uma linha com os seletores de categoria à esquerda e, à direita, **lupa**, ícone **`letters`** e **ordenação**. A lupa abre um campo ao lado dos seletores (nunca por cima deles). Sem a linha do alfabeto, o espaço até a lista diminui 8 px.
- **Bloco 2 — lista** (com moldura): começa no **cabeçalho** ("36 músicas", Letra e categorias; no desktop: Música, Letra, Categorias, Último uso). Em seguida, as linhas, separadas por **faixas de letra**: faixa contínua de ponta a ponta, 32 px, mesmo fundo do cabeçalho, letra em azul. Não é fixa ao rolar.
- **Celular:** os filtros quebram em duas linhas (categorias com rolagem lateral; embaixo, lupa, `letters` e ordenação, à esquerda; 8 px entre as linhas). A lista vai em **largura total**, com o texto alinhado ao resto da página.
- A busca é sempre da categoria ("Buscar em Natal"). Os demais grupos viram seletores; o filtro aplicado aparece dentro do seletor, com ✕. No celular o seletor abre uma folha de baixo e o filtro vale ao vivo; nas telas maiores é um menu.
- **Ordenação:** "Título", "Uso em liturgias" e "Compositor"; a seta indica o sentido e tocar de novo no mesmo item inverte; a escolha fica lembrada no aparelho. O ícone `letters` abre uma grade de letras (as sem música ficam apagadas) e só existe na ordem por título. Há também a opção de alfabeto em linha, para comparação.
- **Ao abrir uma música e voltar, a lista mantém a categoria, a busca, a ordenação e a posição.** Hoje isso não acontece (ver "Estado da navegação" abaixo).

### Item da lista
- Sem tom (decisão de quem monta o culto). Título em 16 px/600 (18 px no desktop); **todo o resto em 14 px**; categorias em chip de 12 px.
- **Chip** (padrão do sistema todo): fundo claro da cor da categoria, **texto escurecido até contraste ≥ 4,5**, sem borda, canto de 4 px. No máximo **2 linhas**; o que não couber vira "+N".
- Alinhado pelo **topo** nas três larguras. **Tablet:** duas colunas (título, autor e último uso empilhados | duas linhas da letra e categorias | referências e ⋯). **Desktop:** seis colunas com cabeçalho. **Celular:** título, autor · último uso, referências e ⋯ (sem letra e sem categorias).
- Respiro de linha de 16 px (12 px nas laterais no celular), com lateral de 16/20/24 px conforme a largura.
- **Último uso:** ícone de relógio; escala do app (`formatTimeAgo`: hoje, ontem, há N dias/semanas/meses/anos); âmbar nas últimas 3 semanas; "Nunca usada" em itálico.
- **Referências:** um botão só, com os ícones do que existe (vídeo vermelho, áudio azul). Uma fonte toca direto; duas ou mais abrem um popover de leitura, agrupado pelo nome do arranjo quando mais de um arranjo tem mídia. Não há seletor de arranjo na lista (arranjos são versões da mesma música: tom, repetições, mapa).
- Tocar na linha **abre a música**. O menu ⋯ tem "Adicionar a uma liturgia…", "Editar dados" e "Editar arranjo".
- "Adicionar a uma liturgia" abre a lista das **próximas** liturgias (folha no celular, janela nas telas maiores). Uma por vez, a música entra no fim, "Já está" aparece desabilitado e o aviso traz "Desfazer".

### Estilo geral
- **Botões** sem contorno, com fundo semitransparente (cinza-azulado a 22%, 38% no hover). O campo de busca expandido tem o mesmo visual (quadrado de cantos de 6 px). Gap horizontal único de 8 px entre os elementos da barra de filtros.
- **Escala vertical:** 24 px entre blocos (capa → filtros → lista); 8 a 12 px dentro de um bloco.
- **Moldura** (cartão com borda, canto de 12 px, sombra leve) só na lista; as outras opções existem para comparar.
- Referência de layout: Flowbite (tabelas com usuários e produtos). O Flowbite não tem faixa de grupo entre linhas; a faixa de letra é nossa.

## Estado da navegação (levantamento)

Verificado no app atual (`/songs`): o texto da busca fica na URL (`?query=`), mas **o filtro de categoria é um `useState`** de `ClientSongsPage` e se perde ao sair da tela, e o link Voltar da música é fixo em `/songs`. Na prática, abrir uma música e voltar pelo link do app apaga a busca e a categoria. A implementação deve levar busca, categoria, ordenação e rolagem para a URL e fazer o Voltar da música retomar a lista como estava.

## Fora do protótipo

Tela da música, Modo Palco, edição de dados, criação de nova liturgia, administração das categorias e o seletor de músicas do editor de culto (`SongPicker`), que segue com o item atual.
