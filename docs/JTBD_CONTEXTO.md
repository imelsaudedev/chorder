# Chorder: contexto de Jobs To Be Done e plano do "mapa da música"

> **Para o Claude Code:** este documento é contexto de produto, não especificação técnica. Ele explica quem usa o Chorder, o que essas pessoas tentam realizar e onde há atrito, e aplica isso a um problema concreto (o mapa da música no culto). **Não prescreve componentes nem modelo de dados.** Leia o código antes de propor qualquer coisa, devolva um plano e espere aprovação do Tiago. Se o código contradisser algo aqui, o código vence.

Fonte: entrevista de descoberta de JTBD com o Tiago (músico e dirigente do louvor), outubro de 2026, e investigação do repositório `imelsaudedev/chorder` até o merge do PR #60 (23/10/2026). Tudo é relato de uma pessoa e precisa ser validado com outros membros do grupo. Nada foi testado em aparelho real.

## Como ler

- **Relatado**: dito diretamente pelo Tiago.
- **Inferido (a validar)**: deduzido do relato ou do que o sistema já fazia; ninguém confirmou.
- Cada job segue o formato **Quando / Quero / Para**.
- Sem prioridade atribuída. Antes de priorizar, falta medir o custo de cada dor (erro no culto, retrabalho de montagem, atraso no ensaio).

## 1. Contexto de uso

- O Chorder é o acervo de músicas e cifras de um ministério de louvor de igreja e o lugar onde se monta o culto de domingo (liturgia, músicas, arranjos, horários). Interface em pt-BR.
- O trabalho real acontece fora do sistema: Word, WhatsApp, prints de tela, BibleGateway. O sistema tende a **receber o resultado** no fim do fluxo, em vez de ser onde o trabalho acontece.
- Ritmo semanal: o dirigente começa cerca de uma semana antes; a lista é refinada até sexta; a equipe técnica recebe até sábado cedo; **o ensaio é domingo por volta de 8:30** e o culto, cerca de uma hora depois.
- **Tom, repetições, medleys e mapa da música são decididos no ensaio**, e vivem na memória do grupo, em papel e em repasse verbal. Já houve erro no culto por esquecimento.
- Todos do grupo têm autonomia para cadastrar e editar cifras. Hoje não há usuários nem senhas; há intenção de criar contas só para quem é do ministério (com registro de quem mudou e desfazer).
- Visão de futuro: o sistema ser usado por toda a comunidade (sem nenhum relato ainda).
- Durante o culto a tela costuma ficar em estante (celular ou tablet), com as mãos ocupadas pelo instrumento. A bateria não lê cifra; há plano de comprar um suporte de tela para ela.
- A letra é projetada por um software à parte (Holyrics). A equipe técnica copia letras para lá, em grande parte à mão, e prepara passagens bíblicas, slides e movimentos de câmera.

## 2. Atores

Descrições de papéis, não de pessoas. Uma mesma pessoa pode acumular papéis.

- **Músico no palco** (violão, teclado, baixo, voz): recebe o repertório pelo WhatsApp, treina em casa (pouco), chega ao ensaio e toca o culto com a tela numa estante. Tem autonomia para cadastrar e corrigir cifras. Varia entre quem adapta arranjos sozinho e quem espera o material pronto.
- **Baterista**: não usa cifras, mas precisa conhecer a estrutura (blocos, repetições, viradas). Hoje não tem tela e depende da memória. É o papel menos atendido pelo sistema.
- **Dirigente**: escolhe as músicas e monta a liturgia, partindo de quem prega e do texto. Há dois perfis: o técnico, que define também o arranjo, e o que só escolhe as músicas e delega a parte musical. Pode ser o dirigente que também toca, conduzindo e tocando ao mesmo tempo. Trabalha por temas, lembrando músicas de cabeça.
- **Equipe técnica** *(em standby, precisa de pesquisa própria)*: prepara projeção, passagens, slides, câmera e áudio. Ainda não usa o Chorder. Tudo sobre ela é hipótese.
- **Comunidade** *(em standby, sem nenhum relato)*: hipóteses a investigar: ensaiar em casa, conhecer as músicas, acompanhar o culto.

## 3. Jobs

### Atravessa todos os atores
- **Estrutura decidida e visível para todos** *(relatado)*. Quando o grupo decide tom, repetições, medley e mapa da música no ensaio, quero ter essa estrutura registrada e visível, para que músicos, baterista, dirigente e projeção sigam a mesma versão sem depender de memória.

