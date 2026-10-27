# SPEC: Referências de mídia (vídeo e áudio) e novo cabeçalho da música na visão Cifras da liturgia

> Documento de entrada para o Claude Code. Descreve o problema, o comportamento desejado, as referências visuais e os limites do trabalho. **Não prescreve estrutura de arquivos, nomes de componentes nem modelo de dados.** Leia o código existente primeiro e adapte-se às convenções do projeto.

## 1. Como trabalhar nesta tarefa

**Não implemente nada ainda.** A primeira entrega é uma **análise do estado atual com leitura crítica desta spec** (seção 5), seguida de um **plano de implementação** (seção 7) para aprovação. Só depois da aprovação do Tiago comece a implementar.

Ordem esperada:

1. Investigar o código (seção 5.1) e gravar o resultado em `docs/referencias-midia/ANALISE.md`.
2. Fazer a **leitura crítica** da solução proposta (seção 5.2): o que contradiz o código, o que não foi previsto, o que pode quebrar.
3. Levantar **conflitos e decisões abertas** (seção 6) e **perguntar ao Tiago**. **Não resolva conflito sozinho**, nem "escolhendo o mais razoável". Se tiver recomendação, registre-a ao lado da pergunta.
4. Produzir o plano (seção 7) e parar para aprovação.
5. Implementar em etapas pequenas, cada uma verificável por si só.

Se algo desta spec contradisser o que o código mostra, **o código vence**: aponte a divergência na análise em vez de seguir a spec às cegas.

Esta spec foi escrita **sem acesso ao banco, ao app rodando nem ao Vercel**. Tudo que ela afirma sobre o código vem de leitura estática da branch `feat/referencias-midia-inline` e está marcado como **[a confirmar]**. Confirme cada item antes de se apoiar nele.

### Regra de ouro: o miolo das cifras não muda

A renderização da cifra (parser ChordPro, componente de seção/linha/acorde, estilos, alinhamento acorde-sílaba, layout dos blocos, seletor de tom e transposição existentes) **é reaproveitada como está**. Esta tarefa **não altera** esse código nem o aspecto da cifra. Se for inevitável tocar nele (por exemplo, para dar um identificador a cada bloco, ver seção 9.9), **pare e pergunte**; não faça e não "melhore de passagem".

Também **não se redesenham** os players existentes (barra de áudio e janela flutuante do YouTube). Eles são reaproveitados; só mudam como são acionados.

## 2. Contexto

Chorder é o app de louvor de uma igreja (pt-BR). Os músicos recebem o link da liturgia no WhatsApp, e a equipe ensaia antes do culto. Em cada música da liturgia, na visão **Cifras**, o cabeçalho hoje mistura o título, o tom, o lápis de editar cifra, e agora (branch atual) chips de referência de vídeo e áudio.

Premissas já decididas pelo Tiago, que **não se rediscutem aqui**:

- **Não existem usuários nem perfis.** Qualquer pessoa pode adicionar e remover referências. Restrição por papel fica para quando houver perfis. Preferências ficam só no aparelho.
- **Referências pertencem ao arranjo original**, não à cópia da música na liturgia. Valem para todos os cultos que usam o arranjo ("ao vivo").
- **Vídeo é link do YouTube; áudio é upload.** Um vídeo por música; vários áudios.
- **Sem mídia no Modo Palco.** Nenhum controle de referência aparece nele.
- **Medleys estão fora de escopo.** "Responsável pela música" não é um conceito do app.
- **A visão Roteiro não muda.** Só a visão Cifras.
- O uso das referências é **no ensaio ou em casa**, com o celular na mão e a cifra aberta.
- **Cada música tem de aparecer limpa:** o Tiago não quer informação demais no cabeçalho, e quem nunca adicionou mídia precisa perceber que dá para adicionar.

Leia antes de começar, nesta ordem: `CLAUDE.md`, `AGENTS.md`, `docs/SPEC_MODO_PALCO.md`, `docs/arquitetura-plano-culto.md`, e, **na branch `service-plan-editor`**, `docs/SPEC_LITURGIA_CIFRAS.md` (define a visão Cifras e a convenção de spec que esta segue). Veja também `docs/design-system/` na branch `design-system-tokens`.

## 3. Referência visual

Pasta `prototipo/` ao lado desta spec:

