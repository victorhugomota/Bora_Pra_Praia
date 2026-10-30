// Mar desenhado em canvas: céu, serra, sol e ondas em camadas.
// nivel: altura da água (0 a 1 da tela, acima de 1 cobre tudo)
// ceu:   opacidade do céu (0 mostra a areia que está por trás)
// hora:  0 é fim de tarde, 1 é anoitecer
window.Mar = (() => {
  const cv = document.getElementById('mar');
  const ctx = cv.getContext('2d');
  const e = { nivel: -0.3, ceu: 0, hora: 0 };
  let W = 0, H = 0, dpr = 1, t = 0, ultimo = 0, rodando = false, animacao = null;
  let cristas = [], estrelas = [], brilhos = [];

  const mix = (a, b, k) => a + (b - a) * k;
  const cor = (par, k, al = 1) =>
    `rgba(${mix(par[0][0], par[1][0], k) | 0},${mix(par[0][1], par[1][1], k) | 0},${mix(par[0][2], par[1][2], k) | 0},${al})`;
  const suave = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  const CEU = [
    [[70, 156, 196], [13, 20, 54]],
    [[250, 209, 158], [78, 52, 110]],
    [[255, 166, 112], [232, 104, 82]],
  ];
  const SERRA = [
    [[150, 142, 150], [58, 50, 92]],
    [[94, 122, 124], [36, 36, 74]],
    [[46, 92, 88], [20, 24, 54]],
  ];
  const AGUA = [
    [[24, 118, 136], [24, 44, 88]],
    [[28, 142, 150], [30, 58, 104]],
    [[48, 170, 168], [36, 74, 118]],
    [[86, 202, 188], [46, 92, 132]],
  ];
  const CAMADAS = [
    { base: 0, amp: 4, ond: 190, vel: 0.5, espuma: 0.25 },
    { base: 0.2, amp: 7, ond: 270, vel: -0.62, espuma: 0.3 },
    { base: 0.44, amp: 10, ond: 340, vel: 0.78, espuma: 0.4 },
    { base: 0.72, amp: 13, ond: 430, vel: -0.92, espuma: 0.55 },
  ];

  function redimensiona() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    const escala = Math.max(0.8, Math.min(W / 420, 1.8));
    cristas = [
      { sem: 1.3, alt: 104 * escala },
      { sem: 4.1, alt: 76 * escala },
      { sem: 7.7, alt: 46 * escala },
    ].map(c => {
      const pts = [];
      for (let x = 0; x <= W + 10; x += 10) {
        const k = 0.55 + 0.3 * Math.sin(x * 0.0058 + c.sem) + 0.17 * Math.sin(x * 0.016 + c.sem * 2) + 0.07 * Math.sin(x * 0.043 + c.sem * 3);
        pts.push(c.alt * Math.max(0.12, k));
      }
      return pts;
    });
    estrelas = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.62, r: Math.random() * 1.3 + 0.3, f: Math.random() * 6 }));
    brilhos = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: Math.random(), l: Math.random() * 16 + 6, f: Math.random() * 6 }));
    desenha();
  }

  function ceu(topo) {
    const g = ctx.createLinearGradient(0, 0, 0, topo);
    g.addColorStop(0, cor(CEU[0], e.hora));
    g.addColorStop(0.62, cor(CEU[1], e.hora));
    g.addColorStop(1, cor(CEU[2], e.hora));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, topo + 24);

    if (e.hora > 0.45) {
      const a = (e.hora - 0.45) / 0.55;
      ctx.fillStyle = '#fff';
      estrelas.forEach(s => {
        if (s.y > topo - 30) return;
        ctx.globalAlpha = e.ceu * a * (0.45 + 0.55 * Math.abs(Math.sin(t * 0.7 + s.f)));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 7);
        ctx.fill();
      });
      ctx.globalAlpha = e.ceu;
    }

    const sx = W * 0.7, sy = topo - 74 + e.hora * 110, r = 30;
    const halo = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, r * 5);
    halo.addColorStop(0, `rgba(255,232,180,${0.75 - e.hora * 0.4})`);
    halo.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(sx - r * 5, sy - r * 5, r * 10, r * 10);
    ctx.fillStyle = `rgba(255,${238 - e.hora * 70 | 0},${190 - e.hora * 90 | 0},.96)`;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, 7);
    ctx.fill();
  }

  function serra(topo) {
    cristas.forEach((pts, i) => {
      ctx.fillStyle = cor(SERRA[i], e.hora);
      ctx.beginPath();
      ctx.moveTo(0, topo + 20);
      pts.forEach((h, j) => ctx.lineTo(j * 10, topo - h + 6));
      ctx.lineTo(W, topo + 20);
      ctx.fill();
    });
  }

  function veleiro(topo) {
    const x = ((t * 5 + W * 0.2) % (W + 120)) - 60;
    const y = topo + 3 + Math.sin(t * 1.2) * 1.5;
    ctx.fillStyle = e.hora > 0.6 ? '#141c3f' : '#fff4e2';
    ctx.beginPath();
    ctx.moveTo(x, y - 25);
    ctx.lineTo(x, y - 3);
    ctx.lineTo(x + 15, y - 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 21);
    ctx.lineTo(x - 2, y - 3);
    ctx.lineTo(x - 11, y - 3);
    ctx.fill();
    ctx.fillStyle = e.hora > 0.6 ? '#141c3f' : '#7a3b2c';
    ctx.beginPath();
    ctx.moveTo(x - 13, y - 1);
    ctx.lineTo(x + 17, y - 1);
    ctx.lineTo(x + 11, y + 4);
    ctx.lineTo(x - 8, y + 4);
    ctx.fill();
  }

  function gaivotas(topo) {
    ctx.strokeStyle = e.hora > 0.6 ? 'rgba(255,255,255,.35)' : 'rgba(40,60,70,.6)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    [[0.1, 0.5, 7], [0.32, 0.62, 5.5], [0.2, 0.42, 4.5]].forEach(([fx, fy, tam], i) => {
      const x = ((t * (12 + i * 3) + W * fx * 3) % (W + 80)) - 40;
      const y = topo * fy + Math.sin(t * 0.5 + i) * 8;
      const asa = Math.sin(t * 3.4 + i * 2) * tam * 0.5;
      ctx.beginPath();
      ctx.moveTo(x - tam, y - asa);
      ctx.quadraticCurveTo(x - tam * 0.4, y - tam * 0.3, x, y);
      ctx.quadraticCurveTo(x + tam * 0.4, y - tam * 0.3, x + tam, y - asa);
      ctx.stroke();
    });
  }

  function agua(topo) {
    const altura = Math.max(H - topo, 150);
    CAMADAS.forEach((c, i) => {
      const y0 = topo + c.base * altura;
      const f = x =>
        y0 +
        Math.sin((x / c.ond) * 6.283 + t * c.vel) * c.amp +
        Math.sin((x / (c.ond * 0.46)) * 6.283 - t * c.vel * 1.4) * c.amp * 0.38;

      ctx.beginPath();
      ctx.moveTo(0, f(0));
      for (let x = 8; x <= W + 8; x += 8) ctx.lineTo(x, f(x));
      ctx.strokeStyle = `rgba(255,255,255,${c.espuma * (e.ceu < 0.5 ? 1.8 : 1)})`;
      ctx.lineWidth = e.ceu < 0.5 ? 7 : 2.2;
      ctx.stroke();
      ctx.lineTo(W + 8, H + 20);
      ctx.lineTo(0, H + 20);
      ctx.closePath();
      ctx.fillStyle = cor(AGUA[i], e.hora);
      ctx.fill();

      if (i === 0 && e.ceu > 0.5) {
        const sx = W * 0.7;
        for (let k = 0; k < 9; k++) {
          const l = 46 - k * 3 + Math.sin(t * 1.6 + k) * 10;
          ctx.fillStyle = `rgba(255,226,170,${(0.42 - k * 0.035) * (1 - e.hora * 0.5)})`;
          ctx.fillRect(sx - l / 2 + Math.sin(t + k) * 6, topo + 7 + k * 8, l, 2.4);
        }
      }
    });

    ctx.fillStyle = 'rgba(255,255,255,.65)';
    brilhos.forEach(b => {
      ctx.globalAlpha = Math.max(0, Math.sin(t * 1.3 + b.f)) * 0.7;
      ctx.fillRect(b.x, topo + 24 + b.y * (altura - 30), b.l, 1.6);
    });
    ctx.globalAlpha = 1;
  }

  function desenha() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const topo = H * (1 - e.nivel);
    if (e.ceu > 0 && topo > 0) {
      ctx.globalAlpha = e.ceu;
      ceu(topo);
      serra(topo);
      gaivotas(topo);
      veleiro(topo);
      ctx.globalAlpha = 1;
    }
    if (e.nivel > -0.05) agua(topo);
  }

  function quadro(agora) {
    if (!rodando) return;
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    t += dt;
    if (animacao) {
      const a = animacao;
      const k = Math.min((agora - a.ini) / a.dur, 1);
      const m = a.curva(k);
      Object.keys(a.para).forEach(c => { e[c] = mix(a.de[c], a.para[c], m); });
      if (k >= 1) {
        animacao = null;
        a.res();
      }
    }
    desenha();
    if (!animacao && e.ceu === 0 && e.nivel < -0.05) {
      rodando = false;
      return;
    }
    requestAnimationFrame(quadro);
  }

  function liga() {
    if (rodando || document.hidden) return;
    rodando = true;
    ultimo = performance.now();
    requestAnimationFrame(quadro);
  }

  function para(alvo, dur = 1400, curva = suave) {
    return new Promise(res => {
      if (animacao) animacao.res();
      if (dur <= 0) {
        Object.assign(e, alvo);
        animacao = null;
        desenha();
        liga();
        return res();
      }
      animacao = { de: { ...e }, para: alvo, ini: performance.now(), dur, res, curva };
      liga();
    });
  }

  // Uma onda atravessa a tela por cima de tudo. noPico roda com a tela coberta.
  async function onda(noPico, alvoFinal = { nivel: -0.3 }, cobre = 1.3) {
    cv.classList.add('frente');
    await para({ nivel: cobre }, 900, k => k * k * (3 - 2 * k));
    if (noPico) await noPico();
    await para(alvoFinal, 1300);
    cv.classList.remove('frente');
  }

  window.addEventListener('resize', redimensiona);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) liga(); });
  redimensiona();

  return { para, onda, liga };
})();

