// ============================================================
// Code4SQL — Componente: panel SQL con resaltado y nº de línea
// ============================================================

const CLASES = {
  kw: 'tok-kw',   // keyword (violeta)
  kw2: 'tok-kw2', // DISTINCT (rosado)
  str: 'tok-str', // string (verde)
  num: 'tok-num', // número (ámbar)
  id: 'tok-id',   // identificador/alias (cian)
  op: 'tok-op',   // operador (gris)
  def: '',        // texto por defecto
};

/**
 * Renderiza el SQL de una lección.
 * @param {Array} sql  líneas: { clausula, tokens:[{c,t}] }
 */
export function renderSql(sql) {
  const wrap = document.createElement('div');
  wrap.className = 'sql';

  sql.forEach((linea, i) => {
    const row = document.createElement('div');
    row.className = 'sql__linea';
    if (linea.clausula) row.dataset.clausula = linea.clausula;

    const num = document.createElement('span');
    num.className = 'sql__num';
    num.textContent = i + 1;

    const code = document.createElement('span');
    code.className = 'sql__code';
    for (const tok of linea.tokens) {
      const s = document.createElement('span');
      const cls = CLASES[tok.c];
      if (cls) s.className = cls;
      s.textContent = tok.t;
      code.appendChild(s);
    }

    row.appendChild(num);
    row.appendChild(code);
    wrap.appendChild(row);
  });

  return wrap;
}
