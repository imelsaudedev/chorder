# Protótipo da tela de Músicas (explorar por categorias)

Protótipo navegável da nova tela de Músicas, usado pela spec [`../SPEC_CATEGORIZACAO_VISAO.md`](../SPEC_CATEGORIZACAO_VISAO.md). Abrir `musicas-explorar.html` no navegador (duplo clique, sem dependências; as fontes vêm do Google Fonts e, sem internet, caem numa fonte padrão).

Controles do topo: tamanho de tela (celular, tablet, desktop), item da lista (novo × atual) e "Restaurar exemplo".

**O protótipo ilustra estrutura, layout e interação. Nada nele é especificação de código, de dados ou de medidas finais.** O acabamento (espaçamentos, hierarquia de peso) é feito na implementação, com os componentes reais. O visual espelha o app (`app/globals.css`, `NavBar`, `Tag`, `Button`).

## Exemplo × real

- Títulos, artistas, datas e contagem de uso vêm do acervo local. Os números de uso do protótipo foram contados na tabela antiga `ServiceUnit`; na implementação devem vir de `Service.plan`.
- A classificação (tags), as referências de vídeo/áudio e os arranjos extras são inventados. Cerca de metade das músicas fica sem classificação de propósito.
- As liturgias do fluxo "Adicionar a uma liturgia" são de exemplo.

## Decisões de arquitetura de informação

**Home**
- O **Tipo** é o destaque: cards em grade, sem rolagem lateral (2 colunas no celular, mais nas telas maiores). Cada card abre a página daquela tag.
- Os demais grupos (Ocasião, Atmosfera...) são **prateleiras** de uma linha, com rolagem lateral. Grupo sem músicas classificadas não aparece; grupo "proposto" ganha o selo "em construção".
- A home termina com a **lista completa** (filtros, contagem, ordenação, faixa de letras). Só a busca fica fixa no topo; a primeira letra digitada leva até a lista, sem trocar de tela.
- Como a apresentação de cada grupo é configurável (`destaque`, `prateleira` ou `filtro`), a home não presume quais grupos existem.

**Página de uma tag**
- A página é **uma tag só**, a que foi tocada. Capa em largura total (rola junto), botão Voltar sobre a capa e, no canto oposto, um ícone de personalizar (cor, padrão ou imagem) que aparece só no hover (sempre visível no toque).
- A busca é sempre da categoria ("Buscar em Natal"). Para buscar no acervo todo, volta-se para Músicas.
- Os demais grupos viram **chips de filtro** numa linha (rolagem lateral no celular), com o valor aplicado dentro do chip e ✕ para limpar. No celular o chip abre uma folha de baixo e o filtro vale ao vivo; nas telas maiores é um menu. Isso inclui o Tipo (ex.: Natal + Congregacional).
- **Ordenação**: A-Z, Uso em liturgias e Compositor. Tocar de novo no mesmo item inverte o sentido; a escolha fica lembrada no aparelho. A **faixa de letras** e os divisores só existem na ordem A-Z. Não há alfabeto fixo.

**Item da lista**
- Sem tom (decisão de quem monta o culto). O botão de play (vídeo ou áudio) fica à direita do título.
- Último uso com ícone de relógio, no mesmo corpo do autor, na linha de baixo; âmbar se foi nas últimas 3 semanas.
- Tocar na linha **abre a música**, como hoje. O menu ⋯ tem "Adicionar a uma liturgia…", "Editar dados" e "Editar arranjo".
- "Adicionar a uma liturgia" abre a lista das **próximas** liturgias (folha no celular, janela nas telas maiores). Uma por vez, a música entra no fim, "Já está" aparece desabilitado e o aviso traz "Desfazer".

## Fora do protótipo

Tela da música, Modo Palco, edição de dados, criação de nova liturgia e o seletor de músicas do editor de culto (`SongPicker`), que segue com o item atual.
