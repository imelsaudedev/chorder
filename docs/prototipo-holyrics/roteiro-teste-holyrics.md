# Roteiro de teste no Holyrics real

Para rodar no computador da mídia, com o Holyrics aberto e o API Server ligado. Anote o que aconteceu em cada item. Nenhum passo apaga músicas do catálogo; use uma música de teste (por exemplo "ZZ Teste Chorder").

Versão do Holyrics: ________ (menu Ajuda → Sobre)

## 1. Título repetido
1. No Holyrics, crie a música "ZZ Teste Chorder" com 2 parágrafos.
2. Tente criar outra com o mesmo título.
3. **Anotar:** o Holyrics deixa? Avisa? Cria duas músicas com ids diferentes?

## 2. O formulário "Atualizar" duplica ou edita?
1. No Chorder, abra um culto com uma música já vinculada e use o botão de ressincronizar (ícone de seta) no painel do Holyrics.
2. Salve o formulário que abrir no Holyrics.
3. Busque o título no Holyrics.
4. **Anotar:** apareceu uma segunda música com o mesmo título, ou a existente foi atualizada? O `holyricsId` continua o mesmo?

## 3. Repetições: o formulário aceita a ordem?
1. Escolha uma música do Chorder cujo mapa repete o refrão (por exemplo V1 C V2 C C).
2. Ressincronize e abra a música no Holyrics.
3. **Anotar:** o Holyrics tem 3 parágrafos (V1, C, V2) com a ordem repetida, ou 5 parágrafos, ou só os blocos distintos sem repetição?

## 4. Ler a letra de volta (para detectar "letra diferente")
Num terminal do computador da mídia, ou pelo navegador com o token:

```
curl -s -X POST "http://localhost:8091/api/GetSong?token=SEU_TOKEN" -H "Content-Type: application/json" -d '{"id":"ID_DA_MUSICA"}'
```
**Anotar:** a resposta traz `slides` (texto de cada parágrafo) e `order`? Se vier só título e artista, o token precisa de mais permissão ou a versão não devolve a letra.

## 5. Permissões do token
No Holyrics, API Server → permissões do token. **Anotar** se estão marcadas: `SearchSong`, `GetSong`, `GetLyricsPlaylist`, `AddLyricsToPlaylist`, `RemoveFromLyricsPlaylist`.

## 6. Envio a partir do site de produção (HTTPS)
1. No computador da mídia, abra o Chorder de produção (https) no mesmo navegador.
2. Clique no ícone do Holyrics e confira a mensagem de conexão.
3. **Anotar:** aparece "Conectado"? Se não, qual é o erro (aba Console do navegador, F12)? Isso confirma se `localhost` funciona do HTTPS sem ajuste.
