# Referências de mídia e novo cabeçalho da música (visão Cifras)

Pasta da feature. Destino sugerido no repositório: `docs/referencias-midia/`.

| Arquivo | O que é |
|---|---|
| `SPEC_REFERENCIAS_MIDIA.md` | **Spec principal**, para o Claude Code. Começar por aqui. |
| `PRE_ANALISE_ESTADO_ATUAL.md` | Achados da leitura prévia do código (hipóteses a confirmar). |
| `../prototipo-cifras/` | **Protótipo único** (`cabecalho-e-edicao.html`) e capturas, compartilhados com a spec de edição da cifra. |
| `ANALISE.md` | **Ainda não existe.** O Claude Code cria na Fase 0 (spec, seção 5). |

## Como usar com o Claude Code

Na raiz do repositório `chorder`, peça algo como:

> Leia `docs/referencias-midia/SPEC_REFERENCIAS_MIDIA.md` e `PRE_ANALISE_ESTADO_ATUAL.md`. Faça a Fase 0: analise o estado atual, grave `docs/referencias-midia/ANALISE.md` com a leitura crítica e me pergunte as decisões da seção 6. Não implemente nada até eu aprovar o plano.

## Decisões de design já tomadas

- Só a visão **Cifras** muda. Roteiro e Modo Palco não.
- Referências são do **arranjo original** e valem para todos os cultos. Um vídeo (link do YouTube) e vários áudios (upload).
- Cabeçalho: título com ícone de info (autor e arranjo em tooltip). Celular: `[X ⌄] [referências]` à esquerda e lápis à direita. Desktop: título à esquerda; tom, referências e lápis à direita. Tom abre balão nos dois. Sem aviso "No plano". Mapa com siglas (I, V1, PR, R1, P, IL, S, F).
- Botão de referências abre uma **lista** (vídeo, áudios, adicionar áudio). Tocar na linha já abre o player existente. Lixeira remove, com desfazer.
- Estado vazio: botão tracejado `+ Referências`.
- Mapa da música abaixo do cabeçalho, com botões retangulares coloridos como os blocos.
- Removidos: chips de referência, "Alterada neste culto", "Referências em X".
