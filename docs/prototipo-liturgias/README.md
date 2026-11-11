# Protótipo da tela de Liturgias (lista)

Protótipo navegável da lista de liturgias redesenhada. Abrir `liturgias-lista.html` no navegador (duplo clique, sem dependências). Mostra ilustrativamente estrutura, layout e interação; a implementação usa os componentes reais e confere no navegador.

## Problemas da tela atual

- O menu ⋯ do cabeçalho tem um único item ("Editar modelos") e é a única tela de lista com ações sem link de voltar; no celular isso abre uma linha de 36px só para um ícone e empurra o h1.
- O ⋯ das linhas só aparece no hover, então não existe no toque.
- O próximo culto mostra só título, data e dirigente.
- Os cultos passados são uma pilha de meses, sem busca, filtro, ordenação nem limite.
- As linhas não seguem o padrão da lista de músicas; o link é `<a>` comum (recarrega a página).

## Decisões (conversa com o Tiago)

- **Não** mostrar as músicas no card do próximo culto: a pessoa precisa abrir a liturgia de qualquer forma.
- **Sim** a busca, filtros e ordenação no histórico. Revisitar cultos passados não é comum hoje, mas o histórico serve para analisar padrões e buscar algo.
- Duplicar liturgia **não existe** hoje e fica fora do escopo.
- O ⋯ do cabeçalho some: **Modelos** vira botão secundário e **Nova liturgia** vira o botão principal no tablet e no desktop (no celular continua o botão flutuante, como em Músicas).

## O que o protótipo mostra

- **Cabeçalho:** h1 + ações na mesma linha, sem a faixa extra.
- **Próximos cultos:** o próximo em destaque (data grande, dirigente, pregador, tema, situação, nº de músicas, início) e os seguintes em linhas compactas.
- **Histórico:** busca, filtros (ano, dirigente, pregador), ordenação, agrupamento (mês, ano, dirigente ou nenhum), contagem e "limpar filtros". Meses antigos entram recolhidos; busca e filtro abrem tudo.
- **Itens da linha configuráveis** (caixas no topo): dirigente, pregador, tema e texto, nº de músicas, início, situação, atualizado em. No celular os itens escolhidos viram a linha de baixo; no tablet e desktop, colunas com cabeçalho.
- A tabela no fim da página diz de onde cada item viria (já existe, calcular ou novo campo).

## Perguntas em aberto

- Quais itens ficam por padrão em cada largura? O protótipo parte de dirigente e nº de músicas.
- A busca por música (título de música dentro do `plan`) entra já ou numa segunda etapa? Ela é o principal uso do histórico para "buscar algo".
- "Situação" (rascunho/incompleta/completa) precisa de uma regra combinada; a do protótipo é só um exemplo.
- Modelo usado exigiria um campo novo e só vale se houver uso real.
