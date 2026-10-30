// Música de fundo e efeitos curtos.
window.Som = (() => {
  let ac = null, mestre = null, faixa = null, mudo = false, tocando = false;

  function acorda() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ac) {
      ac = new AC();
      mestre = ac.createGain();
      mestre.gain.value = mudo ? 0 : 1;
      mestre.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
  }

  function ruido(seg) {
    const b = ac.createBuffer(1, ac.sampleRate * seg, ac.sampleRate);
    const d = b.getChannelData(0);
    let u = 0;
    for (let i = 0; i < d.length; i++) {
      u = (u + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = u * 3.4;
    }
    return b;
  }

  function prepara(src) {
    if (!src) return;
    faixa = new Audio(src);
    faixa.loop = true;
    faixa.preload = 'auto';
    faixa.volume = 0.7;
  }

  function musica() {
    if (!faixa || tocando) return;
    tocando = true;
    faixa.muted = mudo;
    faixa.play().catch(() => { tocando = false; });
  }

  document.addEventListener('visibilitychange', () => {
    if (!faixa || !tocando) return;
    if (document.hidden) faixa.pause();
    else faixa.play().catch(() => {});
  });

  function nota(freq, atraso, dur, vol = 0.14, tipo = 'sine') {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    const ini = ac.currentTime + atraso;
    o.type = tipo;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, ini);
    g.gain.linearRampToValueAtTime(vol, ini + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, ini + dur);
    o.connect(g).connect(mestre);
    o.start(ini);
    o.stop(ini + dur + 0.02);
  }

  function estalo() {
    if (!ac) return;
    const f = ac.createBufferSource();
    f.buffer = ruido(0.12);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = ac.createGain();
    g.gain.value = 0.7;
    f.connect(hp).connect(g).connect(mestre);
    f.start();
  }

  const toque = () => nota(880, 0, 0.16, 0.08, 'triangle');
  const erro = () => { nota(233, 0, 0.26, 0.11, 'triangle'); nota(196, 0.1, 0.32, 0.1, 'triangle'); };
  const acerto = () => [659, 880].forEach((f, i) => nota(f, i * 0.09, 0.32, 0.12));
  const festa = () => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.1, 0.65, 0.12));

  function alterna() {
    mudo = !mudo;
    if (mestre) mestre.gain.setTargetAtTime(mudo ? 0 : 1, ac.currentTime, 0.1);
    if (faixa) faixa.muted = mudo;
    return mudo;
  }

  return { acorda, prepara, musica, toque, erro, acerto, festa, estalo, alterna };
})();

window.Festa = (() => {
  const cv = document.getElementById('festa');
  const ctx = cv.getContext('2d');
  const CORES = ['#e8694a', '#f5a950', '#f7eddb', '#4cc6bb', '#b23a2a', '#ffd9c7'];
  let parts = [], rodando = false, ultimo = 0;

  function ajusta() {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  }
  window.addEventListener('resize', ajusta);
  ajusta();

  function coracao(s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.5, -s * 0.4, -s * 1.1, 0, -s * 0.4);
    ctx.bezierCurveTo(s * 0.4, -s * 1.1, s * 1.1, -s * 0.5, 0, s * 0.3);
    ctx.fill();
  }

  function concha(s) {
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(-s * 1.4, s * 0.2, -s, -s, 0, -s);
    ctx.bezierCurveTo(s, -s, s * 1.4, s * 0.2, 0, s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,60,40,.35)';
    ctx.lineWidth = 1;
    [-0.5, 0, 0.5].forEach(k => {
      ctx.beginPath();
      ctx.moveTo(0, s);
      ctx.lineTo(k * s, -s * 0.8);
      ctx.stroke();
    });
  }

  function quadro(agora) {
    const k = Math.min((agora - ultimo) / 16.7, 6) || 1;
    ultimo = agora;
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.vida > 0 && p.y < cv.height + 30);
    parts.forEach(p => {
      p.vx *= p.ar;
      p.vy = p.vy * p.ar + p.g * k;
      p.x += p.vx * k;
      p.y += p.vy * k;
      p.rot += p.vr * k;
      p.vida -= k;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.vida / 30);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.cor;
      if (p.tipo === 'coracao') coracao(p.s);
      else if (p.tipo === 'concha') concha(p.s);
      else if (p.tipo === 'grao') ctx.fillRect(0, 0, p.s, p.s);
      else ctx.fillRect(-p.s, -p.s * 0.5, p.s * 2, p.s);
      ctx.restore();
    });
    if (parts.length) requestAnimationFrame(quadro);
    else {
      rodando = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
  }

  function solta(x, y, n, tipos = ['coracao', 'concha', 'papel'], forca = 11) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283;
      const v = Math.random() * forca + 2;
      parts.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 4,
        g: 0.2, ar: 0.985,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.22,
        s: Math.random() * 6 + 5,
        cor: CORES[(Math.random() * CORES.length) | 0],
        tipo: tipos[(Math.random() * tipos.length) | 0],
        vida: 150 + Math.random() * 90,
      });
    }
    liga();
  }

  function liga() {
    if (rodando) return;
    rodando = true;
    ultimo = performance.now();
    requestAnimationFrame(quadro);
  }

  function grao(x, y) {
    parts.push({ x, y, vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 3, g: 0.3, ar: 0.98, rot: 0, vr: 0, s: Math.random() * 2.4 + 1, cor: '#c9a968', tipo: 'grao', vida: 40 });
    liga();
  }

  function chuva(vezes = 5) {
    for (let i = 0; i < vezes; i++) {
      setTimeout(() => solta(Math.random() * cv.width, Math.random() * cv.height * 0.55 + 40, 34), i * 320);
    }
  }

  return { solta, grao, chuva };
})();
