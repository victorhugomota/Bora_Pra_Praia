(() => {
  const C = window.CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const vibra = p => { if (navigator.vibrate) navigator.vibrate(p); };
  const data = ([a, m, d]) => new Date(a, m - 1, d);
  const hoje = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const diasEntre = (a, b) => Math.round((b - a) / 864e5);

  const CHAVE = 'bora-pra-praia';
  const memoria = (() => {
    try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
  })();
  const salva = () => { try { localStorage.setItem(CHAVE, JSON.stringify(memoria)); } catch {} };

  const ORDEM = ['areia', 'envelope', 'tempo', 'raspadinha', 'apto', 'embarque', 'cartas', 'mapa', 'carta', 'aceito'];
  const CENARIO = {
    areia: { nivel: -0.3, ceu: 0, hora: 0 },
    envelope: { nivel: -0.3, ceu: 0, hora: 0 },
    tempo: { nivel: 0.24, ceu: 1, hora: 0 },
    raspadinha: { nivel: 0.13, ceu: 1, hora: 0.06 },
    apto: { nivel: 0.13, ceu: 1, hora: 0.1 },
    embarque: { nivel: 0.13, ceu: 1, hora: 0.14 },
    cartas: { nivel: 0.1, ceu: 1, hora: 0.2 },
    mapa: { nivel: 0.1, ceu: 1, hora: 0.26 },
    carta: { nivel: 0.12, ceu: 1, hora: 0.4 },
    aceito: { nivel: 0.3, ceu: 1, hora: 1 },
  };
  const iniciar = {};
  let bloqueado = false;

  function mostra(id) {
    $$('.cena').forEach(c => c.classList.toggle('ativa', c.dataset.cena === id));
    const cena = $(`[data-cena="${id}"]`);
    cena.scrollTop = 0;
    const i = ORDEM.indexOf(id);
    $('#progresso').classList.toggle('visivel', i >= 2);
    $('#som').classList.toggle('visivel', i >= 2);
    $('#progresso .trilho').style.setProperty('--p', `${(100 * (i - 2)) / (ORDEM.length - 3)}%`);
    document.body.classList.toggle('noite', id === 'aceito');
    $('meta[name="theme-color"]').content = i >= 2 ? '#469cc4' : '#e6cf9f';
    if (i >= 2) { memoria.cena = id; salva(); }
    if (iniciar[id]) iniciar[id]();
  }

  async function irPara(id) {
    if (bloqueado) return;
    Mar.para(CENARIO[id], 1800);
    mostra(id);
  }

  $$('[data-vai]').forEach(b => b.addEventListener('click', () => { Som.toque(); irPara(b.dataset.vai); }));

  /* 1. Trava: dia, mês e ano, um de cada vez */
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const ETAPAS = [
    { slot: 'dia', texto: 'Escolha a concha do dia', simbolo: 's-concha', colunas: 7, classe: '',
      opcoes: Array.from({ length: 31 }, (_, i) => ({ valor: i + 1, rotulo: String(i + 1) })),
      certo: C.casamento[2], escrita: v => String(v).padStart(2, '0'),
      erros: ['A maré apagou esse dia. Tenta outro?', 'Hmm, não foi nesse. Pensa bem, amor.', 'Esse dia a areia não reconhece.'] },
    { slot: 'mes', texto: 'Agora a estrela do mês', simbolo: 's-estrela', colunas: 4, classe: 'grade-mes',
      opcoes: MESES.map((m, i) => ({ valor: i + 1, rotulo: m })),
      certo: C.casamento[1], escrita: v => String(v).padStart(2, '0'),
      erros: ['Esse mês não. Lembra do clima daquele dia?', 'A estrela afundou. Foi em outro mês.', 'Quase! Tenta mais uma.'] },
    { slot: 'ano', texto: 'E a garrafa do ano', simbolo: 's-garrafa', colunas: 5, classe: 'grade-ano',
      opcoes: [2021, 2022, 2023, 2024, 2025].map(a => ({ valor: a, rotulo: String(a) })),
      certo: C.casamento[0], escrita: v => String(v),
      erros: ['Essa garrafa está vazia. Outro ano!', 'Foi em outro ano, amor.', 'Quase lá!'] },
  ];
  let etapa = 0, tentativas = 0;

  function montaEtapa() {
    const e = ETAPAS[etapa];
    const grade = $('#grade');
    tentativas = 0;
    $('#pergunta').textContent = e.texto;
    $('#recado').textContent = '';
    grade.className = `grade ${e.classe}`;
    grade.style.setProperty('--col', e.colunas);
    grade.innerHTML = '';
    $$('.data-areia span').forEach(s => s.classList.toggle('foco', s.dataset.slot === e.slot));
    e.opcoes.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ficha';
      b.style.setProperty('--i', i);
      b.style.setProperty('--r', `${((i * 37) % 17) - 8}deg`);
      b.innerHTML = `<svg><use href="#${e.simbolo}"/></svg><span>${o.rotulo}</span>`;
      b.setAttribute('aria-label', o.rotulo);
      b.addEventListener('click', () => escolhe(b, o, e));
      grade.append(b);
    });
  }

  async function escolhe(b, o, e) {
    if (bloqueado) return;
    Som.acorda();
    if (o.valor !== e.certo) {
      Som.erro();
      vibra(60);
      b.classList.add('errada');
      b.disabled = true;
      $('#recado').textContent = e.erros[tentativas % e.erros.length];
      tentativas++;
      if (tentativas >= 3) {
        const certa = e.opcoes.findIndex(x => x.valor === e.certo);
        $$('.ficha')[certa].classList.add('dica');
        $('#recado').textContent = 'A certa está brilhando para você.';
      }
      return;
    }
    bloqueado = true;
    Som.acerto();
    vibra(20);
    const slot = $(`[data-slot="${e.slot}"]`);
    const de = b.getBoundingClientRect(), para = slot.getBoundingClientRect();
    b.style.animation = 'none';
    b.style.opacity = 1;
    void b.offsetWidth;
    b.classList.add('voa');
    b.style.zIndex = 5;
    b.style.transform = `translate(${para.left - de.left}px, ${para.top - de.top}px) scale(.6)`;
    await espera(460);
    slot.textContent = e.escrita(o.valor);
    slot.classList.remove('foco');
    slot.classList.add('feito');
    await espera(420);
    bloqueado = false;
    etapa++;
    if (etapa < ETAPAS.length) montaEtapa();
    else destrava();
  }

  async function destrava() {
    bloqueado = true;
    $('#grade').innerHTML = '';
    $('#pergunta').textContent = '';
    $('#recado').textContent = 'É você mesma.';
    await espera(1100);
    await Mar.onda(() => {
      mostra('envelope');
      return espera(120);
    });
    bloqueado = false;
  }

  /* 2. Envelope */
  const envelope = $('#envelope');
  $('#lacre').addEventListener('click', async () => {
    if (envelope.classList.contains('aberto')) return;
    Som.acorda();
    Som.estalo();
    vibra(30);
    envelope.classList.add('aberto');
    $('#env-dica').style.visibility = 'hidden';
    $('#env-titulo').style.visibility = 'hidden';
    await espera(620);
    envelope.classList.add('dobrada');
    Som.acerto();
    await espera(1150);
    envelope.classList.add('saiu');
    const conv = $('#convite');
    const r = conv.getBoundingClientRect();
    conv.style.transform = `translateY(${Math.round(window.innerHeight / 2 - (r.top + r.height / 2))}px)`;
  });

  const FUGAS = ['Tem certeza?', 'Não foi dessa vez', 'Esse botão foi à praia', 'Ele não volta mais'];
  let fugas = 0;
  function foge(ev) {
    ev.preventDefault();
    const b = $('#fujao');
    if (fugas >= FUGAS.length) {
      b.style.opacity = 0;
      b.style.pointerEvents = 'none';
      return;
    }
    if (!b.classList.contains('solto')) {
      const r = b.getBoundingClientRect();
      b.style.left = `${r.left}px`;
      b.style.top = `${r.top}px`;
      b.classList.add('solto');
      document.body.append(b);
      void b.offsetWidth;
    }
    b.textContent = FUGAS[fugas++];
    Som.toque();
    vibra(12);
    const w = b.offsetWidth, h = b.offsetHeight;
    b.style.left = `${12 + Math.random() * (window.innerWidth - w - 24)}px`;
    b.style.top = `${60 + Math.random() * (window.innerHeight - h - 130)}px`;
  }
  $('#fujao').addEventListener('pointerdown', foge);
  $('#fujao').addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && envelope.classList.contains('saiu')) foge(e); });
  $('#fujao').addEventListener('click', e => e.preventDefault());

  $('#bora').addEventListener('click', async () => {
    if (bloqueado) return;
    bloqueado = true;
    Som.acorda();
    Som.festa();
    Som.mar(C.musica);
    vibra([20, 40, 20]);
    const r = $('#bora').getBoundingClientRect();
    Festa.solta(r.left + r.width / 2, r.top, 40);
    const fujao = $('#fujao');
    if (fujao) fujao.style.opacity = 0;
    await Mar.onda(() => {
      $('#fundo').style.opacity = 0;
      Mar.para({ ceu: 1 }, 0);
      fujao?.remove();
      mostra('tempo');
      return espera(240);
    }, CENARIO.tempo);
    bloqueado = false;
  });

  /* 3. Tempo */
  iniciar.tempo = async () => {
    const alvo = diasEntre(data(C.casamento), hoje());
    const el = $('#dias');
    await espera(2400);
    const ini = performance.now();
    const passo = agora => {
      const k = Math.min((agora - ini) / 1700, 1);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))).toLocaleString('pt-BR');
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  /* 4. Raspadinha */
  iniciar.raspadinha = () => {
    const caixa = $('#rasp');
    if (caixa.dataset.pronta) return;
    caixa.dataset.pronta = 1;
    const cv = $('#rasp-areia');
    const r = cv.getBoundingClientRect();
    cv.width = r.width;
    cv.height = r.height;
    const x = cv.getContext('2d');
    x.fillStyle = x.createPattern(Textura.areia, 'repeat');
    x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = 'rgba(118, 86, 42, .72)';
    x.textAlign = 'center';
    x.font = '700 34px Caveat, cursive';
    x.fillText('Raspe a areia', cv.width / 2, cv.height / 2 - 6);
    x.font = '500 22px Caveat, cursive';
    x.fillText('com o dedo', cv.width / 2, cv.height / 2 + 24);
    x.globalCompositeOperation = 'destination-out';
    x.lineCap = x.lineJoin = 'round';
    x.lineWidth = Math.max(44, cv.width / 7);

    let ultimo = null, passos = 0, fim = false;
    const ponto = e => {
      const b = cv.getBoundingClientRect();
      return { px: e.clientX, py: e.clientY, x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const raspa = p => {
      x.beginPath();
      x.moveTo((ultimo || p).x, (ultimo || p).y);
      x.lineTo(p.x, p.y);
      x.stroke();
      ultimo = p;
      if (Math.random() < 0.7) Festa.grao(p.px, p.py);
      if (++passos % 10 === 0) mede();
    };
    const mede = () => {
      const dados = x.getImageData(0, 0, cv.width, cv.height).data;
      let limpo = 0, total = 0;
      for (let i = 3; i < dados.length; i += 4 * 37) { total++; if (dados[i] < 40) limpo++; }
      if (limpo / total > 0.48) revela();
    };
    const revela = () => {
      if (fim) return;
      fim = true;
      caixa.classList.add('revelada');
      Som.festa();
      vibra([30, 50, 30, 50, 60]);
      const b = caixa.getBoundingClientRect();
      Festa.solta(b.left + b.width / 2, b.top + b.height / 2, 90, ['concha', 'coracao', 'papel'], 14);
      setTimeout(() => Festa.chuva(3), 300);
      $('#rasp-titulo').textContent = 'Ubatuba!';
      $('#rasp-apoio').textContent = 'Mar, serra e nós dois.';
      $('#rasp-seguir').hidden = false;
      $('#rasp-pular').hidden = true;
    };
    cv.addEventListener('pointerdown', e => {
      Som.acorda();
      cv.setPointerCapture(e.pointerId);
      ultimo = null;
      raspa(ponto(e));
    });
    cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') { if (cv.hasPointerCapture(e.pointerId)) raspa(ponto(e)); } });
    cv.addEventListener('pointerup', () => { ultimo = null; });
    setTimeout(() => { if (!fim) $('#rasp-pular').hidden = false; }, 14000);
    $('#rasp-pular').addEventListener('click', revela);
  };

  /* 5. Apartamento */
  $('#selos').innerHTML = C.destaques.map(d => `<li>${d}</li>`).join('');
  $('#polaroids').innerHTML = C.fotos.map((f, i) =>
    `<figure class="polaroid" style="--r:${[-1.6, 1.2, -0.8, 1.7][i % 4]}deg"><img src="${f.src}" alt="${f.legenda}" loading="lazy"><figcaption>${f.legenda}</figcaption></figure>`).join('');
  $('#link-airbnb').href = C.airbnb;

  /* 6. Embarque */
  const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const formata = d => `${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
  $('#b-ela').textContent = C.ela;
  $('#b-ele').textContent = C.ele;
  $('#b-ida').textContent = formata(data(C.ida));
  $('#b-volta').textContent = formata(data(C.volta));
  $('#barras').innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="width:${((i * 7 + 3) % 4) + 1}px"></i>`).join('');

  const faltam = diasEntre(hoje(), data(C.ida));
  $('#contagem').innerHTML = faltam > 1 ? `Faltam <b>${faltam} dias</b> para o embarque`
    : faltam === 1 ? 'O embarque é <b>amanhã</b>'
    : faltam === 0 ? 'O embarque é <b>hoje</b>' : 'Boa viagem, meu amor';

  const compacta = ([a, m, d]) => `${a}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
  const fimAgenda = data(C.volta);
  fimAgenda.setDate(fimAgenda.getDate() + 1);
  $('#link-agenda').href = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Bora para a Praia: 3 anos de casados',
    dates: `${compacta(C.ida)}/${compacta([fimAgenda.getFullYear(), fimAgenda.getMonth() + 1, fimAgenda.getDate()])}`,
    location: 'Ubatuba, SP',
  });

  /* 7. Cartas */
  memoria.escolhas = memoria.escolhas || [];
  let carta = 0;
  const baralho = $('#baralho');
  baralho.innerHTML = C.atracoes.map(a => `
    <article class="atr" data-id="${a.id}">
      <div class="foto">
        <img data-src="assets/atracoes/${a.id}.jpg" alt="${a.nome}" draggable="false">
        <span class="tipo">${a.tipo}</span>
        <span class="carimbo c-bora">BORA!</span>
        <span class="carimbo c-prox">PRÓXIMA</span>
      </div>
      <div class="info">
        <h3>${a.nome}</h3>
        <p>${a.texto}</p>
        <p class="dist">${a.dist}</p>
      </div>
    </article>`).join('');
  const cartas = $$('.atr');

  function arruma() {
    cartas.forEach((c, i) => {
      const pos = i - carta;
      c.dataset.pos = pos < 0 ? 'x' : pos;
      if (pos >= 0 && pos < 4) {
        const img = $('img', c);
        if (!img.src) img.src = img.dataset.src;
      }
    });
    $('#cartas-conta').textContent = `${Math.min(carta + 1, cartas.length)} de ${cartas.length}`;
  }

  function decide(bora) {
    const c = cartas[carta];
    if (!c || c.dataset.saindo) return;
    c.dataset.saindo = 1;
    const id = c.dataset.id;
    memoria.escolhas = memoria.escolhas.filter(x => x !== id);
    if (bora) {
      memoria.escolhas.push(id);
      const r = c.getBoundingClientRect();
      Festa.solta(r.right - 30, r.top + 90, 14, ['coracao'], 7);
      Som.acerto();
      vibra(15);
    } else {
      Som.toque();
    }
    salva();
    $('.c-bora', c).style.opacity = bora ? 1 : 0;
    $('.c-prox', c).style.opacity = bora ? 0 : 1;
    c.style.transition = 'transform .42s ease-in, opacity .42s';
    c.style.transform = `translate(${bora ? 130 : -130}vw, 40px) rotate(${bora ? 24 : -24}deg)`;
    c.style.opacity = 0;
    carta++;
    arruma();
    c.style.display = 'flex';
    c.style.zIndex = 5;
    if (carta >= cartas.length) setTimeout(() => irPara('mapa'), 620);
  }

  let toque = null;
  baralho.addEventListener('pointerdown', e => {
    const c = cartas[carta];
    if (!c || !c.contains(e.target)) return;
    toque = { x: e.clientX, y: e.clientY, c, id: e.pointerId };
    baralho.setPointerCapture(e.pointerId);
    c.style.transition = 'none';
  });
  baralho.addEventListener('pointermove', e => {
    if (!toque || e.pointerId !== toque.id) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
    toque.dx = dx;
    toque.c.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx / 16}deg)`;
    $('.c-bora', toque.c).style.opacity = Math.max(0, dx / 90);
    $('.c-prox', toque.c).style.opacity = Math.max(0, -dx / 90);
  });
  const solta = e => {
    if (!toque || e.pointerId !== toque.id) return;
    const { dx = 0, c } = toque;
    toque = null;
    if (Math.abs(dx) > 84) return decide(dx > 0);
    c.style.transition = '';
    c.style.transform = '';
    $('.c-bora', c).style.opacity = 0;
    $('.c-prox', c).style.opacity = 0;
  };
  baralho.addEventListener('pointerup', solta);
  baralho.addEventListener('pointercancel', solta);
  $('#b-sim').addEventListener('click', () => decide(true));
  $('#b-nao').addEventListener('click', () => decide(false));
  iniciar.cartas = () => {
    carta = 0;
    memoria.escolhas = [];
    cartas.forEach(c => {
      delete c.dataset.saindo;
      c.removeAttribute('style');
      $$('.carimbo', c).forEach(s => s.removeAttribute('style'));
    });
    arruma();
  };

  /* 8. Mapa */
  const M = window.MAPA;
  const svg = $('#mapa');
  const VISTAS = { toda: { cx: 640, cy: 668, alt: 1190 }, perto: { cx: 646, cy: 1096, alt: 420 } };
  const ROTULO_ESQ = new Set(['domingas', 'lazaro']);
  let caixaVista = { x: 0, y: 0, w: 1000, h: 1000 }, voo = null, pinos = {};

  const atracao = id => C.atracoes.find(a => a.id === id);

  function aplicaVista(v) {
    caixaVista = v;
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const k = v.w / (svg.clientWidth || 340);
    Object.values(pinos).forEach(p => p.el.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${k})`));
    $$('.m-rota', svg).forEach(r => r.setAttribute('stroke-width', 2.2 * k));
    $$('.m-costa, .m-ilha', svg).forEach(r => r.setAttribute('stroke-width', 1.1 * k));
    $$('.m-raso', svg).forEach(r => r.setAttribute('stroke-width', 11 * k));
    $$('.m-rotulo', svg).forEach(r => r.setAttribute('font-size', 13 * k));
  }

  function alvoDe({ cx, cy, alt }) {
    const prop = (svg.clientWidth || 340) / (svg.clientHeight || 340);
    const w = alt * prop;
    return { x: cx - w / 2, y: cy - alt / 2, w, h: alt };
  }

  function voa(alvo, dur = 1100) {
    const de = { ...caixaVista }, ini = performance.now();
    cancelAnimationFrame(voo);
    const passo = agora => {
      const k = Math.min((agora - ini) / dur, 1);
      const m = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      aplicaVista({ x: de.x + (alvo.x - de.x) * m, y: de.y + (alvo.y - de.y) * m, w: de.w + (alvo.w - de.w) * m, h: de.h + (alvo.h - de.h) * m });
      if (k < 1) voo = requestAnimationFrame(passo);
    };
    voo = requestAnimationFrame(passo);
  }

  function marcaVista(nome) {
    $$('.mapa-vistas button').forEach(b => b.classList.toggle('ativa', b.dataset.vista === nome));
    const perto = nome === 'perto';
    Object.entries(pinos).forEach(([id, p]) => {
      const sul = atracao(id)?.zona === 'perto' || id === 'casa';
      p.el.classList.toggle('rotulado', nome ? (perto ? sul : !sul || id === 'casa') : false);
    });
  }

  function focaLugar(id) {
    const [x, y] = M.pontos[id];
    $$('.m-pin').forEach(p => p.classList.toggle('ativo', p.dataset.id === id));
    $$('.roteiro button').forEach(b => b.classList.toggle('ativo', b.dataset.id === id));
    marcaVista(null);
    voa(alvoDe({ cx: x, cy: y - 12, alt: 230 }), 900);
  }

  function pino(id, nome, casa) {
    const [x, y] = M.pontos[id === 'casa' ? 'saco' : id];
    const esq = ROTULO_ESQ.has(id);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `m-pin${casa ? ' casa' : ''}`);
    g.dataset.id = id;
    g.innerHTML = `<g class="m-pin-int">
      <path class="m-pin-corpo" d="M0 0C-3-7-12-13-12-22a12 12 0 1 1 24 0C12-13 3-7 0 0z"/>
      ${casa ? '<path d="M0-16c-7-5-6-10-3-10 1.500 0 3 1 3 2.500 0-1.500 1.500-2.500 3-2.500 3 0 4 5-3 10z" fill="#fffaf0"/>' : '<circle cy="-22" r="4.500"/>'}
    </g><text x="${esq ? -15 : 15}" y="-16" text-anchor="${esq ? 'end' : 'start'}">${nome}</text>`;
    $('#m-pinos', svg).append(g);
    pinos[id] = { el: g, x, y };
    if (!casa) g.addEventListener('click', () => focaLugar(id));
    return g;
  }

  function montaRoteiro(ids) {
    const norte = ids.filter(i => atracao(i).zona === 'norte');
    const resto = ids.filter(i => atracao(i).zona !== 'norte');
    const dias = { 'Terça, 10': norte.slice(0, 3), 'Quarta, 11': norte.slice(3), 'Quinta, 12 de manhã': [] };
    const livres = [!norte.length && 'Terça, 10', norte.length <= 3 && 'Quarta, 11', 'Quinta, 12 de manhã'].filter(Boolean);
    resto.forEach(i => {
      const dia = livres.find(d => dias[d].length < (d.startsWith('Quinta') ? 2 : 3)) || livres[livres.length - 1];
      dias[dia].push(i);
    });
    const blocos = [`<h3>Segunda, 9</h3><p>Chegada e fim de tarde na piscina do apê</p>`];
    Object.entries(dias).forEach(([dia, lista]) => {
      if (!lista.length) return;
      blocos.push(`<h3>${dia}</h3>${lista.map(i => `<button type="button" data-id="${i}">${atracao(i).nome}</button>`).join('')}`);
    });
    if (!ids.length) blocos.push('<p>Três dias de piscina, sauna e nós dois. Ótima escolha.</p>');
    const r = $('#roteiro');
    r.innerHTML = blocos.join('');
    $$('button', r).forEach(b => b.addEventListener('click', () => focaLugar(b.dataset.id)));
  }

  iniciar.mapa = async () => {
    const ids = memoria.escolhas.filter(atracao);
    pinos = {};
    svg.innerHTML = `
      <rect class="m-agua" x="-3000" y="-3000" width="8000" height="8000"/>
      <path class="m-raso" d="${M.costa}"/>
      ${M.ilhas.map(d => `<path class="m-raso" d="${d}"/>`).join('')}
      <path class="m-terra" d="${M.continente}"/>
      ${M.ilhas.map(d => `<path class="m-ilha" d="${d}"/>`).join('')}
      <path class="m-costa" d="${M.costa}"/>
      <text class="m-rotulo" x="860" y="640">Oceano Atlântico</text>
      <text class="m-rotulo terra" x="290" y="700">Serra do Mar</text>
      <text class="m-rotulo" x="800" y="1010">Ilha Anchieta</text>
      <g id="m-rotas"></g><g id="m-pinos"></g>`;
    pino('casa', 'Apto 306', true);
    ids.forEach(id => pino(id, atracao(id).nome));
    aplicaVista(alvoDe(VISTAS.toda));
    marcaVista('toda');
    montaRoteiro(ids);
    $('#mapa-resumo').textContent = ids.length
      ? `${ids.length} ${ids.length === 1 ? 'lugar escolhido' : 'lugares escolhidos'} por você. Toque em um deles.`
      : 'Você escolheu não sair da piscina. Justo.';

    await espera(500);
    pinos.casa.el.classList.add('caiu');
    await espera(400);
    const [ox, oy] = M.pontos.saco;
    for (const id of ids) {
      const { x, y, el } = pinos[id];
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const mx = (ox + x) / 2 + (y - oy) * -0.16 + 12, my = (oy + y) / 2 + (x - ox) * 0.16;
      r.setAttribute('d', `M${ox} ${oy}Q${mx} ${my} ${x} ${y}`);
      r.setAttribute('class', 'm-rota');
      r.setAttribute('pathLength', 1);
      $('#m-rotas', svg).append(r);
      r.setAttribute('stroke-width', 2.2 * (caixaVista.w / (svg.clientWidth || 340)));
      void r.getBoundingClientRect();
      r.classList.add('feita');
      await espera(260);
      el.classList.add('caiu');
      Som.toque();
    }
  };

  $$('.mapa-vistas button').forEach(b => b.addEventListener('click', () => {
    $$('.m-pin, .roteiro button').forEach(p => p.classList.remove('ativo'));
    voa(alvoDe(VISTAS[b.dataset.vista]));
    marcaVista(b.dataset.vista);
  }));

  /* 9. Carta */
  let cartaEscrita = false;
  iniciar.carta = async () => {
    if (cartaEscrita) return;
    cartaEscrita = true;
    const folha = $('#folha');
    const palavras = t => t.split(' ').map(p => `<span class="palavra">${p}</span>`).join(' ');
    folha.innerHTML = C.carta.map(p => `<p>${palavras(p)}</p>`).join('') + `<p class="assina">${C.assinatura.split('\n').map(palavras).join('\n')}</p>`;
    let pular = false;
    folha.addEventListener('click', () => { pular = true; });
    await espera(900);
    for (const p of $$('.palavra', folha)) {
      p.classList.add('vista');
      if (!pular) await espera(/[.,:]$/.test(p.textContent) ? 260 : 75);
    }
    const seguir = $('#carta-seguir');
    seguir.hidden = false;
    seguir.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  /* 10. Aceito */
  function telaFinal() {
    $('#pedido').hidden = true;
    $('#fim').hidden = false;
    const nomes = memoria.escolhas.filter(atracao).map(i => atracao(i).nome);
    $('#escolhas').innerHTML = nomes.map(n => `<li>${n}</li>`).join('');
  }

  $('#aceito').addEventListener('click', async () => {
    Som.acorda();
    Som.mar(C.musica);
    Som.festa();
    vibra([40, 60, 40, 60, 120]);
    Festa.chuva(9);
    memoria.aceitou = true;
    salva();
    await espera(500);
    telaFinal();
  });

  $('#contar').addEventListener('click', async () => {
    const nomes = memoria.escolhas.filter(atracao).map(i => atracao(i).nome);
    const texto = `Aceito! ♥ Ubatuba, lá vamos nós.${nomes.length ? `\nMinhas escolhas: ${nomes.join(', ')}.` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ text: texto }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  });

  $('#rever').addEventListener('click', () => {
    try { localStorage.removeItem(CHAVE); } catch {}
    window.location.hash = '';
    window.location.reload();
  });

  $('#creditos').innerHTML = C.atracoes.map(a =>
    `<li>${a.nome}: <a href="${a.credito.url}" target="_blank" rel="noopener">${a.credito.autor}</a>, ${a.credito.licenca}</li>`).join('') +
    `<li>Fotos do apartamento: anúncio no <a href="${C.airbnb}" target="_blank" rel="noopener">Airbnb</a></li>
     <li>Mapa: dados do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a></li>`;

  /* Som */
  $('#som').addEventListener('click', () => {
    Som.acorda();
    Som.mar(C.musica);
    $('#som').classList.toggle('mudo', Som.alterna());
  });

  /* Abertura: #cena abre direto em uma cena (útil para testar); senão retoma de onde parou */
  const pedida = location.hash.slice(1);
  const inicio = ORDEM.includes(pedida) ? pedida : ORDEM.includes(memoria.cena) ? memoria.cena : 'areia';
  if (ORDEM.indexOf(inicio) >= 2) {
    $('#fundo').style.opacity = 0;
    Mar.para(CENARIO[inicio], 0);
  }
  if (inicio === 'areia') montaEtapa();
  mostra(inicio);
  if (inicio === 'aceito' && memoria.aceitou) telaFinal();
  document.addEventListener('pointerdown', () => { Som.acorda(); if (ORDEM.indexOf(inicio) >= 2) Som.mar(C.musica); }, { once: true });
})();
