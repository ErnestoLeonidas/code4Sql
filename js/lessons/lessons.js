// ============================================================
// Code4SQL — Catálogo de lecciones (reels)
// Cada lección usa el schema HR chileno como dataset.
// Se trabaja con subconjuntos curados de filas para que la
// animación sea digerible (igual que las imágenes de referencia).
// ============================================================
import { empleadoPorId, departamentoPorId, cargoPorId } from '../data/hr-cl.js';

// ---- Subconjuntos curados ----
// Cubre todos los casos: matches, empleado sin depto y depto sin empleados.
const EMPS = [104, 105, 108, 111].map(empleadoPorId); // Florencia, Vicente, Catalina, Joaquín(sin depto)
const DEPS = [40, 50, 60].map(departamentoPorId);     // Tecnología, Ventas, Marketing(sin empleados)

// ---- Columnas reutilizables ----
const colsEmp = [
  { key: 'id_empleado', label: 'id' },
  { key: 'nombre', label: 'nombre' },
];
const colsDep = [
  { key: 'id_departamento', label: 'id' },
  { key: 'nombre_departamento', label: 'departamento' },
];
const scratchEmpDep = [
  { key: 'e.id_empleado', label: 'id' },
  { key: 'e.nombre', label: 'nombre' },
  { key: 'd.nombre_departamento', label: 'departamento' },
];
const condEmpDep = (e, d) => e.id_departamento === d.id_departamento;

// ============================================================
// SQL tokenizado (c = clase de color, t = texto)
// ============================================================
function sqlJoin(joinKw) {
  return [
    { clausula: 'SELECT', tokens: [{ c: 'kw', t: 'SELECT' }, { c: 'def', t: ' e.id_empleado, e.nombre, d.nombre_departamento' }] },
    { clausula: 'FROM',   tokens: [{ c: 'kw', t: 'FROM' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'e' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'kw', t: joinKw }, { c: 'def', t: ' departamentos ' }, { c: 'id', t: 'd' }, { c: 'kw', t: ' ON' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'def', t: '  e.id_departamento = d.id_departamento;' }] },
  ];
}

function sqlLeftWhere() {
  return [
    { clausula: 'SELECT', tokens: [{ c: 'kw', t: 'SELECT' }, { c: 'def', t: ' e.id_empleado, e.nombre, d.nombre_departamento' }] },
    { clausula: 'FROM',   tokens: [{ c: 'kw', t: 'FROM' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'e' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'kw', t: 'LEFT JOIN' }, { c: 'def', t: ' departamentos ' }, { c: 'id', t: 'd' }, { c: 'kw', t: ' ON' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'def', t: '  e.id_departamento = d.id_departamento' }] },
    { clausula: 'WHERE',  tokens: [{ c: 'kw', t: 'WHERE' }, { c: 'def', t: ' d.nombre_departamento = ' }, { c: 'str', t: "'Ventas'" }, { c: 'def', t: ';' }] },
  ];
}

function sqlSelf() {
  return [
    { clausula: 'SELECT', tokens: [{ c: 'kw', t: 'SELECT' }, { c: 'def', t: ' e.nombre ' }, { c: 'kw', t: 'AS' }, { c: 'def', t: ' empleado, j.nombre ' }, { c: 'kw', t: 'AS' }, { c: 'def', t: ' jefe' }] },
    { clausula: 'FROM',   tokens: [{ c: 'kw', t: 'FROM' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'e' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'kw', t: 'JOIN' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'j' }, { c: 'kw', t: ' ON' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'def', t: '  e.id_jefe = j.id_empleado;' }] },
  ];
}

function sqlCross() {
  return [
    { clausula: 'SELECT', tokens: [{ c: 'kw', t: 'SELECT' }, { c: 'def', t: ' e.nombre, c.titulo_cargo' }] },
    { clausula: 'FROM',   tokens: [{ c: 'kw', t: 'FROM' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'e' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'kw', t: 'CROSS JOIN' }, { c: 'def', t: ' cargos ' }, { c: 'id', t: 'c' }, { c: 'def', t: ';' }] },
  ];
}

// ============================================================
// Lecciones
// ============================================================
function leccionJoin(tipo, joinKw, narracion) {
  return {
    id: `${tipo.toLowerCase()}-join`,
    titulo: joinKw,
    subtitulo: `VISUALIZANDO SQL ${joinKw}`,
    narracion,
    tablaIzq: { nombre: 'EMPLEADOS', alias: 'e', cols: colsEmp, filas: EMPS },
    tablaDer: { nombre: 'DEPARTAMENTOS', alias: 'd', cols: colsDep, filas: DEPS },
    tipoJoin: tipo,
    metodoFisico: 'NESTED_LOOPS',
    condicion: condEmpDep,
    scratchpadCols: scratchEmpDep,
    sql: sqlJoin(joinKw),
  };
}

