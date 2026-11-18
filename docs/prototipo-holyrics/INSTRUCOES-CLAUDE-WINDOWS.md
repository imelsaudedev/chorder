# Instruções para o Claude no computador com Holyrics (Windows)

Você está no computador da mídia, onde o Holyrics roda. O objetivo desta sessão é **executar o roteiro de teste e registrar os resultados**, não implementar a integração. A implementação vem depois, com base no que for anotado aqui.

## Contexto

O Chorder (fork `chorder-alt`) vai ganhar uma integração com o Holyrics: vincular músicas do culto ao catálogo do Holyrics e enviar a letra para a playlist de letras. O protótipo clicável está em `painel-holyrics.html` (abrir no navegador; nada ali fala com o Holyrics).

Decisões já tomadas (não reabrir):
- um vínculo por música (opção B), usando o arranjo do culto;
- aviso de "letra diferente", sem sobrescrever sozinho;
- sem o Plano Holyrics: criar e atualizar a letra pelo formulário do Holyrics.

## Passo a passo

1. Baixar a branch (o repositório já deve estar clonado; se não, clonar `imelsaudedev/chorder`):
   ```
   git fetch origin
   git switch docs/prototipo-holyrics
   ```
2. Ler `docs/prototipo-holyrics/roteiro-teste-holyrics.md` e `painel-holyrics.html`.
3. Copiar `resultados-teste-holyrics.md` (modelo nesta pasta) e preencher conforme o roteiro. Pode ser editado no próprio arquivo.
4. Commitar o arquivo preenchido na mesma branch, em pt-BR, e dar `git push`. **Não abrir PR para `main` e não mexer em outros arquivos do repositório.**

## Quem faz o quê

| Item do roteiro | Quem executa |
|---|---|
| 1, 2, 3 (criar/editar músicas na interface do Holyrics) | **A pessoa usuária**, na tela do Holyrics. O Claude orienta, pergunta o que apareceu e anota. |
| 4 (`GetSong`) | O Claude pode rodar, pedindo antes o token e o id da música de teste. |
| 5 (permissões do token) | A pessoa usuária confere na tela do Holyrics e informa. |
| 6 (HTTPS → localhost) | A pessoa usuária abre o site de produção e olha o console (F12). O Claude anota. |

## Cuidados

- Usar só a música de teste "ZZ Teste Chorder". Não alterar nem apagar músicas reais do catálogo.
- **Não gravar o token no repositório** (nem em `resultados-teste-holyrics.md`, nem em commit, nem em mensagem). Se precisar citá-lo, escrever "(token omitido)".
- No PowerShell, `curl` é um alias de `Invoke-WebRequest`. Para o item 4 usar `curl.exe` ou `Invoke-RestMethod`:
  ```powershell
  $body = '{"id":"ID_DA_MUSICA"}'
  Invoke-RestMethod -Method Post -Uri "http://localhost:8091/api/GetSong?token=SEU_TOKEN" -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
  ```
- Se a porta não for 8091, conferir em Holyrics → API Server.
- Registrar o que **aconteceu de fato**, inclusive respostas inesperadas ou erros, com o texto exato. Se um item não puder ser testado, escrever isso em vez de supor.

## Ao terminar

Resumir para a pessoa usuária, em poucas linhas, as respostas dos 6 itens e qualquer surpresa. O Claude do Mac usa esse arquivo para planejar a implementação.
