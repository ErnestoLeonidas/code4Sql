// ============================================================
// Code4SQL — Componente: tabla de datos de origen
// ============================================================

/**
 * Renderiza una tabla de origen.
 * @param {Object} tabla  { nombre, cols:[{key,label}], filas:[...] }
 * @param {String} lado   'izq' | 'der'  (para enlazar conectores)
 */
export function renderTabla(tabla, lado) {
  const wrap = document.createElement('div');
  wrap.className = `tabla tabla--${lado}`;

  const head = document.createElement('div');
  head.className = 'tabla__cabecera';
  head.textContent = `TABLA: ${tabla.nombre}`;
  wrap.appendChild(head);

  const t = document.createElement('table');

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  for (const c of tabla.cols) {
    const th = document.createElement('th');
    th.textContent = c.label;
    trh.appendChild(th);
  }
  thead.appendChild(trh);
  t.appendChild(thead);

  const tbody = document.createElement('tbody');
  tabla.filas.forEach((fila, idx) => {
    const tr = document.createElement('tr');
    tr.dataset.side = lado;
    tr.dataset.idx = idx;
    for (const c of tabla.cols) {
      const td = document.createElement('td');
      const v = fila[c.key];
      td.textContent = v == null ? 'NULL' : v;
      if (v == null) td.classList.add('val--null');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);
  wrap.appendChild(t);

  return wrap;
}
