# SPEC: Modo Palco (substitui o fullscreen atual)

> Documento de entrada para o Claude Code. Descreve o problema, o comportamento desejado e os limites do trabalho. **Não prescreve implementação, estrutura de arquivos nem modelo de dados.** Leia o código existente primeiro e adapte-se às convenções do projeto.

## 1. Como trabalhar nesta tarefa

**Não implemente nada ainda.** A primeira entrega é um **plano de trabalho** para aprovação. Só depois da aprovação do Tiago comece a implementar.

Ordem esperada:

1. Investigar o código (seção 4).
2. Produzir o plano (seção 5) e parar para aprovação.
3. Implementar em etapas pequenas, cada uma verificável por si só.

Se algo desta spec contradisser o que o código mostra, **o código vence**: aponte a divergência no plano em vez de seguir a spec às cegas.

## 2. Contexto

O Chorder é um site de músicas para o louvor de uma igreja, em português. Há ~600 músicas com cifras em ChordPro. Os músicos usam o site no celular, tablet ou computador, durante ensaio e culto.

Hoje existe uma função **fullscreen** que não atende bem o músico no palco. O problema é de **UX (experiência de uso), não técnico**: ela funciona, mas não entrega uma boa experiência de leitura e uso durante a execução. Além disso, os blocos da cifra usam um layout "desalinhado" (alturas e larguras variadas) que não se presta a leitura contínua com rolagem.

### Restrições do projeto

- **Não existem usuários nem perfis.** Nada de login, backend de preferências ou sincronização entre aparelhos. Qualquer preferência fica no próprio aparelho.
- Há uma **branch em andamento sobre liturgia / planejamento de culto**. Esta tarefa deve sair da **branch principal** e **não deve depender nem conflitar** com ela. Evite tocar em arquivos e conceitos do módulo de liturgia; se for inevitável, registre no plano.
- Prefira estender o que existe a introduzir padrões novos. Dependências novas só com justificativa no plano.
- Mobile-first. Os aparelhos reais variam (Android e iPhone, alguns antigos).

## 3. Objetivo

Substituir o fullscreen atual por um **Modo Palco**: um modo de leitura pensado para tocar ao vivo, que reúne quatro coisas:

1. **Interface limpa**: só a cifra e os controles essenciais.
2. **Coluna única quando a rolagem automática está ligada**: todos os blocos da música empilhados em ordem, em leitura contínua. Com a rolagem desligada, o layout atual dos blocos é mantido (ver seção 8).
3. **Tela sempre ligada**: a tela não apaga durante a música.
4. **Rolagem automática** opcional, com velocidade ajustável.

O músico deve poder ter as mãos no instrumento. Os controles precisam ser grandes e tolerantes a toque impreciso.

## 4. Fase 0: investigação (obrigatória, antes do plano)

Responda cada ponto com evidência (arquivo e trecho) e diga quando algo for incerto. Não presuma.

### 4.1 O fullscreen atual

- Onde é acionado, por qual componente e com qual interface?
- Como funciona tecnicamente (API Fullscreen, classe CSS, rota separada, outra abordagem)?
- **Como é a experiência hoje, do ponto de vista do músico?** Descreva o que ele vê e faz ao entrar, durante o uso e ao sair: o que aparece e o que some, quais controles ficam acessíveis, o que exige toques ou rolagem manual. Não investigue falhas técnicas do fullscreen; o problema já está identificado como de UX. Se o código não bastar para entender a experiência, liste o que precisaria ser visto em aparelho real.
- O que o fullscreen faz de **bom** e deve ser preservado?
- Quais outros pontos do código dependem dele (atalhos, estilos globais, testes)?

### 4.2 Renderização da cifra e blocos "desalinhados"

- Como o ChordPro vira tela hoje (parser, componente, estilos)?
- Como os blocos são dispostos: grid, colunas CSS, flex, larguras fixas? O que produz o aspecto "desalinhado"?
- O que é um "bloco" neste código (estrofe, refrão, ponte, seção)? Existe uma ordem lógica de leitura que possa ser usada numa coluna única?
- Dá para obter a coluna única por **mudança de CSS/layout apenas**, ou exige mudar a estrutura do componente? Estime o impacto.
- Como se comporta o alinhamento de acordes sobre a letra quando a largura é estreita (quebra de linha, acorde descolado da sílaba)? Isso é crítico para a legibilidade em coluna única.

### 4.3 Outras interações relevantes

- Como funciona o seletor de tom e como ele afeta a renderização? O Modo Palco deve respeitá-lo e permitir trocar o tom sem sair do modo.
- Existe armazenamento local em uso (localStorage ou similar) e qual convenção de chaves?
- Há service worker ou PWA hoje? Há manifesto?
- Como está a navegação (rotas, estado de página) e como o Modo Palco entraria nela sem quebrar o botão voltar?
- Existe suíte de testes e como se roda? Há convenções de estilo e de commit?

## 5. Fase 1: o plano de trabalho (entregável antes de codar)

Entregue um documento curto com:

1. **Diagnóstico**: o que encontrou nas seções 4.1 a 4.3, incluindo como é a experiência atual do fullscreen e o que o Modo Palco precisa fazer diferente.
2. **Proposta de substituição**: como o Modo Palco substitui o fullscreen e o que acontece com o código e a interface antigos (remover, manter como fallback, migrar).
3. **Decisão sobre a coluna única**: opção escolhida, alternativas consideradas e impacto. Inclua a questão em aberto da seção 8.
4. **Divisão em etapas**, cada uma entregável e testável sozinha, com ordem sugerida e dependências. Sugestão inicial a ser avaliada por você: (a) layout do Modo Palco em coluna única, (b) tela sempre ligada, (c) rolagem automática.
5. **Riscos e pontos que dependem de aparelho real**, com um roteiro de teste manual curto (ver seção 7).
6. **Perguntas para o Tiago**, se houver. Prefira poucas e objetivas.
7. **Estimativa de esforço por etapa**, com a incerteza explícita.

