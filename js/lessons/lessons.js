// ============================================================
// Code4SQL — Catálogo de lecciones (reels)
// Cada lección usa el schema HR chileno (EMPLEADOS × DEPARTAMENTOS).
// Se trabaja con un subconjunto curado de filas para que la
// animación sea digerible (igual que las imágenes de referencia).
// ============================================================
import { empleadoPorId, departamentoPorId } from '../data/hr-cl.js';

// Subconjunto que cubre todos los casos interesantes:
//   104 Florencia (Ventas 50), 105 Vicente (Ventas 50),
//   108 Catalina (Tecnología 40), 111 Joaquín (sin depto -> NULL)
const EMPS = [104, 105, 108, 111].map(empleadoPorId);
//   40 Tecnología (con empleados), 50 Ventas (con empleados),
//   60 Marketing (sin empleados -> NULL en RIGHT/FULL)
const DEPS = [40, 50, 60].map(departamentoPorId);

const colsEmp = [
  { key: 'id_empleado', label: 'id' },
  { key: 'nombre', label: 'nombre' },
];
const colsDep = [
  { key: 'id_departamento', label: 'id' },
  { key: 'nombre_departamento', label: 'departamento' },
];
const scratchpadCols = [
  { key: 'e.id_empleado', label: 'id' },
  { key: 'e.nombre', label: 'nombre' },
  { key: 'd.nombre_departamento', label: 'departamento' },
];

const condicion = (e, d) => e.id_departamento === d.id_departamento;

// SQL tokenizado (c = clase de color, t = texto)
function sqlBase(joinKw) {
  return [
    { clausula: 'SELECT', tokens: [{ c: 'kw', t: 'SELECT' }, { c: 'def', t: ' e.id_empleado, e.nombre, d.nombre_departamento' }] },
    { clausula: 'FROM',   tokens: [{ c: 'kw', t: 'FROM' }, { c: 'def', t: ' empleados ' }, { c: 'id', t: 'e' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'kw', t: joinKw }, { c: 'def', t: ' departamentos ' }, { c: 'id', t: 'd' }, { c: 'kw', t: ' ON' }] },
    { clausula: 'JOIN',   tokens: [{ c: 'def', t: '  e.id_departamento = d.id_departamento;' }] },
  ];
}

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
    condicion,
    scratchpadCols,
    sql: sqlBase(joinKw),
  };
}

export const LECCIONES = [
  leccionJoin('INNER', 'INNER JOIN',
    'El INNER JOIN devuelve solo las filas que tienen pareja en ambas tablas. Joaquín (sin departamento) y Marketing (sin empleados) quedan fuera.'),
  leccionJoin('LEFT', 'LEFT JOIN',
    'El LEFT JOIN conserva TODAS las filas de empleados. Joaquín no tiene departamento, así que la columna de la derecha queda en NULL.'),
  leccionJoin('RIGHT', 'RIGHT JOIN',
    'El RIGHT JOIN conserva TODOS los departamentos. Marketing no tiene empleados, así que las columnas de la izquierda quedan en NULL.'),
  leccionJoin('FULL', 'FULL JOIN',
    'El FULL JOIN conserva ambos lados: empleados sin departamento (Joaquín) y departamentos sin empleados (Marketing).'),
];
