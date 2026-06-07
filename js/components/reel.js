// ============================================================
// Code4SQL — Componente: arma el esqueleto de un reel (estático)
// El estado por-paso lo aplica luego pintarFrame() (index.js).
// ============================================================
import { renderTabla } from './table-view.js';
import { renderSql } from './query-panel.js';

const SVGNS = 'http://www.w3.org/2000/svg';

/**
 * Construye el reel de una lección dentro del contenedor.
 * @returns {{ reel: HTMLElement, svg: SVGElement }}
 */
export function renderReel(contenedor, leccion) {
  contenedor.innerHTML = '';

  const reel = document.createElement('section');
  reel.className = 'reel';

  // Encabezado
  const head = document.createElement('header');
  head.className = 'reel__head';
  const sub = document.createElement('div');
  sub.className = 'reel__subtitulo';
  sub.textContent = leccion.subtitulo;
  const titulo = document.createElement('h1');
  titulo.className = 'reel__titulo';
  titulo.textContent = leccion.titulo;
  head.append(sub, titulo);
  reel.appendChild(head);

  // Lienzo: dos tablas + overlay de conectores
  const lienzo = document.createElement('div');
  lienzo.className = 'reel__lienzo';

  const grid = document.createElement('div');
  grid.className = 'reel__tablas';
  grid.appendChild(renderTabla(leccion.tablaIzq, 'izq'));
  grid.appendChild(renderTabla(leccion.tablaDer, 'der'));
  lienzo.appendChild(grid);

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'overlay');
  svg.setAttribute('preserveAspectRatio', 'none');
  lienzo.appendChild(svg);

  reel.appendChild(lienzo);

  // Scratchpad
  const sp = document.createElement('div');
  sp.className = 'scratchpad';
  const spTit = document.createElement('div');
  spTit.className = 'scratchpad__titulo';
  spTit.textContent = 'UNDER THE HOOD // JOIN_SCRATCHPAD';
  const spBody = document.createElement('div');
  spBody.className = 'scratchpad__cuerpo';
  sp.append(spTit, spBody);
  reel.appendChild(sp);

  // Panel SQL
  reel.appendChild(renderSql(leccion.sql));

  // Narración (accesible)
  const desc = document.createElement('p');
  desc.className = 'reel__descripcion';
  desc.setAttribute('aria-live', 'polite');
  reel.appendChild(desc);

  contenedor.appendChild(reel);
  return { reel, svg };
}
