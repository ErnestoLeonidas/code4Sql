// ============================================================
// Code4SQL — Orquestador de presentación: pinta un frame
// ============================================================
import { renderScratch } from './scratchpad.js';
import { dibujarConectores } from './connectors.js';

let ctx = null; // { reel, svg, leccion }

export function setContexto(contexto) {
  ctx = contexto;
}

/**
 * Aplica un frame al reel actual (resaltados, cláusula activa,
 * scratchpad, narración y conectores).
 */
export function pintarFrame(frame) {
  if (!ctx) return;
  const { reel, svg, leccion } = ctx;

  // 1) Resaltado de filas en las tablas de origen
  reel.querySelectorAll('tr[data-side]').forEach((tr) => tr.classList.remove('is-resaltada'));
  frame.izquierda.forEach((i) =>
    reel.querySelector(`tr[data-side="izq"][data-idx="${i}"]`)?.classList.add('is-resaltada'));
  frame.derecha.forEach((j) =>
    reel.querySelector(`tr[data-side="der"][data-idx="${j}"]`)?.classList.add('is-resaltada'));

  // 2) Cláusula SQL activa (puede haber varias líneas con la misma cláusula)
  reel.querySelectorAll('.sql__linea').forEach((l) => l.classList.remove('is-activa'));
  if (frame.clausulaActiva) {
    reel.querySelectorAll(`.sql__linea[data-clausula="${frame.clausulaActiva}"]`)
      .forEach((l) => l.classList.add('is-activa'));
  }

  // 3) Scratchpad
  renderScratch(reel.querySelector('.scratchpad__cuerpo'), frame.scratch, leccion.scratchpadCols);

  // 4) Narración
  reel.querySelector('.reel__descripcion').textContent = frame.descripcion;

  // 5) Conectores (tras el layout)
  const lienzo = reel.querySelector('.reel__lienzo');
  requestAnimationFrame(() => dibujarConectores(svg, lienzo, frame.conectores));
}