### Músico no palco
**Semana**
- **Ver o repertório da semana** *(relatado)*. Quando recebo o link da liturgia no grupo, quero saber rápido o que vou tocar e quais músicas já conheço, para planejar meu treino.
- **Conhecer a música nova** *(relatado)*. Quando uma música é nova para mim, quero ouvir ou ver como ela deve soar e tirar dúvidas de arranjo, para chegar ao ensaio sabendo o essencial. Hoje depende de o dirigente ter colocado vídeo; senão a pergunta vai ao grupo.
- **Adaptar a cifra disponível** *(relatado)*. Quando o arranjo disponível não é o pretendido, quero conferir e simplificar a cifra, para tocar algo viável e coerente com o que o dirigente quer.

**Ensaio**
- **Acompanhar as decisões** *(relatado)*. Quando o dirigente define tom, acordes, repetições e mapa, quero acompanhar em tempo real, para não perder o fio nem errar no culto.
- **Registrar o combinado** *(relatado)*. Quando o grupo decide algo no ensaio, quero registrar na hora com pouco esforço, para todos tocarem a mesma versão uma hora depois.

**Culto**
- **Tocar sem mexer na tela** *(relatado)*. Quando minhas mãos estão ocupadas com o instrumento, quero que a cifra acompanhe a música, para manter a atenção no instrumento e no grupo. No celular rola-se várias vezes por música; no tablet costuma ficar um pedaço de fora.
- **Ver o trecho atual e o seguinte** *(inferido)*. Quando a tela não comporta a música inteira, quero ver onde estou e o que vem logo depois, para não me perder.

**Cadastro de cifras**
- **Editar sem medo** *(relatado)*. Quando corrijo ou adiciono uma cifra, quero que a mudança fique registrada e possa ser desfeita, para editar sem estragar o que os outros usam.
- **Representar a estrutura sem alongar** *(inferido)*. Quando cadastro uma cifra, quero representar repetições e medleys sem deixá-la enorme. Hoje as repetições costumam ser omitidas para rolar menos.

**Bateria**
- **Ver só a estrutura** *(relatado)*. Quando toco com a tela ao alcance, quero ver blocos, repetições e viradas de relance, para conduzir o grupo sem depender só da memória. Pré-requisito: suporte de tela, já planejado.

### Dirigente
**Concepção (cerca de uma semana antes)**
- **Desenhar a liturgia** *(relatado)*. Quando sei quem vai pregar e o texto, quero montar uma liturgia com linha temática e movimentos coerentes. Hoje acontece em Word.
- **Descobrir músicas por tema** *(relatado)*. Quando tenho um tema em mente, quero ser levado a músicas relacionadas, mesmo sem a palavra exata na letra.
- **Variar o repertório** *(inferido)*. Quando escolho as músicas, quero ver quando cada uma foi usada pela última vez, para não repetir o que a igreja acabou de cantar.
- **Conhecer as lacunas do acervo** *(relatado)*. Quando um tema não tem músicas boas, quero saber isso cedo, para decidir se busco, adapto ou apresento uma música nova.

**Montagem (ao longo da semana)**
- **Manter uma lista ampliada** *(relatado)*: guardar candidatas e reordenar à vontade até a sexta.
- **Montar com outra pessoa** *(relatado)*: dividir a seleção sem trocar versões de arquivo.
- **Inserir o texto bíblico** *(relatado)*: inserir versículos já formatados e diferenciados, sem colar e pintar à mão.
- **Calcular os horários** *(relatado)*: ver horários recalculados quando a sequência muda.
- **Curar cifras para este culto** *(relatado)*: corrigir cifras e ajustar arranjos para os músicos receberem material confiável.
- **Delegar a montagem** *(relatado)*: passar a montagem a alguém, com clareza do que foi decidido.

**Entrega (até sábado cedo)**
- **Entregar à mídia, completo e a tempo** *(relatado)*. Quando fecho o culto, quero que a equipe técnica receba tudo sem print nem reenvio. Hoje: print da tabela no grupo de preparativos.

**Dirigente que também toca**
- **Ver o combinado sem desviar a atenção** *(relatado)*. Quando conduzo e toco ao mesmo tempo, quero ver o que foi combinado sem tirar o foco do grupo, para não errar nem atrapalhar os outros.

### Equipe técnica *(todos inferidos, a validar)*
- Levar a letra ao Holyrics já com ordem, repetições e medleys corretos, sem copiar letra por letra.
- Ser avisada quando uma letra é corrigida ou o mapa muda, para a cópia não ficar desatualizada.
- Reconfigurar a projeção rápido quando um medley é definido no ensaio.
- Receber passagens e slides num formato que o Holyrics aceite.
- Saber os momentos de fala, canto e abertura de microfones para planejar câmera e áudio.

## 4. Tensões entre jobs