- `prototipo/cabecalho-referencias.html`: protótipo navegável (abra no navegador). Alterna entre **Proposta** e **Atual**, celular e desktop, tema claro e escuro. Os dois players do protótipo são simulados.
- `prototipo/capturas/`: capturas dos estados principais (celular fechado, lista aberta, tom, vazio, adicionar vídeo, áudio tocando, desktop, tom alterado, atual).

**O protótipo ilustra layout e interação. Nada nele é especificação de código, de dados ou de estilo.** Letras, autores, nomes de arquivo e cores de bloco são de exemplo. O que vale é o que o app faz hoje (tokens, componentes `ui/`, `unit-colors.ts`, `KeyButtonSet`). Mapeie as medidas para a escala do projeto.

## 4. Objetivo

Reorganizar o cabeçalho de cada música na visão Cifras para que:

1. o essencial (título, autor, arranjo, tom) fique legível de relance;
2. as referências de vídeo e áudio tenham **um único ponto de entrada**, sempre visível, que serve para ouvir, adicionar e remover;
3. o estado vazio convide a adicionar, sem texto de ajuda;
4. adicionar e remover sejam rápidos, salvem na hora e sejam desfazíveis;
5. o cabeçalho ganhe um **mapa da música** (atalhos para os blocos).

## 5. Fase 0: investigação e leitura crítica (obrigatória, antes do plano)

### 5.1 Investigação do estado atual

Grave em `docs/referencias-midia/ANALISE.md`, com caminhos de arquivo e trechos curtos como evidência. Não altere código nesta fase.

