// ============================================================
// Code4SQL — Motor de pasos (step engine)
// Convierte una "lección" en una secuencia de "frames" que la UI anima.
// No parsea SQL: la lección declara la consulta de forma estructurada.
// Método físico simulado: NESTED_LOOPS (doble bucle).
// ============================================================

/** Antepone el alias a cada clave del objeto: {nombre} -> {'e.nombre'} */
function nsRow(alias, obj) {
  if (!obj) return {};
  const r = {};
  for (const k in obj) r[`${alias}.${k}`] = obj[k];
  return r;
}

/** Copia defensiva del scratchpad para que cada frame guarde su estado. */
function snapshot(filas) {
  return filas.map((f) => ({ estado: f.estado, valores: { ...f.valores } }));
}

/**
 * Genera los pasos de una lección.
 * @returns {Array} frames con: indice, total, fase, clausulaActiva,
 *   descripcion, izquierda[], derecha[], conectores[], scratch[]
 */
export function generarPasos(leccion) {
  const { tablaIzq, tablaDer, tipoJoin, condicion, where, ordenarPor, scratchpadCols } = leccion;
  const A = tablaIzq.filas;
  const B = tablaDer.filas;
  const aliasA = tablaIzq.alias;
  const aliasB = tablaDer.alias;

  const tipo = String(tipoJoin).toUpperCase();
  const noMatchIzq = tipo === 'LEFT' || tipo === 'FULL';
  const noMatchDer = tipo === 'RIGHT' || tipo === 'FULL';

  const pasos = [];
  const scratch = []; // filas acumuladas: { valores, estado }

  // Proyecta una fila combinada según scratchpadCols (claves con alias).
  const proyectar = (a, b) => {
    const merged = { ...nsRow(aliasA, a), ...nsRow(aliasB, b) };
    const valores = {};
    for (const c of scratchpadCols) valores[c.key] = c.key in merged ? merged[c.key] : null;
    return valores;
  };

  // ---- PASO 0: presentación ----
  pasos.push({
    fase: 'PRESENTACION',
    clausulaActiva: 'FROM',
    descripcion: `Tablas de origen: ${tablaIzq.nombre} (izquierda) y ${tablaDer.nombre} (derecha). El motor las recorre con bucles anidados.`,
    izquierda: [], derecha: [], conectores: [],
    scratch: snapshot(scratch),
  });

  if (tipo === 'CROSS') {
    // Producto cartesiano
    A.forEach((a, i) => {
      B.forEach((b, j) => {
        scratch.push({ valores: proyectar(a, b), estado: 'match' });
        pasos.push({
          fase: 'MATCH', clausulaActiva: 'JOIN',
          descripcion: `Producto cartesiano: fila ${i + 1} de ${tablaIzq.nombre} × fila ${j + 1} de ${tablaDer.nombre}.`,
          izquierda: [i], derecha: [j],
          conectores: [{ i, j, estado: 'match' }],
          scratch: snapshot(scratch),
        });
      });
    });
  } else {
    const usadasB = new Set();

    // ---- Bucle externo (A) × bucle interno (B) ----
    A.forEach((a, i) => {
      let emparejo = false;
      B.forEach((b, j) => {
        const ok = condicion(a, b);
        if (ok) {
          usadasB.add(j);
          emparejo = true;
          scratch.push({ valores: proyectar(a, b), estado: 'match' });
        }
        pasos.push({
          fase: ok ? 'MATCH' : 'COMPARACION',
          clausulaActiva: 'JOIN',
          descripcion: ok
            ? `✓ Coincidencia: ${tablaIzq.nombre}[${i + 1}] enlaza con ${tablaDer.nombre}[${j + 1}]. Se agrega al scratchpad.`
            : `Comparando ${tablaIzq.nombre}[${i + 1}] con ${tablaDer.nombre}[${j + 1}]… no cumplen la condición ON.`,
          izquierda: [i], derecha: [j],
          conectores: [{ i, j, estado: ok ? 'match' : 'nomatch' }],
          scratch: snapshot(scratch),
        });
      });

      // LEFT / FULL: fila izquierda sin pareja -> se conserva con NULL
      if (!emparejo && noMatchIzq) {
        scratch.push({ valores: proyectar(a, null), estado: 'sin-pareja' });
        pasos.push({
          fase: 'SIN_PAREJA', clausulaActiva: 'JOIN',
          descripcion: `${tablaIzq.nombre}[${i + 1}] no encontró pareja → ${tipo} JOIN la conserva con NULL en las columnas de la derecha.`,
          izquierda: [i], derecha: [], conectores: [],
          scratch: snapshot(scratch),
        });
      }
    });

    // RIGHT / FULL: filas derechas sin pareja -> se conservan con NULL
    if (noMatchDer) {
      B.forEach((b, j) => {
        if (!usadasB.has(j)) {
          scratch.push({ valores: proyectar(null, b), estado: 'sin-pareja' });
          pasos.push({
            fase: 'SIN_PAREJA', clausulaActiva: 'JOIN',
            descripcion: `${tablaDer.nombre}[${j + 1}] no encontró pareja → ${tipo} JOIN la conserva con NULL en las columnas de la izquierda.`,
            izquierda: [], derecha: [j], conectores: [],
            scratch: snapshot(scratch),
          });
        }
      });
    }
  }

  // ---- WHERE (opcional) ----
  if (where) {
    scratch.forEach((f) => { if (!where(f.valores)) f.estado = 'filtrada'; });
    pasos.push({
      fase: 'WHERE', clausulaActiva: 'WHERE',
      descripcion: 'Se aplica WHERE sobre el resultado intermedio: las filas tachadas no cumplen y se descartan.',
      izquierda: [], derecha: [], conectores: [],
      scratch: snapshot(scratch),
    });
    for (let k = scratch.length - 1; k >= 0; k--) {
      if (scratch[k].estado === 'filtrada') scratch.splice(k, 1);
    }
  }

  // ---- ORDER BY (opcional) ----
  if (ordenarPor) {
    scratch.sort((x, y) => ordenarPor(x.valores, y.valores));
    pasos.push({
      fase: 'ORDEN', clausulaActiva: 'ORDER',
      descripcion: 'Se aplica ORDER BY: el resultado se reordena.',
      izquierda: [], derecha: [], conectores: [],
      scratch: snapshot(scratch),
    });
  }

  // ---- RESULTADO ----
  pasos.push({
    fase: 'RESULTADO', clausulaActiva: 'SELECT',
    descripcion: `Resultado final del ${tipo} JOIN: ${scratch.length} fila(s). El SELECT proyecta las columnas pedidas.`,
    izquierda: [], derecha: [], conectores: [],
    scratch: snapshot(scratch),
  });

  return pasos.map((p, idx) => ({ ...p, indice: idx, total: pasos.length }));
}
