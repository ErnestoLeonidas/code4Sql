// ============================================================
// Code4SQL — Componente: conectores (líneas punteadas SVG)
// Dibuja líneas entre filas de la tabla izquierda y la derecha.
// ============================================================

const SVGNS = 'http://www.w3.org/2000/svg';

/**
 * Dibuja los conectores del frame actual.
 * @param {SVGElement} svg          overlay <svg> dentro del lienzo
 * @param {HTMLElement} contenedor  .reel__lienzo (referencia de coordenadas)
 * @param {Array} conectores        [{ i, j, estado }]
 */
export function dibujarConectores(svg, contenedor, conectores) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (!contenedor) return;

  const base = contenedor.getBoundingClientRect();
  if (base.width === 0 || base.height === 0) return;

  // Coordenadas en el sistema interno del SVG (mismo px que el lienzo)
  svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  (conectores || []).forEach((con) => {
    const elIzq = contenedor.querySelector(`tr[data-side="izq"][data-idx="${con.i}"]`);
    const elDer = contenedor.querySelector(`tr[data-side="der"][data-idx="${con.j}"]`);
    if (!elIzq || !elDer) return;

    const r1 = elIzq.getBoundingClientRect();
    const r2 = elDer.getBoundingClientRect();

    const x1 = r1.right - base.left;
    const y1 = r1.top + r1.height / 2 - base.top;
    const x2 = r2.left - base.left;
    const y2 = r2.top + r2.height / 2 - base.top;
    const mx = (x1 + x2) / 2;

    const path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`);
    path.setAttribute('class', `conector conector--${con.estado}`);
    svg.appendChild(path);

    if (!reduce && typeof path.animate === 'function') {
      path.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
    }
  });
}
