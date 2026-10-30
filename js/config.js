// Tudo o que é texto ou dado da surpresa fica aqui. Para ajustar a carta, as
// datas ou as atrações, basta editar este arquivo.
window.CONFIG = {
  ela: 'Maria Lívia',
  ele: 'Victor Hugo',

  // [ano, mês, dia]
  casamento: [2023, 11, 4],
  ida: [2026, 11, 9],
  volta: [2026, 11, 12],

  // Caminho de um .mp3 para tocar junto com o mar (ex.: 'assets/musica.mp3').
  musica: '',

  airbnb: 'https://www.airbnb.com.br/rooms/1304597302307094139',

  fotos: [
    { src: 'assets/apto/piscina-baia.jpg', legenda: 'Piscina de borda infinita, no topo do prédio' },
    { src: 'assets/apto/sala-vista.jpg', legenda: 'Nossa sala, com a serra na janela' },
    { src: 'assets/apto/varanda.jpg', legenda: 'Café da manhã olhando a baía' },
    { src: 'assets/apto/quarto.jpg', legenda: 'Sem despertador' },
    { src: 'assets/apto/piscina-serra.jpg', legenda: 'A serra de um lado, o mar do outro' },
    { src: 'assets/apto/sofa.jpg', legenda: 'Para o fim de tarde' },
    { src: 'assets/apto/espreguicadeiras.jpg', legenda: 'Seu lugar já está guardado' },
    { src: 'assets/apto/sauna.jpg', legenda: 'Sauna seca ou a vapor' },
    { src: 'assets/apto/praia-verde.jpg', legenda: 'E a praia logo ali' },
  ],

  destaques: ['Apto 306', 'Vista para a baía', 'Borda infinita', 'Sauna', 'Nota 4,92'],

  carta: [
    'Maria Lívia,',
    'Em 4 de novembro de 2023 eu prometi muita coisa na frente de todo mundo. Três anos depois, a promessa mais fácil de cumprir continua sendo estar ao seu lado.',
    'Nem todo dia foi de sol, e talvez por isso eu goste tanto do que a gente construiu. Você transforma uma terça-feira qualquer em um dia que eu quero lembrar.',
    'Por isso escolhi um lugar onde a gente possa ter vários dias assim: sem relógio, sem pressa, com o mar na janela e você comigo.',
    'São três noites, uma para cada ano. Os passeios você já escolheu. Eu só quero ir junto.',
    'Obrigado por ter dito sim. Se eu pudesse, perguntaria de novo.',
  ],
  assinatura: 'Com todo o meu amor,\nVictor Hugo',

  // zona: 'perto' (ao lado do apê), 'centro' ou 'norte'. Define o roteiro no mapa.
  atracoes: [
    {
      id: 'anchieta', nome: 'Ilha Anchieta', tipo: 'Passeio de barco', zona: 'perto',
      texto: 'A escuna sai do Saco da Ribeira, nosso bairro. Tem praia, ruínas do antigo presídio e água boa para snorkel.',
      dist: 'Cerca de 40 min de escuna',
    },
    {
      id: 'sete-fontes', nome: 'Praia das Sete Fontes', tipo: 'Trilha', zona: 'perto',
      texto: 'Uma trilha de cerca de 4 km que começa no Saco da Ribeira e passa pelas praias da Ribeira e do Flamengo.',
      dist: 'Sai a pé do nosso bairro',
    },
    {
      id: 'lazaro', nome: 'Praia do Lázaro', tipo: 'Praia', zona: 'perto',
      texto: 'A vizinha mais próxima. Dá para ir sem pressa, passar o dia e voltar para a piscina no fim da tarde.',
      dist: 'Cerca de 2 min de carro',
    },
    {
      id: 'domingas', nome: 'Domingas Dias', tipo: 'Praia', zona: 'perto',
      texto: 'Pequena e charmosa, colada no Lázaro. Boa para um dia de não fazer absolutamente nada.',
      dist: 'Cerca de 5 min de carro',
    },
    {
      id: 'sununga', nome: 'Praia da Sununga', tipo: 'Vista', zona: 'perto',
      texto: 'O mar é agitado, então é praia de sentar na areia, olhar as ondas e tirar a melhor foto da viagem.',
      dist: 'Cerca de 5 min de carro',
    },
    {
      id: 'gruta', nome: 'Gruta que Chora', tipo: 'Lenda', zona: 'perto',
      texto: 'No canto da Sununga, com a boca aberta para o mar. Reza a lenda que ela chora quando alguém fala alto por perto.',
      dist: 'Cerca de 5 min de carro',
    },
    {
      id: 'tamar', nome: 'Projeto Tamar', tipo: 'Natureza', zona: 'centro',
      texto: 'Tartarugas marinhas de pertinho, no bairro do Itaguá. Um programa perfeito para um dia nublado.',
      dist: 'Cerca de 20 min de carro',
    },
    {
      id: 'itamambuca', nome: 'Itamambuca', tipo: 'Surf', zona: 'norte',
      texto: 'Conhecida pelo surf, com um rio que encontra o mar. Boa para ver as ondas e almoçar pé na areia.',
      dist: 'Cerca de 40 min de carro',
    },
    {
      id: 'felix', nome: 'Praia do Félix', tipo: 'Praia', zona: 'norte',
      texto: 'Cercada de mata, no norte de Ubatuba. Vale acordar cedo: o nascer do sol aqui é um espetáculo.',
      dist: 'Cerca de 40 min de carro',
    },
    {
      id: 'prumirim', nome: 'Praia do Prumirim', tipo: 'Sossego', zona: 'norte',
      texto: 'Mais isolada, com uma ilha bem na frente. Para quem quer sumir do mundo por algumas horas.',
      dist: 'Cerca de 45 min de carro',
    },
    {
      id: 'cachoeira', nome: 'Cachoeira do Prumirim', tipo: 'Cachoeira', zona: 'norte',
      texto: 'Banho de água doce no meio da mata, para tirar o sal depois da praia.',
      dist: 'Cerca de 45 min de carro',
    },
    {
      id: 'picinguaba', nome: 'Vila de Picinguaba', tipo: 'Vila caiçara', zona: 'norte',
      texto: 'Vila de pescadores no extremo norte de Ubatuba. É o passeio mais longo e o mais diferente de todos.',
      dist: 'Cerca de 1h15 de carro',
    },
  ],
};