// CROSS JOIN: empleados × cargos (producto cartesiano)
const leccionCross = {
  id: 'cross-join',
  titulo: 'CROSS JOIN',
  subtitulo: 'VISUALIZANDO SQL CROSS JOIN',
  narracion: 'El CROSS JOIN combina CADA empleado con CADA cargo (producto cartesiano). 2 empleados × 3 cargos = 6 filas. No usa condición ON.',
  tablaIzq: { nombre: 'EMPLEADOS', alias: 'e', cols: colsEmp, filas: [104, 105].map(empleadoPorId) },
  tablaDer: {
    nombre: 'CARGOS', alias: 'c',
    cols: [{ key: 'id_cargo', label: 'id' }, { key: 'titulo_cargo', label: 'cargo' }],
    filas: ['EV', 'DS', 'UX'].map(cargoPorId),
  },
  tipoJoin: 'CROSS',
  metodoFisico: 'NESTED_LOOPS',
  condicion: () => true,
  scratchpadCols: [
    { key: 'e.nombre', label: 'empleado' },
    { key: 'c.titulo_cargo', label: 'cargo' },
  ],
  sql: sqlCross(),
};

// SELF JOIN: empleados ↔ su jefe (la tabla consigo misma)
const leccionSelf = {
  id: 'self-join',
  titulo: 'SELF JOIN',
  subtitulo: 'VISUALIZANDO SQL SELF JOIN',
  narracion: 'El SELF JOIN une la tabla EMPLEADOS consigo misma: el id_jefe de cada empleado apunta al id_empleado de su jefe.',
  tablaIzq: {
    nombre: 'EMPLEADOS e', alias: 'e',
    cols: [{ key: 'id_empleado', label: 'id' }, { key: 'nombre', label: 'nombre' }, { key: 'id_jefe', label: 'id_jefe' }],
    filas: [104, 105, 111].map(empleadoPorId),
  },
  tablaDer: {
    nombre: 'EMPLEADOS j', alias: 'j',
    cols: [{ key: 'id_empleado', label: 'id' }, { key: 'nombre', label: 'jefe' }],
    filas: [100, 104].map(empleadoPorId),
  },
  tipoJoin: 'INNER',
  metodoFisico: 'NESTED_LOOPS',
  condicion: (e, j) => e.id_jefe === j.id_empleado,
  scratchpadCols: [
    { key: 'e.nombre', label: 'empleado' },
    { key: 'j.nombre', label: 'jefe' },
  ],
  sql: sqlSelf(),
};

// LEFT JOIN + WHERE: el WHERE sobre la tabla derecha "rompe" el outer join
const leccionLeftWhere = {
  id: 'left-where',
  titulo: 'LEFT + WHERE',
  subtitulo: 'CUANDO WHERE ROMPE EL OUTER JOIN',
  narracion: 'Aunque sea LEFT JOIN, el WHERE sobre una columna de la tabla derecha descarta las filas con NULL (Joaquín). Resultado: se comporta como INNER JOIN.',
  tablaIzq: { nombre: 'EMPLEADOS', alias: 'e', cols: colsEmp, filas: EMPS },
  tablaDer: { nombre: 'DEPARTAMENTOS', alias: 'd', cols: colsDep, filas: DEPS },
  tipoJoin: 'LEFT',
  metodoFisico: 'NESTED_LOOPS',
  condicion: condEmpDep,
  scratchpadCols: scratchEmpDep,
  where: (v) => v['d.nombre_departamento'] === 'Ventas',
  sql: sqlLeftWhere(),
};

export const LECCIONES = [
  leccionJoin('INNER', 'INNER JOIN',
    'El INNER JOIN devuelve solo las filas que tienen pareja en ambas tablas. Joaquín (sin departamento) y Marketing (sin empleados) quedan fuera.'),
  leccionJoin('LEFT', 'LEFT JOIN',
    'El LEFT JOIN conserva TODAS las filas de empleados. Joaquín no tiene departamento, así que la columna de la derecha queda en NULL.'),
  leccionJoin('RIGHT', 'RIGHT JOIN',
    'El RIGHT JOIN conserva TODOS los departamentos. Marketing no tiene empleados, así que las columnas de la izquierda quedan en NULL.'),
  leccionJoin('FULL', 'FULL JOIN',
    'El FULL JOIN conserva ambos lados: empleados sin departamento (Joaquín) y departamentos sin empleados (Marketing).'),
  leccionCross,
  leccionSelf,
  leccionLeftWhere,
];