**A. Branch e trabalho em andamento**
- A branch `feat/referencias-midia-inline` tem 2 commits à frente de `origin/main` (`25f933a`, `8ad7f93`). Existe PR aberto? Está pronta para merge, ou esta spec a substitui? Há trabalho relacionado em `feat/service-media-buttons`, `fix/video-sobrescrito-ao-salvar-liturgia` (#64) e nas branches `service-plan-editor`, `design-system-tokens` e `modo-palco`? Liste conflitos prováveis.
- Os worktrees `chorder-*` ao lado do repositório estão com `.git` apontando para caminhos de outra máquina (aparecem como *prunable*). Registre, não conserte.

**B. Referências hoje**
- `components/service/ServiceView/ServiceMediaReferences/index.tsx`: chips de vídeo (edição inline) e de áudio (diálogo com lista, rótulo editável e botão Salvar em lote). Documente o fluxo completo de cada um.
- `ServiceSongUnitView.tsx`, `ServiceArrangementHeader.tsx` e `ServiceSongUnitEditForm.tsx`: onde a mídia aparece no modo visualização e no modo edição de cifra; uso de `preserveMedia`.
- Players: `components/common/AudioPlayer` e `YoutubePlayer` (contextos, widgets, montagem em `app/layout.tsx`). A API atual é `play(audios, title)` e sempre começa na faixa 0. O player de áudio já tem seletor de faixas e avança sozinho para a próxima.
- Dados: `SongArrangement.youtubeUrl`, `ArrangementAudio {url,label,order}`, `hydrateArrangement` e `retrieveService` em `prisma/data.ts`, `PATCH /api/arrangements/[id]`, `/api/upload-audio`.

**C. Cabeçalho e cifra hoje**
- O cabeçalho é `sticky top-0 z-10`, com `ResizeObserver` que publica `--song-header-h` (usado pela barra do editor em `SongUnitListForm`) e um `IntersectionObserver` para a borda "stuck".
- Como o tom é guardado e transposto (`SongConfig`, `transpose` elevado até `ServiceView`), e o que significa "tom do plano" (`arrangement.key` da cópia da liturgia).
- Como os blocos são renderizados e coloridos (`ColumnViewer`, `unit-colors.ts`), se existem ids/âncoras e como as colunas reordenam os blocos (`column-logic.ts`).
- Botão **Palco** (`fixed bottom-4 right-4 z-50`) e o relacionamento com o Modo Palco (as mídias continuam tocando ao entrar nele?).
- Onde ficam as strings em pt-BR (`i18n/messages`, namespace `ServiceView`) e se a convenção é traduzir tudo ou deixar texto fixo (o componente atual tem texto fixo).

**D. Dados de produção**
- Existem cópias de liturgia (`isServiceArrangement`) com `youtubeUrl` ou `audios` **próprios**? Hoje `hydrateArrangement` dá prioridade ao valor da cópia e só cai no original se a cópia estiver vazia. Meça com `prisma migrate diff`/consulta somente leitura. **Não escreva em banco de produção.**

**E. Testes e stories**
- Liste os testes e stories que serão afetados: `ServiceMediaReferences/index.test.tsx`, `ServiceArrangementHeader.test.tsx`/`.stories.tsx`, `ServiceSongUnitView.test.tsx`/`.stories.tsx`, `.storybook/preview.tsx`, mocks.

### 5.2 Leitura crítica

Responda, por escrito, no mesmo `ANALISE.md`:

1. **O que a spec presume e o código desmente?** (comece pelos achados pré-listados em `PRE_ANALISE_ESTADO_ATUAL.md`, confirmando ou refutando cada um.)
2. **O que não foi previsto?** Casos de borda, telas, fluxos e componentes que a spec não menciona e que serão afetados (por exemplo: cifra em edição, tela do Palco, Storybook, tema escuro, tablet, várias músicas tocando na mesma página).
3. **O que pode quebrar?** Para cada risco: o que quebra, em que condição, como detectar (teste ou verificação manual) e como mitigar.
4. **A solução proposta é a melhor para este código?** Aponte alternativas mais simples ou mais seguras que cumpram os mesmos objetivos, sem fugir das premissas da seção 2.
5. **O que a spec pede que contraria o `CLAUDE.md`/`AGENTS.md`?** (por exemplo, UI flutuante global, padrões de Zod, fluxo de PR, migrations.)

## 6. Conflitos e decisões abertas (perguntar ao Tiago)

Cada item traz a recomendação de quem escreveu a spec. **Pergunte; não decida.**

| # | Decisão | Recomendação |
|---|---|---|
| D1 | **Cabeçalho sticky.** Hoje o cabeçalho inteiro é sticky. O novo tem título, autor/arranjo, linha de controles e mapa, o que ocuparia boa parte da tela do celular. | Só a linha do título fica sticky; o restante rola. Atenção ao `--song-header-h` e à borda "stuck". |
| D2 | **Modo edição de cifra.** O que mostrar no cabeçalho enquanto se edita? | Manter na linha do título os botões Salvar e Cancelar como hoje; esconder tom e mapa; manter o botão de referências acessível (a mídia é independente da cifra). |
| D3 | **Renomear áudio.** Hoje o diálogo permite editar o rótulo. A nova lista só mostra o nome do arquivo e tem lixeira. | Decidir se renomear sai da v1 (regressão consciente) ou entra como ação secundária na linha. |
| D4 | **Nome do vídeo na lista.** O banco só guarda `youtubeUrl`; não há título. | Texto fixo "Vídeo do YouTube" (opcional: id curto). Buscar título (oEmbed) fica para depois. |
| D5 | **Mapa da música.** Exige identificar cada bloco e rolar até ele, o que toca o miolo da cifra (regra de ouro) e a ordem visual em colunas. | Perguntar se o mapa entra nesta entrega ou em uma separada. Se entrar, o menor ajuste possível (um atributo de id por bloco) com aprovação. |
| D6 | **Escopo do mapa vs. cores.** Os chips do mapa usam as cores dos blocos. Confirmar se `unit-colors.ts` na `main` é a mesma paleta do design novo (branch `design-system-tokens`). | Usar `unit-colors.ts` como está e deixar o redesenho de cores para a migração de tokens. |
| D7 | **Desfazer remoção.** Veja 9.7: quando excluir o arquivo no Blob (hoje é imediato após Salvar). | Excluir depois da janela de desfazer; aceitar arquivo órfão se a aba fechar nesse intervalo. |
| D8 | **Branch.** Construir sobre `feat/referencias-midia-inline` ou sobre `main`? | Depende do estado do PR (5.1 A). |
| D9 | **Autor e arranjo sem valor.** `song.artist` e `arrangement.name` podem ser nulos. | Omitir o que faltar; não mostrar "Arranjo" vazio. |
| D10 | **Limites do upload.** MP3, M4A e AAC, 10 MB (hoje). | Manter; ver o achado sobre o fluxo de upload em `PRE_ANALISE_ESTADO_ATUAL.md`. |

## 6.1 Exceção prevista: pontos fora do miolo que esta tarefa pode tocar

Sem pedir permissão: componentes de cabeçalho da música na liturgia (`ServiceArrangementHeader`, `ServiceMediaReferences` e seu substituto), `ServiceSongUnitView`, contexto e widgets dos players **para aceitar uma faixa inicial e informar qual arranjo está tocando** (se confirmado como necessário, ver 9.8), rotas de API de referências, textos, testes e stories.

Com pergunta antes: `ColumnViewer`, `unit-colors.ts`, `SongConfig`, `KeyButtonSet`, `schema.prisma`, tokens, layout raiz.

## 7. Fase 1: plano de implementação (entregável antes de codar)

O plano deve conter: decisões de 6 respondidas; etapas pequenas e verificáveis (cada uma com como testar); ordem sugerida (dados e API, depois lista de referências, depois cabeçalho e tom, depois mapa); o que fica fora; riscos e como cada etapa os mitiga; plano de testes (unitário, componente, e2e Playwright se houver base); e quais telas precisam ser conferidas num aparelho real.

## 8. Fora de escopo

- Qualquer mídia, botão ou player no Modo Palco.
- Redesenho dos players (barra de áudio, janela de vídeo), inclusive arrastar a janela, velocidade, repetição de trecho e controle de tom do áudio.
- Medleys, responsável pela música, perfis de usuário e permissões.
- Alterar a visão Roteiro, o miolo das cifras, tokens e tema.
- Buscar título/miniatura do YouTube, transcodificar áudio, mais de um vídeo por música.
- Pré-visualização de áudio antes de enviar.

## 9. Comportamento desejado

### 9.1 Estrutura do cabeçalho (visão Cifras)

**Celular**, de cima para baixo:

1. **Título**: "N. Nome da música". (Em modo edição, Salvar e Cancelar à direita, como hoje.)
2. **Autor · Arranjo**, uma linha, texto secundário. Omite o que não existir.
3. **Linha de controles**, à esquerda: botão **Tom X ⌄** e botão de **referências** (ícones de vídeo e áudio, ou `+ Referências` quando vazio). À direita: ícone de **editar cifra** (lápis).
4. **Aviso "No plano: X · Voltar ao plano"**, só quando o tom em uso difere do tom do plano.
5. **Mapa da música** (ver 9.9), com mais espaço acima do que abaixo.
6. Os blocos da cifra. O espaço entre o mapa e o primeiro bloco é **igual** ao espaço entre blocos.

**Desktop**: título e "Autor · Arranjo" à esquerda. À direita, na altura do título e **nesta ordem**: seletor de tom **já aberto** (⊖ X ⊕, como `KeyButtonSet` hoje), botão de referências, lápis de editar cifra. Aviso de plano, mapa e blocos abaixo, em largura total.

Remover do cabeçalho atual: chips de vídeo e de áudio, o ⋮ do celular com tom e "Editar cifras" (o tom passa a ter botão próprio e o lápis fica à vista), e qualquer rótulo "Alterada neste culto" ou "original em X".

### 9.2 Tom

- **Celular**: o botão "Tom X ⌄" abre um **balão suspenso** com o seletor de tom existente (`KeyButtonSet`). Fecha ao tocar fora ou com Esc.
- **Desktop**: o seletor aparece aberto na linha de controles, sem balão.
- Reutilizar `KeyButtonSet` e o estado de transposição existentes, sem alterar sua lógica.
- **"No plano"**: quando `transpose ≠ 0`, mostrar "No plano: {tom do plano}" e a ação "Voltar ao plano" (volta a `transpose = 0`). O tom do plano é o tom da cópia na liturgia **[a confirmar]**. Considerar a preferência enarmônica (sustenido ou bemol) já usada no app.

### 9.3 Botão de referências

- **Com referências**: botão com dois ícones, **vídeo (vermelho)** e **áudio (verde)**. O ícone de um tipo que não existe aparece **apagado** (baixo contraste, não oculto). Se algo desta música estiver tocando, o botão fica **realçado**.
- **Vazio (nenhuma referência)**: botão **tracejado "+ Referências"**. Serve para sugerir que dá para adicionar, sem texto de ajuda.
- **Durante envio de áudio**: o botão mostra o estado de envio, mesmo com a lista fechada.
- Acessibilidade: `aria-haspopup`, `aria-expanded`, rótulo que descreva o conteúdo ("Referências de áudio e vídeo" / "Adicionar referência").
- Alvo de toque mínimo de 40 px de altura.

### 9.4 Lista de referências

Abre abaixo do botão como **popover** (não `DropdownMenu`, ver riscos). Largura confortável no celular (cabe na tela com margem) e fixa em torno de 340 px no desktop, alinhada à direita do botão.

Ordem, de cima para baixo:

1. **Vídeo** (no máximo um). Com vídeo: linha com ícone de vídeo, "Vídeo do YouTube" (ver D4) e lixeira. Sem vídeo: linha **"+ Adicionar vídeo"**.
2. **Áudios** (zero ou mais), na ordem salva. Cada linha: ícone de áudio, **nome do arquivo**, lixeira.
3. **Envio em andamento** (se houver): linha "Enviando… N%".
4. **"+ Adicionar áudio"** sempre por último.

Vazia: só aparecem "+ Adicionar vídeo" e "+ Adicionar áudio".

Regras:
- **Tocar na linha já abre a reprodução e fecha a lista.** Não há botão "Tocar".
- **A lixeira remove** (ver 9.7). A lista **continua aberta** depois de remover ou adicionar.
- Cada linha tem alvo de toque de pelo menos 44 px; a linha da referência em reprodução fica realçada.
- Teclado: Esc fecha e devolve o foco ao botão; Tab percorre as linhas; Enter ativa.

### 9.5 Adicionar vídeo

- "+ Adicionar vídeo" transforma a linha em um campo de texto **dentro da lista** (placeholder "Link do YouTube") com botão "OK" e botão de cancelar.
- Texto de apoio: "Vale para todos os cultos que usam este arranjo."
- Aceitar os mesmos formatos de link que o player já extrai (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`). **Reaproveitar a mesma função de extração do widget**, para validação e reprodução nunca divergirem.
- Erros (texto no campo, `aria-invalid`): vazio → "Cole o link do vídeo para adicionar."; inválido → "Isso não parece um link do YouTube. Cole o endereço do vídeo."
- Enter confirma; Esc cancela e fecha o campo.
- Só um vídeo por música. Para trocar: remover e adicionar de novo. Não há botão "editar".

### 9.6 Adicionar áudio

- "+ Adicionar áudio" abre o seletor de arquivos **sem fechar a lista**. Formatos e limite como hoje (MP3, M4A, AAC; 10 MB) **[a confirmar]**.
- Durante o envio aparece a linha com progresso (percentual se a API do upload fornecer, senão "Enviando…").
- Ao terminar, a linha vira uma referência normal e aparece o aviso "Áudio adicionado. Vale para todos os cultos."
- Erros: tipo → "Esse arquivo não é um áudio. Envie MP3, M4A ou AAC."; tamanho → "Arquivo muito grande. Limite de 10 MB."; falha → "Erro ao enviar o arquivo. Tente de novo."
- O nome inicial é o do arquivo sem extensão. (Renomear: ver D3.)

### 9.7 Remover e desfazer

- Remover **não pede confirmação**. Salva na hora e mostra um aviso na parte de baixo da tela: **"Referência removida de todos os cultos."** com a ação **"Desfazer"** por **6 segundos**.
- Desfazer devolve a referência **no mesmo lugar** (vídeo, ou áudio na mesma posição).
- Se o áudio removido estava tocando, o player fecha.
- Um novo "remover" durante a janela efetiva a remoção anterior e abre uma nova janela.
- O arquivo no Blob só é excluído **depois da janela** (ver D7).
- O aviso não pode ficar escondido atrás da barra de áudio nem do botão Palco (ver riscos).

### 9.8 Reprodução

- **Uma referência por vez, em toda a página.** Tocar uma fecha a outra (áudio fecha vídeo e vice-versa), como já acontece.
- Os players são os existentes: barra de áudio fixa embaixo e janela flutuante do YouTube. **Não alterar seu visual.**
- Tocar uma linha de áudio inicia **aquela** faixa. Hoje `play()` sempre começa na primeira **[a confirmar]**; será preciso uma faixa inicial.
- O contexto deve informar **qual arranjo** está tocando, para realçar o botão certo quando a página mostra várias músicas.
- Nunca iniciar reprodução sozinho ao abrir a página ou trocar de música.
- Barra de áudio e botão Palco não podem se sobrepor nem cobrir a última linha da cifra (espaço extra no fim da página enquanto a barra existir).
- Esta spec **não** muda o comportamento do player que já avança sozinho para a próxima faixa nem seu seletor de faixas interno. Registrar na análise se isso conflita com "tocar uma linha da lista".

### 9.9 Mapa da música

- Linha horizontal rolável de botões **retangulares de cantos pequenos** (não pílulas), um por bloco, **na ordem dos blocos da cifra**, com a sigla do bloco (Intro, V1, R1, Interl., Saída…).
- Cores iguais às do bloco correspondente (`unit-colors.ts`).
- Tocar rola até o bloco, descontando a altura da parte sticky do cabeçalho, e dá um destaque breve no bloco. Respeitar `prefers-reduced-motion`.
- **Depende de D5.** Se aprovado, a siglas e a regra de abreviação (V1, R2, Interl.) devem seguir o que o app já usa para nomear blocos.
- Espaçamento: **maior** entre o cabeçalho e o mapa (~24 px) do que entre o mapa e o primeiro bloco (igual ao gap entre blocos).
- Se há blocos repetidos ou "TEXT" sem tipo, definir na análise o que o mapa mostra.

### 9.10 Textos (pt-BR)

| Onde | Texto |
|---|---|
| Botão vazio | `+ Referências` |
| Rótulo acessível do botão (com mídia) | `Referências de áudio e vídeo` |
| Rótulo acessível do botão (vazio) | `Adicionar referência` |
| Linha vazia de vídeo | `Adicionar vídeo` |
| Linha de adicionar áudio | `Adicionar áudio` |
| Campo do link | placeholder `Link do YouTube`; apoio `Vale para todos os cultos que usam este arranjo.` |
| Vídeo na lista | `Vídeo do YouTube` |
| Envio | `Enviando… N%` |
| Vídeo adicionado | `Vídeo adicionado. Vale para todos os cultos.` |
| Áudio adicionado | `Áudio adicionado. Vale para todos os cultos.` |
| Remoção | `Referência removida de todos os cultos.` + `Desfazer` |
| Aviso de tom | `No plano: X` + `Voltar ao plano` |
| Botão do tom (celular) | `Tom X` |
| Erros | ver 9.5 e 9.6 |

Seguir a convenção de i18n do projeto (5.1 C). Termo "referência" no singular e plural conforme o contexto; sem anglicismos.

### 9.11 Acessibilidade e qualidade

- Contraste de texto e de ícones nos temas claro e escuro; o ícone "apagado" ainda precisa ser perceptível e não pode ser a única indicação de ausência (o rótulo acessível diz o que existe).
- Foco visível; ordem de foco coerente (título, tom, referências, editar, mapa, blocos).
- Anúncio para leitor de tela da remoção e da adição (região `role="status"`).
- Nenhuma ação depende de gesto de arrastar; alvos de toque ≥ 40 px.
- Sem overflow horizontal na página em 320 px de largura.

### 9.12 Persistência

- Nada novo no aparelho. Estado aberto/fechado da lista e do balão do tom não persiste.

## 10. Dados e API (princípios, sem prescrever modelo)

- **Escopo**: referências são lidas e gravadas no **arranjo original**, nunca na cópia da liturgia. A cópia nunca deve ter mídia própria que sobreponha a do original **[a confirmar, ver 5.1 D]**.
- **Granularidade**: cada ação do usuário (adicionar vídeo, remover vídeo, adicionar áudio, remover áudio) é uma operação própria no servidor. **Não reenviar o array inteiro de áudios** a cada ação, para duas pessoas editando ao mesmo tempo não apagarem o trabalho uma da outra. Hoje `PATCH` com `audios` apaga tudo que não estiver no array enviado.
- **Idempotência e desfazer**: desfazer não pode criar duplicata nem perder a ordem.
- **Validação no servidor**: formato de link, tipo e tamanho de arquivo, e que o vídeo é único.
- **Atualização da tela**: preferir atualização otimista e revalidação pontual, em vez de revalidar toda a liturgia (`/api/services…`), que reconstrói a página e fecha popovers/balões.
- **Blob**: política de exclusão alinhada a D7.
- Seguir o checklist do `CLAUDE.md` para qualquer campo novo (schema Prisma, Zod, mocks, stories, testes, `tsc`). Zod: sem `.optional()`/`.transform()` em schemas usados com `zodResolver`.

## 11. Riscos já identificados (confirmar na Fase 0)

Veja os detalhes e as evidências em `PRE_ANALISE_ESTADO_ATUAL.md`. Resumo:

1. **Upload de áudio por `@vercel/blob/client` com rota que não implementa o protocolo**; o fluxo pode já estar quebrado em produção.
2. **Cópia da liturgia pode ter mídia própria** e mascarar o original (`hydrateArrangement`).
3. **`PATCH` com array de áudios** sobrescreve alterações concorrentes.
4. **`DropdownMenu` do Radix** rouba teclas de campo de texto e **desmonta o `<input type="file">`** ao fechar; usar Popover e manter o input fora do conteúdo.
5. **Cabeçalho sticky** mais alto, `--song-header-h` e a barra do editor.
6. **Barra de áudio** (`z-[9999]`, fixa embaixo) **sobrepõe o botão Palco** (`z-50`) e o aviso de desfazer.
7. **`play()` sempre começa na faixa 0** e o contexto não sabe de qual arranjo é a faixa.
8. **Revalidação global do SWR** após cada ação fecha o que estiver aberto e perde o foco.
9. **Desfazer vs. exclusão do Blob** (arquivo apagado antes de o usuário poder desfazer).
10. **Mapa** exige id por bloco (toca o miolo da cifra) e a ordem visual em colunas diverge da ordem das unidades.
11. **Regressão do renomear** (D3) e da edição do link do vídeo.
12. **Storybook e testes** dependem dos providers de player e do formato de `audios` nos mocks.

## 12. Critérios de aceite

- [ ] Análise (`ANALISE.md`) entregue, com leitura crítica e respostas às decisões da seção 6.
- [ ] Plano aprovado pelo Tiago antes de qualquer código.
- [ ] Celular: título, autor·arranjo, `[Tom X][referências]` à esquerda e lápis à direita na mesma linha, sem quebrar em 360 px.
- [ ] Desktop: tom aberto, referências e lápis à direita do título, nessa ordem.
- [ ] Estado vazio mostra `+ Referências` e a lista oferece "Adicionar vídeo" e "Adicionar áudio".
- [ ] Vídeo: no máximo um; link inválido mostra o erro certo; adicionar e remover refletem na tela **sem recarregar** e valem em outro culto com o mesmo arranjo.
- [ ] Áudio: enviar (progresso e erro), tocar a faixa escolhida, remover e desfazer em até 6 s.
- [ ] Tocar uma linha abre o player existente e fecha a lista; uma referência por vez.
- [ ] Barra de áudio não cobre a última linha da cifra nem o aviso de desfazer; Palco continua acessível.
- [ ] "No plano: X · Voltar ao plano" aparece só quando o tom foi alterado.
- [ ] Modo edição de cifra continua salvando **sem apagar** mídia (regressão do PR #64).
- [ ] Modo Palco sem nenhum controle de referência.
- [ ] Nada do miolo da cifra alterado (diff limpo em `ColumnViewer`, parser e `KeyButtonSet`), salvo o que o Tiago aprovar em D5.
- [ ] `npx tsc --noEmit` e testes passam; testes e stories dos componentes tocados atualizados.
- [ ] Teclado e leitor de tela: lista, tom e mapa operáveis; anúncios de adicionar/remover.

### Roteiro de teste manual (aparelho real, ~10 min)

1. Abrir uma liturgia com 3 músicas no celular (Preview da Vercel, HTTPS). Conferir o cabeçalho em tema claro e escuro.
2. Música sem referência: tocar `+ Referências`, adicionar um vídeo do YouTube. Conferir o botão e a lista.
3. Adicionar dois áudios; tocar o segundo (deve começar nele). Conferir a barra e o botão Palco.
4. Remover um áudio; desfazer dentro de 6 s; remover de novo e esperar. Conferir que o arquivo some e que outra aba (mesma liturgia) reflete.
5. Abrir **outra liturgia** com a mesma música: as referências devem estar lá.
6. Alterar o tom; ver "No plano"; voltar ao plano.
7. Editar a cifra e salvar nos dois escopos: a mídia **não** pode sumir.
8. Entrar no Modo Palco: sem controles de mídia. Voltar.
9. No desktop (1280 px e 768 px): ordem tom, referências, lápis; lista alinhada; mapa.
10. Teclado: Tab, Enter e Esc em todos os controles.

## 13. Entregáveis

1. `docs/referencias-midia/ANALISE.md` (Fase 0 e leitura crítica).
2. Perguntas ao Tiago (seção 6), no chat.
3. Plano de implementação (seção 7), para aprovação.
4. Depois da aprovação: PR em português, em branch própria, com descrição que cite esta spec, o resultado do roteiro de teste manual e o link do Preview.