- **Fidelidade ao mapa × cifra curta para rolar menos.** Quem cadastra omite repetições para a cifra não ficar grande: a limitação técnica acaba decidindo o conteúdo musical. O Modo Palco com rolagem automática reduz essa tensão.
- **Edição livre e orgânica × histórico e controle.** A autonomia de hoje é uma qualidade do grupo. O job real parece ser editar com segurança, não restringir quem edita.
- **Músico autônomo × músico que espera pronto.** O mesmo material serve a expectativas muito diferentes.
- **Correção local × correção no acervo.** Um ajuste no ensaio pode valer só para aquele domingo ou ser uma correção de cifra legada que serviria a todos. Há muitas cifras legadas, então o ensaio é boa oportunidade de corrigi-las, mas nem todo ajuste merece ir ao original.
- **Ajuste na estrutura × ajuste dentro do conteúdo.** Repetir ou reordenar blocos e mexer em acordes específicos são necessidades distintas e devem ser tratadas separadamente. Para acordes existem duas abordagens (editar o bloco como texto ChordPro com colchetes, ou ajuste pontual de um acorde); o Tiago não sabe qual funciona melhor.

## 5. Aplicação: mapa da música no culto

### Job e problema
**Job:** quando o grupo decide como tocar a música no culto (tom, repetições, voltar ao refrão depois da ponte), eu quero registrar isso na hora e com poucos toques, para que todos toquem a mesma versão uma hora depois, sem depender de memória.

Hoje o editor completo é lento demais para o ritmo do ensaio, e a decisão fica na memória do grupo.

### Resultados desejados (metas são hipóteses, o Tiago ainda não confirmou números)
| Resultado | Como observar | Meta |
|---|---|---|
| Menos tempo para registrar uma decisão no ensaio | Cronometrar de "decidimos" até "está na tela" | < 10 s |
| Menos chance de tocar versão diferente da combinada | Contar divergências no culto | 0 por domingo |
| Menos gente dependendo de lembrar sozinha | Perguntar no fim quem consultou a tela | A maioria consulta |
| Ver a ordem real da música de relance | Tempo para dizer a ordem olhando só o resumo | < 5 s (palpite) |