**Pare aqui e aguarde aprovação.**

## 6. Comportamento desejado (para guiar o plano)

### 6.1 Entrada e saída

- Um botão **"Palco"** na página da música substitui o botão de fullscreen atual.
- Ao entrar: interface escura de alto contraste, fonte maior, blocos em coluna única, menus e elementos secundários escondidos.
- Há uma forma clara e sempre visível de **sair**.
- Ao sair, o músico volta ao layout normal **no mesmo ponto da música** em que estava, na medida do possível.
- O botão voltar do aparelho deve se comportar de forma previsível (sair do Modo Palco antes de sair da página).

### 6.2 Controles mínimos no Modo Palco

- **Tom**: trocar sem sair do modo.
- **Tamanho da fonte**: aumentar e diminuir.
- **Rolagem**: ligar e desligar, e velocidade.
- **Sair**.

Controles grandes, posicionados nas bordas ou numa barra discreta, fáceis de acertar sem precisão. Nada de elementos pequenos ou que exijam arrastar com exatidão.

### 6.3 Tela sempre ligada

- Ativada ao entrar no Modo Palco e liberada ao sair.
- Se o navegador a liberar sozinho (ex.: o músico trocou de app), **reativá-la quando a página voltar a ficar visível**.
- Se o aparelho não suportar, o Modo Palco continua funcionando; o músico é avisado de forma discreta de que a tela pode apagar.
- Verifique o suporte real nos navegadores-alvo antes de decidir entre a API nativa e um fallback, e justifique a escolha no plano.

### 6.4 Rolagem automática

- Opcional: só anda quando o músico liga.
- Velocidade ajustável em passos claros. A velocidade escolhida é **lembrada por música, no próprio aparelho**.
- **Um toque na área da cifra pausa e retoma.** Rolar manualmente com o dedo também pausa, para o músico nunca brigar com a tela.
- Ao chegar ao fim da música, para sozinha.
- O movimento precisa ser **suave**, sem engasgos, inclusive em iOS. Cuidado com o arredondamento de pixels em velocidades baixas.
- Respeitar a preferência de movimento reduzido do sistema de forma sensata (ex.: não ligar sozinha).

### 6.5 Persistência

- Apenas no aparelho (sem perfis). Lembrar por música: velocidade de rolagem e tamanho da fonte. O tom segue a convenção que o projeto já usa.
- Não bloquear nem quebrar nada se o armazenamento estiver indisponível.

## 7. Critérios de aceite

- Em um celular Android e em um iPhone, o Modo Palco entra e sai de forma clara, mostrando só a cifra e os controles essenciais.
- Com a rolagem ligada, a cifra aparece em **coluna única**, na ordem correta dos blocos, com acordes alinhados às sílabas em larguras estreitas. Com a rolagem desligada, o layout atual é preservado.
- Ligar e desligar a rolagem alterna os layouts sem o ponto de leitura pular.
- O fullscreen antigo foi removido por completo, sem referências órfãs.
- A tela **não apaga** durante uma música inteira com o app parado, e volta a ficar ligada ao retornar de outra aba ou app.
- A rolagem automática percorre uma música completa de forma suave, pausa com um toque, e para no fim.
- Trocar o tom dentro do Modo Palco atualiza a cifra sem perder o ponto de leitura nem a rolagem.
- Sair do Modo Palco devolve o layout normal sem regressões.
- Nada do módulo de liturgia foi alterado sem justificativa registrada.
- Testes existentes continuam passando; o que for novo e testável tem teste, seguindo a convenção do projeto.

### Roteiro de teste manual (aparelho real, ~15 min)

1. Abrir uma música longa, entrar no Modo Palco, deixar o aparelho parado por alguns minutos: a tela apaga?
2. Alternar para outro app e voltar: a tela continua ligada?
3. Ligar a rolagem em três velocidades e acompanhar uma música inteira: está suave? Pausa com um toque?
4. Trocar o tom durante a rolagem.
5. Girar o aparelho (retrato e paisagem).
6. Sair e confirmar que a página volta ao normal.

## 8. Decisões já tomadas e pontos em aberto

### Decididas pelo Tiago

- **Layout dos blocos:** o **layout atual (blocos "desalinhados") é mantido** enquanto a rolagem automática está desligada. A **coluna única entra quando a rolagem está ligada**, que é quando a leitura contínua é necessária. Ao desligar a rolagem, volta ao layout atual. Avalie no plano se faz sentido a coluna única também em celulares estreitos mesmo com a rolagem desligada (se o layout atual já não cabe bem), e recomende, mas não implemente isso sem aprovação.
- **Fullscreen antigo:** **remover por completo**, incluindo código, estilos e atalhos que só existam por causa dele. No plano, liste tudo o que será removido e confirme que nada mais depende disso.

### Em aberto (propor no plano)

- Como a troca entre layout atual e coluna única se comporta **no meio da música** (o ponto de leitura não pode "pular" quando a rolagem é ligada ou desligada). Proponha a abordagem e os riscos.

## 9. Fora de escopo

Não faça nada disto nesta tarefa, mesmo que pareça próximo:

- Usuários, perfis, login, sincronização entre aparelhos ou tempo real entre músicos.
- Pedal Bluetooth, diagramas de acorde, capotraste, modo offline/PWA completo.
- Integração com o Holyrics.
- Qualquer mudança no módulo de liturgia / planejamento de culto, no chord picker ou na taxonomia de tags.
- Rolagem que acompanha o áudio.

Se algo fora de escopo se mostrar necessário, registre no plano em vez de fazer.
