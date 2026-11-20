# Spec (visão): lógica de categorização das músicas

Status: visão. Define a lógica e as intenções de uso. Não define modelo de dados nem layout final.

## 1. Objetivo

Hoje a lista de músicas do Chorder é uma lista plana com busca por texto. A meta é transformar a classificação das músicas em **navegação e busca**, no estilo de plataformas de música (Spotify): quem monta o culto explora por "prateleiras" e filtros, em vez de depender de lembrar o título.

A pergunta de quem escolhe uma música não é "qual o nome dela?", mas coisas como:
- "Preciso de uma música congregacional de celebração."
- "Quero algo sobre a cruz, mais íntimo, para depois da mensagem."
- "O que temos para o Natal?"

## 2. Princípio central: grupos independentes

A classificação é feita por **grupos de tags independentes**. Cada grupo responde a uma pergunta diferente sobre a música, e o valor de um grupo diz pouco sobre os outros (na análise das letras, o assunto "Amor de Deus" apareceu em todas as atmosferas, com 54% a 73% das músicas). Por isso o poder da busca vem de **combinar grupos**, não de um único eixo.

Cada grupo tem:
- um **nome** e a pergunta que responde;
- uma lista de **valores**;
- uma **cardinalidade**: escolha única (cada música tem no máximo um valor) ou múltipla;
- um **status**: fechado, proposto ou indefinido.

O sistema deve tratar grupos e valores como **dados configuráveis**, não como constantes no código. Os valores de vários grupos ainda vão mudar depois do processo participativo (seção 5), e a interface não pode precisar de alteração por isso.

## 3. Grupos

### 3.1 Tipo (fechado, escolha única)
Pergunta: "que tipo de música é essa e como a congregação participa?"

Valores: `Congregacional` · `Hino` · `Infantil` · `Apresentação`

Apresentação é a música cantada para a comunidade, que não necessariamente canta junto. O Tipo captura o **uso típico esperado**, não uma regra absoluta. Já existe no sistema.

### 3.2 Ocasião (existente no sistema)
Pergunta: "para qual ocasião especial ou data a música serve?"

Exemplos que já existem: Natal, Ceia etc. Cobre as datas e rituais pontuais (Natal, Páscoa, Advento, Ceia, Batismo). Já existe no sistema. A interface deve ler os valores existentes, não presumi-los. Quem implementa deve verificar no código o estado atual, incluindo a cardinalidade.

Observação: Ocasião é diferente de "Momento" do culto (abertura, pós-mensagem, encerramento), que fica **de fora** do sistema de tags por decisão do produto (seção 4).

### 3.3 Atmosfera (proposto, a validar com o grupo, múltipla ou única ainda em aberto)
Pergunta: "como a música faz a congregação se sentir? qual a energia?"

Valores candidatos:
- `Celebração`: energia alta, alegria, exaltação coletiva.
- `Adoração`: intimidade, contemplação, dirigida a Deus.
- `Clamor`: súplica, entrega, urgência emocional.
- `Declaração`: afirmação de fé e confiança, mais racional que emocional.
- `Reflexão`: meditativo, narrativo ou doutrinário, andamento mais lento.

O nome "Atmosfera" substitui "Tom", que se confunde com o tom musical das cifras. O nome ainda não foi confirmado. Este grupo é o mais útil para sequenciar o culto (passar da celebração à adoração é uma decisão musical).

Tensões conhecidas que o grupo vai discutir: Adoração vs Reflexão (a primeira é dirigida a Deus, a segunda é mais narrativa ou doutrinária) e Clamor vs Adoração (a música pede algo, ou simplesmente está na presença?).

### 3.4 Assunto (em aberto, múltipla)
Pergunta: "do que a música fala? qual o conteúdo teológico?"

Candidatos que emergiram das letras do repertório e dos índices do Novo Cântico e do HCC:
- Amor de Deus
- Salvação / Cruz
- Santidade / Majestade
- Espírito Santo
- Fé / Confiança
- Presença de Deus
- Rendição / Entrega
- Cura / Restauração
- Comunhão / Igreja
- Missão / Evangelismo
- Segunda Vinda

Pendentes: Arrependimento / Confissão e Apelo / Convite (aparecem nos hinários, mas estão misturados no repertório atual). Decisões em aberto: Santidade/Majestade como tag própria ou parte de Adoração; Presença de Deus como tag própria.

Meta de tamanho: algo entre 8 e 10 valores, para o processo participativo continuar viável.