### O que existe hoje no código (leitura até o PR #60; o código vence)
- Cada música é uma lista de blocos (`SongUnit`) com tipo, conteúdo ChordPro, ordem, observação e `repeatCount` de 1 a 8 (`schemas/song-unit.ts`, `prisma/schema.prisma`).
- Cada culto tem sua própria cópia do arranjo, então mudar o mapa no culto não altera o original (`isServiceArrangement`, `originalArrangementId`).
- A leitura mostra o bloco numerado por tipo ("Refrão 2"), observação e selo de repetição ×N (`ArrangementView/ColumnViewer/index.tsx`).
- No editor, cada bloco pode ser arrastado, duplicado, inserido e ter a repetição trocada (`SortableUnitForm.tsx`, `UnitForm.tsx`). O botão de repetição alterna de 1 a 4.
- Salvar abre um diálogo "só neste culto" ou "neste culto e no original" (`ServiceArrangementHeader.tsx`).
- O tom de cada música fica no plano do culto. No Modo Palco, a troca de tom parece valer só durante a sessão (`StageMode/index.tsx`).
- Já mergeados: Modo Palco (PR #56) e editor de liturgia (PR #57).

### Onde está o atrito
Registrar uma decisão simples ("repetir o refrão no final") exige seis passos e troca de tela: abrir a música, entrar no editor, rolar até o bloco, repetir ou duplicar e arrastar, salvar e escolher o escopo, voltar e conferir.

- **Dois modos:** ler e editar são telas diferentes; o ensaio não espera a troca.
- **Repetir não cobre "voltar":** ×N repete o mesmo bloco em sequência; voltar ao refrão depois da ponte exige duplicar o bloco.
- **Duplicar copia o conteúdo:** corrigir um acorde numa cópia não corrige as outras.
- **O mapa não aparece como mapa:** o baterista só enxerga uma cifra longa.
- **Salvar tem passo extra:** o diálogo de escopo aparece a cada salvamento.

### Opções de solução
| Opção | O que muda para o músico | Risco ou custo | Esforço (estimativa relativa) |
|---|---|---|---|
| A. Ações rápidas na leitura | Tocar no bloco abre repetir, duplicar, mover; salva sozinho na cópia do culto | Não resolve "voltar" sem duplicar; salvar sozinho exige desfazer | Baixo a médio |
| B. Mapa como camada própria | Linha curta no topo (V1, R, V2, R, P, R ×2) editável com fichas; blocos reaproveitados em vez de copiados | Muda o modelo; mexe em cifra, Palco e Holyrics | Alto |
| C. Nota de ensaio em texto livre | Campo por música no culto, visível na leitura e no Palco | Texto não reordena a cifra; mapa real e escrito podem divergir | Baixo |

### Recomendação e primeira fatia
**Comece pela A.** Com a rolagem automática do Modo Palco, cifra longa deixou de ser problema, então a cifra pode refletir a ordem real tocada no ensaio. A prioridade é duplicar e ordenar blocos com facilidade e ver o resumo do mapa na própria música. A B fica para depois de ver quais decisões o grupo mais toma.

- **Ações no bloco:** na leitura da música dentro do culto, tocar no cabeçalho de um bloco abre um painel com repetir (1 a 4), duplicar logo abaixo, mover para cima ou para baixo. Salva sozinho na cópia do culto, mostra "Salvo neste culto" e oferece desfazer a última ação. O original nunca muda por esse caminho.
- **Resumo do mapa:** faixa curta no topo da música, derivada dos blocos existentes, com a ordem tocada (ex.: Verso 1, Verso 2, Refrão, Refrão (repete), Ponte, Refrão ×2). Tocar numa ficha leva ao bloco. Como o código numera por tipo, blocos duplicados apareceriam como refrões diferentes; o resumo precisa marcar bloco igual a um anterior como "repete". Ideia a confirmar na investigação: comparar só a letra, ignorando acordes, para que uma variação de acorde na última repetição não vire um refrão novo.
- **Por que não a B agora:** muda o modelo e toca em cifra, Modo Palco e Holyrics. Vale o custo se o grupo mais decide voltar ao refrão ou repetir só o final; para saber, registrar as decisões de 2 ou 3 ensaios.

### Decisões de design já tomadas no protótipo
- Existe um protótipo HTML (feito no estilo visual do Chorder, com cor por tipo de bloco) com fichas tocáveis no mapa e ações por bloco: duplicar, mover, repetir, remover.
- Para o conflito "ajuste do ensaio × cifra original legada", o protótipo explorou três variantes: **"revisar depois"**, **"marcar na hora"** e **"perguntar a cada ajuste"**. Nenhuma foi escolhida ainda.
- Em desenhos posteriores do Tiago: "repetir" é implementado como bloco literalmente duplicado, não como contador de repetição; abreviações de blocos finalizadas (I, V1, PR, R1, P, IL, S, F, B, T, com "Saída" renomeado para "Final" só no texto).

### Etapas
1. **Linha de base:** cronometrar em celular e tablet quanto leva hoje para registrar uma decisão pelo editor; anotar as decisões de 2 ou 3 ensaios.
2. **Investigação no código:** como a leitura do culto vira editor, como salvar só na cópia do culto, e se o tom escolhido no ensaio pode ser gravado no plano a partir da leitura. Entregar plano para aprovação do Tiago.
3. **Ações rápidas no bloco + resumo do mapa**, com salvamento automático na cópia do culto.
4. **Desfazer e confirmação** ("Salvo neste culto", desfazer a última ação).
5. **Teste no ensaio:** um domingo real, um dirigente e dois músicos, comparando com a linha de base. Decidir entre manter só a A ou avançar para a B.

As etapas 1 e 2 não mudam o sistema.

### Como validar no ensaio
Tempo por decisão; divergências no culto; consulta à tela (quem consultou vs. confiou na memória); leitura do mapa (tempo para dizer a ordem olhando só o resumo); erros de toque (mudanças desfeitas por toque no bloco errado).

### Perguntas abertas (para o Tiago, antes da investigação)
1. Quem registra no ensaio: o dirigente, quem estiver com a tela livre ou qualquer músico?
2. Quais decisões são mais comuns: repetir, reordenar, voltar ao refrão ou pular um bloco?
3. O combinado vale só para este culto ou às vezes deveria ir para o original?
4. O tom escolhido no ensaio deve ficar gravado no culto?

### Riscos
- Salvar sozinho pode gravar um toque errado (mitigação: desfazer).
- Duas pessoas mexendo na mesma cópia; não foi verificado se a proteção de edição concorrente do culto cobre a cópia do arranjo.
- A cópia de letras usada pelo Holyrics pode ficar fora de sincronia; não foi verificado como a integração trata repetições.
- Nada foi testado em aparelho real; a leitura do código pode ter perdido detalhes.

### Fora de escopo
Usuários, login e histórico completo de versões; atualização em tempo real entre músicos; vista própria para a bateria (viradas e andamento); mudanças na taxonomia de tags e no seletor de músicas.

## 6. Perguntas em aberto da pesquisa
- Quais informações do culto só chegam no ensaio ou na hora (falas, oferta, quem sobe ao palco, abertura de microfones)?
- Equipe técnica: com uma única visão do culto inteiro, o que não poderia faltar? Só ler a liturgia ou também registrar o que preparam?
- Comunidade: o que alguém fora do ministério faria com o sistema? Quem entrevistar primeiro?
- Bateria: o que realmente precisa ver, e quem toca bateria confirma o job?
- Os jobs de músicos e dirigentes se repetem em outros membros do grupo, além do Tiago?
- Quais dores custam mais: erro no culto, retrabalho de montagem ou atraso no ensaio?
