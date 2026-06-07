// ============================================================
// Code4SQL — Componente: scratchpad (resultado intermedio)
// ============================================================

/**
 * Renderiza el resultado intermedio dentro de un contenedor.
 * @param {HTMLElement} contenedor  nodo .scratchpad__cuerpo
 * @param {Array} scratch  filas: { valores:{}, estado }
 * @param {Array} cols     columnas: [{ key, label }]
 */
export function renderScratch(contenedor, scratch, cols) {
  contenedor.innerHTML = '';

  if (!scratch || scratch.length === 0) {
    const vacio = document.createElement('div');
    vacio.className = 'scratch__vacio';
    vacio.textContent = '— vacío —';
    contenedor.appendChild(vacio);
    return;
  }

  const t = document.createElement('table');
  t.className = 'scratch__tabla';

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  for (const c of cols) {
    const th = document.createElement('th');
    th.textContent = c.label;
    trh.appendChild(th);
  }
  thead.appendChild(trh);
  t.appendChild(thead);

  const tbody = document.createElement('tbody');
  scratch.forEach((f) => {
    const tr = document.createElement('tr');
    tr.className = `scratch__fila scratch__fila--${f.estado}`;
    for (const c of cols) {
      const td = document.createElement('td');
      const v = f.valores[c.key];
      td.textContent = v == null ? 'NULL' : v;
      if (v == null) td.classList.add('val--null');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);

  contenedor.appendChild(t);
}
