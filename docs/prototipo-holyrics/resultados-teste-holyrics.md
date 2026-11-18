# Resultados do teste no Holyrics real

Data: ________
Versão do Holyrics (Ajuda → Sobre): ________
Porta do API Server: ________
Navegador usado no item 6: ________

> Não escrever o token aqui.

## 1. Título repetido
- O Holyrics deixa criar outra música com o mesmo título?
- Avisa?
- Os ids são diferentes?

**Observado:**

## 2. O formulário "Atualizar" duplica ou edita?
- Apareceu uma segunda música com o mesmo título, ou a existente foi atualizada?
- O `holyricsId` continua o mesmo?

**Observado:**

## 3. Repetições: o formulário aceita a ordem?
- Mapa usado (ex.: V1 C V2 C C):
- Resultado: 3 parágrafos com ordem repetida / 5 parágrafos / só blocos distintos / outro

**Observado:**

## 4. Ler a letra de volta (`GetSong`)
- A resposta traz `slides` (texto de cada parágrafo)?
- Traz `order`?
- Resposta completa (sem o token), ou os campos principais:

```json

```

## 5. Permissões do token
Marcar (sim/não):
- [ ] `SearchSong`
- [ ] `GetSong`
- [ ] `GetLyricsPlaylist`
- [ ] `AddLyricsToPlaylist`
- [ ] `RemoveFromLyricsPlaylist`

**Observado:**

## 6. Envio a partir do site de produção (HTTPS)
- Aparece "Conectado"?
- Se não, erro do console (F12):

**Observado:**

## Surpresas e observações gerais
