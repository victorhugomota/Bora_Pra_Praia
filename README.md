# Bora para a Praia

Convite interativo de uma viagem surpresa, feito de Victor Hugo para Maria Lívia
nos 3 anos de casamento. É um site estático, pensado para abrir no celular.

## Como editar

Datas, carta, legendas e atrações ficam em [`js/config.js`](js/config.js).
Para tocar uma música junto com o mar, coloque o `.mp3` em `assets/` e preencha `musica`.

## Como testar

```bash
python -m http.server 4173
```

Abra `http://localhost:4173`. Para pular direto para uma cena, use `#tempo`,
`#raspadinha`, `#apto`, `#embarque`, `#cartas`, `#mapa`, `#carta` ou `#aceito`.
O site retoma de onde parou; o botão "Rever a surpresa", na última tela, limpa tudo.

## Créditos

Os créditos das fotos das atrações (Wikimedia Commons) e do mapa (OpenStreetMap)
aparecem na última tela do site.
