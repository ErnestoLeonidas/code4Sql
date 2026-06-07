// ============================================================
// Code4SQL — Algoritmos lógicos de JOIN (resultado, sin animación)
// Útiles para el resultado final y para tests.
// ============================================================

/** Devuelve los pares {a, b} resultantes de un join lógico.
 *  Para filas sin pareja, el lado faltante es null. */
export function joinLogico(A, B, cond, tipo) {
  const t = String(tipo).toUpperCase();

  if (t === 'CROSS') {
    return A.flatMap((a) => B.map((b) => ({ a, b })));
  }

  const out = [];
  const usadasB = new Set();

  A.forEach((a) => {
    let emparejo = false;
    B.forEach((b, j) => {
      if (cond(a, b)) {
        out.push({ a, b });
        usadasB.add(j);
        emparejo = true;
      }
    });
    if (!emparejo && (t === 'LEFT' || t === 'FULL')) out.push({ a, b: null });
  });

  if (t === 'RIGHT' || t === 'FULL') {
    B.forEach((b, j) => {
      if (!usadasB.has(j)) out.push({ a: null, b });
    });
  }

  return out;
}