// Texturas de areia e papel, geradas na hora para não pesar no carregamento.
window.Textura = (() => {
  function tela(tam, base, pinta) {
    const c = document.createElement('canvas');
    c.width = c.height = tam;
    const x = c.getContext('2d');
    x.fillStyle = base;
    x.fillRect(0, 0, tam, tam);
    pinta(x, tam);
    return c;
  }

  const areia = tela(320, '#e6cf9f', (x, tam) => {
    for (let i = 0; i < 9000; i++) {
      const p = Math.random();
      x.fillStyle = p < 0.5 ? 'rgba(150,112,62,.18)' : p < 0.85 ? 'rgba(255,246,222,.3)' : 'rgba(92,66,40,.2)';
      x.fillRect(Math.random() * tam, Math.random() * tam, Math.random() * 1.8 + 0.4, Math.random() * 1.8 + 0.4);
    }
  });

  const papel = tela(320, '#f7eddb', (x, tam) => {
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = Math.random() < 0.5 ? 'rgba(150,120,80,.05)' : 'rgba(255,255,255,.18)';
      x.fillRect(Math.random() * tam, Math.random() * tam, Math.random() * 18 + 1, 1);
    }
  });

  const raiz = document.documentElement.style;
  raiz.setProperty('--img-areia', `url(${areia.toDataURL('image/jpeg', 0.82)})`);
  raiz.setProperty('--img-papel', `url(${papel.toDataURL('image/jpeg', 0.82)})`);

  return { areia };
})();