## 4. Fora do escopo

- **Momento do culto** (abertura, pós-mensagem, encerramento etc.): decisão de produto de mantê-lo livre, fora do sistema de tags.
- Usuários, perfis e permissões: o Chorder hoje não tem. Preferências do usuário (como filtros recentes) só podem ficar no aparelho.
- Classificação automática por IA como fonte da verdade. A IA pode sugerir, mas a decisão final é das pessoas.

## 5. Processo de preenchimento (contexto para a interface)

A classificação será construída de forma **participativa**, com o grupo do ministério. A IA serve de apoio (sugerir, estruturar), não de decisora. Duas consequências diretas para o design:

1. **O repertório ficará parcialmente classificado por bastante tempo.** São cerca de 600 músicas. A interface precisa funcionar bem com músicas sem tags em alguns grupos, sem escondê-las nem tratá-las como erro.
2. **Os valores dos grupos vão mudar.** Renomear, juntar ou dividir um valor não pode exigir mudança de código nem quebrar filtros salvos.

## 6. O que a interface precisa suportar

Esta seção descreve capacidades, não layout. Quem desenha a tela deve propor a solução de interação.

1. **Explorar por prateleiras.** A entrada da lista mostra os grupos como pontos de navegação (por exemplo, um cartão por valor de Assunto ou Atmosfera, com a contagem de músicas), em vez de só uma lista longa.
2. **Filtrar combinando grupos.** Escolher valores de grupos diferentes ao mesmo tempo. Dentro de um grupo de escolha múltipla, definir se a combinação é "qualquer um" ou "todos", e deixar o comportamento padrão claro.
3. **Feedback de contagem.** Mostrar quantas músicas cada valor tem, e quantas restam depois de aplicar filtros, para evitar becos sem saída.
4. **Convivência com a busca por texto.** A busca por título e letra continua e se combina com os filtros.
5. **Músicas sem classificação.** Devem aparecer na lista geral. Num filtro de grupo, não podem ser confundidas com "não pertence". Vale prever uma forma de achar o que ainda falta classificar, pois isso ajuda o processo participativo.
6. **Grupos vazios ou em implantação.** Um grupo sem nenhuma música classificada não deve ocupar espaço de destaque. Um grupo com poucas deve poder ser marcado como "em construção".
7. **Escolha única vs múltipla** deve ser respeitada na seleção (Tipo é exclusivo) e na exibição.
8. **Uso em contexto.** A lista também é usada para escolher músicas ao montar um culto. A seleção deve funcionar bem nesse fluxo, sem obrigar a sair e voltar.
9. **Mobile primeiro.** O uso real é no celular, e os filtros precisam funcionar em tela pequena.

## 7. Critérios de qualidade da classificação

Para os grupos propostos valerem a pena na prática:
- **Tipo** deve ser objetivo e quase sem discussão.
- **Atmosfera** e **Assunto** são subjetivos. Aceitar que haverá discordância e que uma música pode ter mais de um valor onde a cardinalidade for múltipla.
- Cada valor precisa de uma descrição curta, em linguagem do dia a dia, disponível para quem classifica. O objetivo é reduzir divergência.

## 8. Decisões em aberto

| Decisão | Responsável |
|---|---|
| Nome final do grupo Atmosfera | Tiago e grupo |
| Atmosfera é de escolha única ou múltipla? | Tiago e grupo |
| Lista final de valores de Assunto (8 a 10) | Grupo |
| Santidade/Majestade e Presença de Deus: tags próprias ou parte de Adoração? | Grupo |
| Arrependimento e Apelo entram em Assunto? | Grupo |
| Combinação padrão dentro de grupo múltiplo: "qualquer" ou "todos"? | Tiago |
| Higienização da base (duplicatas, registros de teste, pouco uso) antes da classificação | Tiago |

## 9. Instruções para quem implementa

- Leia o código e o estado atual de Tipo e Ocasião antes de propor qualquer coisa. Estenda o que existe de forma consistente.
- Não assuma um modelo de dados a partir deste documento. Proponha o que se encaixa no código e justifique.
- Trate os grupos Atmosfera e Assunto como provisórios. Construa a interface de forma que a lista de grupos e valores possa mudar sem alteração de interface.
- Respeite o design system e os padrões em andamento do projeto.
- Se encontrar conflito entre este documento e o código ou o produto atual, aponte e pergunte antes de decidir.
