// ============================================================
// Code4SQL — Controlador principal
// Carga lecciones, genera pasos y maneja la navegación.
// ============================================================
import { LECCIONES } from './lessons/lessons.js';
import { generarPasos } from './engine/sql-engine.js';
import { renderReel } from './components/reel.js';
import { setContexto, pintarFrame } from './components/index.js';
import { dibujarConectores } from './components/connectors.js';

const elReels = document.getElementById('reels');
const elBarra = document.getElementById('progreso');
const elDots = document.getElementById('dots');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const btnPlay = document.getElementById('play');

let lecIdx = 0;
let pasoIdx = 0;
let pasos = [];
let autoplay = null;
let ctx = null;

// ---------- Carga de lección ----------
function cargarLeccion(i) {
  detener();
  lecIdx = (i + LECCIONES.length) % LECCIONES.length;
  const leccion = LECCIONES[lecIdx];
  pasos = generarPasos(leccion);
  pasoIdx = 0;

  const { reel, svg } = renderReel(elReels, leccion);
  ctx = { reel, svg, leccion };
  setContexto(ctx);

  construirBarra();
  actualizarDots();
  pintar();
}

// ---------- Navegación de pasos ----------
function pintar() {
  pintarFrame(pasos[pasoIdx]);
  marcarBarra();
}
function siguiente() {
  if (pasoIdx < pasos.length - 1) { pasoIdx++; pintar(); }
  else detener();
}
function anterior() {
  if (pasoIdx > 0) { pasoIdx--; pintar(); }
}

// ---------- Barra de progreso (stories) ----------
function construirBarra() {
  elBarra.innerHTML = '';
  pasos.forEach(() => {
    const seg = document.createElement('span');
    seg.className = 'progreso__seg';
    elBarra.appendChild(seg);
  });
}
function marcarBarra() {
  [...elBarra.children].forEach((seg, k) => seg.classList.toggle('is-on', k <= pasoIdx));
}

// ---------- Puntos de lección ----------
function renderDots() {
  elDots.innerHTML = '';
  LECCIONES.forEach((l, k) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    b.title = l.titulo;
    b.setAttribute('aria-label', l.titulo);
    b.addEventListener('click', () => cargarLeccion(k));
    elDots.appendChild(b);
  });
}
function actualizarDots() {
  [...elDots.children].forEach((d, k) => d.classList.toggle('is-on', k === lecIdx));
}

// ---------- Autoplay ----------
function reproducir() {
  if (autoplay) { detener(); return; }
  btnPlay.innerHTML = '<i class="bi bi-pause-fill"></i>';
  btnPlay.setAttribute('aria-label', 'Pausar');
  autoplay = setInterval(() => {
    if (pasoIdx < pasos.length - 1) siguiente();
    else detener();
  }, 1500);
}
function detener() {
  if (autoplay) { clearInterval(autoplay); autoplay = null; }
  btnPlay.innerHTML = '<i class="bi bi-play-fill"></i>';
  btnPlay.setAttribute('aria-label', 'Reproducir');
}

// ---------- Eventos ----------
btnNext.addEventListener('click', () => { detener(); siguiente(); });
btnPrev.addEventListener('click', () => { detener(); anterior(); });
btnPlay.addEventListener('click', reproducir);

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight': detener(); siguiente(); break;
    case 'ArrowLeft':  detener(); anterior(); break;
    case 'ArrowDown':  cargarLeccion(lecIdx + 1); break;
    case 'ArrowUp':    cargarLeccion(lecIdx - 1); break;
    case ' ':          e.preventDefault(); reproducir(); break;
    default: break;
  }
});

// Redibujar conectores al cambiar el tamaño
let rafResize;
window.addEventListener('resize', () => {
  cancelAnimationFrame(rafResize);
  rafResize = requestAnimationFrame(() => {
    if (ctx) dibujarConectores(ctx.svg, ctx.reel.querySelector('.reel__lienzo'), pasos[pasoIdx].conectores);
  });
});

// Gestos: swipe vertical cambia de lección
let touchY = null;
elReels.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
elReels.addEventListener('touchend', (e) => {
  if (touchY == null) return;
  const dy = e.changedTouches[0].clientY - touchY;
  touchY = null;
  if (Math.abs(dy) < 60) return;
  cargarLeccion(dy < 0 ? lecIdx + 1 : lecIdx - 1);
});

// ---------- Arranque ----------
renderDots();
cargarLeccion(0);
