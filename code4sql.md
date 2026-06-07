# Code4SQL — Visor del Funcionamiento Interno de Oracle SQL

> Documento de proyecto / blueprint de construcción.
> Stack obligatorio: **Bootstrap 5.3.x + JavaScript (vanilla) + HTML + CSS**. Sin backend, sin build step.
> Dataset del sistema: **Schema HR adaptado a español chileno** (ver sección 9).

---

## Tabla de contenidos

1. [Objetivo del proyecto](#1-objetivo-del-proyecto)
2. [Alcance (MVP y futuro)](#2-alcance-mvp-y-futuro)
3. [Concepto y referencia visual](#3-concepto-y-referencia-visual)
4. [Conceptos de Oracle SQL a visualizar](#4-conceptos-de-oracle-sql-a-visualizar)
5. [Stack tecnológico](#5-stack-tecnológico)
6. [Arquitectura de la aplicación](#6-arquitectura-de-la-aplicación)
7. [Estructura de archivos](#7-estructura-de-archivos)
8. [El motor de pasos (step engine)](#8-el-motor-de-pasos-step-engine)
9. [Modelo de datos: Schema HR Chileno](#9-modelo-de-datos-schema-hr-chileno)
10. [Diseño UI/UX mobile-first](#10-diseño-uiux-mobile-first)
11. [Especificación de componentes](#11-especificación-de-componentes)
12. [Catálogo de lecciones (reels)](#12-catálogo-de-lecciones-reels)
13. [Snippets de implementación clave](#13-snippets-de-implementación-clave)
14. [Roadmap de construcción](#14-roadmap-de-construcción)
15. [Mejoras futuras](#15-mejoras-futuras)
16. [Glosario Oracle](#16-glosario-oracle)
17. [Checklist de construcción](#17-checklist-de-construcción)

---

## 1. Objetivo del proyecto

**Code4SQL** es una aplicación web **mobile-first** que **visualiza, paso a paso y animado, cómo Oracle procesa internamente una consulta SQL**. En lugar de mostrar solo la consulta y su resultado, muestra *qué pasa "bajo el capó"*: cómo se combinan las tablas, cómo se arma el resultado intermedio (el "scratchpad" / área de trabajo), cómo se filtran y agrupan las filas, y en qué orden lógico ocurre todo.

El formato visual está inspirado en los *reels* educativos (estilo `datavverse`): tarjetas verticales a pantalla completa, tema oscuro, tipografía monoespaciada, y una narración corta por cada concepto.

### Problema que resuelve
Quien aprende SQL memoriza la sintaxis de un `JOIN`, pero **no entiende qué ocurre internamente**: por qué un `LEFT JOIN` conserva filas sin pareja, por qué `WHERE` sobre la tabla derecha "rompe" un outer join, o por qué el orden de las cláusulas no es el orden de ejecución. Code4SQL convierte ese modelo mental abstracto en una **animación concreta**.

### Público objetivo
- Estudiantes de bases de datos / programación.
- Personas preparando certificaciones Oracle.
- Docentes que necesitan material visual para explicar JOINs y procesamiento de consultas.

### Propuesta de valor (qué lo hace distinto)
- **Enfoque en el "funcionamiento interno"**, no solo en el resultado.
- Muestra el **orden lógico de procesamiento** de Oracle (FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY).
- Muestra los **métodos físicos de join** de Oracle (Nested Loops, Hash Join, Sort-Merge).
- **100% en español chileno**, con datos realistas (RUT, sueldos en CLP, ciudades de Chile).
- Funciona offline en un teléfono, sin instalar nada.

---

## 2. Alcance (MVP y futuro)

### Incluye (MVP)
- Visor tipo *reel* con scroll vertical (scroll-snap) entre lecciones.
- Animación paso a paso de cada consulta (botones anterior/siguiente + autoplay).
- Tipos de JOIN: `INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`, `SELF`.
- Cláusulas: `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `DISTINCT`.
- Panel SQL con resaltado de sintaxis y cláusula activa.
- Dataset: **Schema HR chileno** embebido (sin servidor).
- Vista "lógica" (qué filas hacen match) **y** vista "física" (método de join de Oracle).

### No incluye (en MVP)
- Parser SQL real / editor de consultas libres (es mejora futura).
- Conexión a una base de datos Oracle real.
- Backend, autenticación o persistencia en la nube.

### Criterios de éxito
- Carga en < 1.5 s en un teléfono de gama media.
- Cada lección se entiende sin leer texto adicional (la animación basta).
- Lighthouse: Performance ≥ 90, Accessibility ≥ 90 en móvil.

---

## 3. Concepto y referencia visual

Las imágenes de referencia (`/img/IMG_5038.png`, `IMG_5039.png`, `IMG_5041.png`) muestran el formato a replicar. Anatomía de un *reel*:

```
┌─────────────────────────────┐
│  ●  VISUALIZANDO SQL LEFT JOIN   ← subtítulo + dot
│         LEFT JOIN               ← título grande (glow cian)
├──────────────┬──────────────┤
│ TABLA: A     │ TABLA: B     │   ← dos tablas fuente
│ 1 Bob        │ 1 delivered  │
│ 2 Alice ◀────┼─ ─ ─▶ 2 pend │   ← conector punteado rojo
│ 3 Mike       │ 3 delivered  │
│ 4 Rose       │ 5 delivered  │
├──────────────┴──────────────┤
│ UNDER THE HOOD // SCRATCHPAD │   ← resultado intermedio
│ 1 Bob   delivered (verde)    │
│ 2 Alice pending  (naranjo)   │
├─────────────────────────────┤
│ 1 SELECT DISTINCT id, nombre │   ← SQL con nº de línea
│ 2 FROM empleados             │
│ 3 LEFT JOIN ... ON      ◀━━━ │   ← cláusula ACTIVA destacada
│ 4 WHERE ...                  │
│ 5 GROUP BY id;               │
└─────────────────────────────┘
   ♥ likes   💬 coment   ↪ share   🔖 save   ← UI social (opcional)
```

### Decodificación del lenguaje visual
| Elemento | Significado |
|---|---|
| Fila resaltada (banda cian) | Fila actualmente bajo evaluación |
| Línea punteada roja entre tablas | Evaluación de la condición `ON` (match candidato) |
| Scratchpad / "Virtual Storage" | Resultado intermedio que Oracle construye en memoria (área de trabajo PGA) |
| Verde (`delivered`) | Fila que cumple / hizo match |
| Naranjo (`pending`) | Fila pendiente / sin pareja / a punto de filtrarse |
| Borde izquierdo + fondo en una línea SQL | Cláusula que se está ejecutando en este paso |
| Números de línea grises | Numeración de la consulta (no orden de ejecución) |

> **Reinterpretación para Code4SQL:** las imágenes usan tablas de juguete `CLIENT`/`DELIVERY`. En nuestro sistema, esas tablas serán **`EMPLEADOS`** y **`DEPARTAMENTOS`** (y otras) del **schema HR chileno**, manteniendo exactamente el mismo lenguaje visual.

---

## 4. Conceptos de Oracle SQL a visualizar

El corazón educativo de la app. Cada uno se convierte en una o más lecciones.

### 4.1 Orden lógico de procesamiento de la consulta
Oracle **no ejecuta** las cláusulas en el orden en que se escriben. El orden lógico es:

```
1. FROM / JOIN     → se determinan y combinan las tablas (se arma el "row source")
2. ON              → se aplica la condición de unión
3. WHERE           → se filtran filas individuales
4. GROUP BY        → se agrupan filas
5. HAVING          → se filtran grupos
6. SELECT          → se proyectan/calculan columnas (aquí actúa DISTINCT)
7. ORDER BY        → se ordena el resultado
8. FETCH / ROWNUM  → se limita el número de filas
```

> **Insight clave a enseñar:** por eso un alias del `SELECT` no se puede usar en el `WHERE` (el `WHERE` corre antes), y por eso un `WHERE` sobre la tabla derecha de un `LEFT JOIN` lo convierte de facto en `INNER JOIN`.

### 4.2 Tipos de JOIN (vista lógica)
| Tipo | Conserva | Caso de uso en HR |
|---|---|---|
| `INNER JOIN` | Solo filas con pareja en ambas tablas | Empleados **con** departamento asignado |
| `LEFT JOIN` | Todas las de la izquierda + parejas | **Todos** los empleados, tengan o no departamento |
| `RIGHT JOIN` | Todas las de la derecha + parejas | **Todos** los departamentos, tengan o no empleados |
| `FULL JOIN` | Todas de ambas | Empleados sin depto **y** deptos sin empleados |
| `CROSS JOIN` | Producto cartesiano (todas × todas) | Combinaciones posibles empleado × turno |
| `SELF JOIN` | Tabla consigo misma | Empleado ↔ su jefe (`id_jefe`) |

### 4.3 Métodos físicos de JOIN (vista interna de Oracle)
Esto es lo que diferencia a Code4SQL: además de *qué* filas se unen, mostramos *cómo* el motor lo hace.

| Método | Cómo funciona (animación) | Cuándo lo elige Oracle |
|---|---|---|
| **Nested Loops** | Por cada fila de la tabla externa, recorre la interna buscando match (doble bucle). | Tablas pequeñas / índice disponible en la tabla interna. |
| **Hash Join** | Fase *build*: arma una tabla hash con la tabla más pequeña. Fase *probe*: recorre la grande y busca en el hash. | Tablas grandes sin índice útil, igualdad (`=`). |
| **Sort-Merge Join** | Ordena ambas tablas por la clave y las recorre en paralelo fusionando. | Datos ya ordenados / joins por rango. |

> El "JOIN_SCRATCHPAD" / "VIRTUAL STORAGE" de las imágenes se mapea conceptualmente al **área de trabajo (work area) en la PGA** donde Oracle construye la tabla hash o realiza el sort. Lo presentamos así para dar realismo.

### 4.4 Conceptos transversales
- **NULL** y su efecto en joins y agregaciones (`COUNT(*)` vs `COUNT(columna)`).
- **DISTINCT** como deduplicación posterior a la proyección.
- **Funciones de agregación** con `GROUP BY` / `HAVING`.
- **Subconsultas** (correlacionadas vs no correlacionadas) — mejora futura.

---

## 5. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| UI framework | **Bootstrap 5.3.x** | Vía CDN. Usa **modo oscuro nativo** con `data-bs-theme="dark"`. |
| Iconos | Bootstrap Icons 1.11+ | Para likes/share/guardar y controles. |
| Lógica | **JavaScript ES2020 (vanilla)** | Módulos ES (`type="module"`). Sin frameworks ni bundler. |
| Estilos | **CSS3** | Variables CSS para el tema; complementa a Bootstrap. |
| Animaciones | CSS transitions + Web Animations API | Conectores con SVG superpuesto. |
| Datos | JS embebido (`hr-cl.js`) | El schema HR chileno como objetos JS/JSON. |
| Tipografía | `JetBrains Mono` / `Fira Code` (mono) + `Inter` (UI) | Vía Google Fonts o `system-ui` como fallback. |

**Sin build step:** se abre `index.html` directo o con un servidor estático (`python -m http.server`, Live Server, etc.). Esto facilita publicar en GitHub Pages / Netlify.

```html
<!-- CDNs base -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
```

---

## 6. Arquitectura de la aplicación

Arquitectura **modular, sin framework**, separando datos, lógica de simulación y presentación.

```
┌────────────────────────────────────────────────────────────┐
│                        index.html                            │
│  (contenedor de reels con scroll-snap + barra de progreso)   │
└───────────────┬──────────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │     app.js      │  Orquesta: carga lecciones, navegación,
        │  (controlador)  │  estado del paso actual, autoplay.
        └───┬────────┬────┘
            │        │
   ┌────────▼──┐  ┌──▼─────────────┐
   │ lessons.js │  │  sql-engine.js │  Genera la lista de PASOS (frames)
   │ (catálogo) │  │ + joins.js     │  a partir de una lección + datos.
   └────────────┘  └──┬─────────────┘
                      │  usa
            ┌─────────▼──────────┐
            │     hr-cl.js        │  Dataset HR chileno (fuente de verdad)
            └─────────────────────┘

   Presentación (reciben un "frame" y lo pintan):
   table-view.js · scratchpad.js · query-panel.js · connectors.js · reel.js
```

### Flujo de datos (unidireccional)
1. `app.js` toma una **lección** del catálogo (`lessons.js`).
2. La pasa al **motor** (`sql-engine.js`), que junto a los **datos** (`hr-cl.js`) produce un **arreglo de pasos** (`frames[]`).
3. El usuario navega entre pasos; `app.js` mantiene `pasoActual`.
4. Cada componente de presentación **renderiza el frame actual** (las tablas con sus resaltados, el scratchpad, el SQL con su línea activa, los conectores).

> Principio: los componentes de presentación son **funciones puras de `(frame) → DOM`**. Toda la "inteligencia" vive en el motor. Esto hace trivial agregar lecciones nuevas.

---

## 7. Estructura de archivos

```
code4sql/
├── index.html
├── code4sql.md                 ← este documento
├── css/
│   ├── theme.css               ← variables CSS + tema oscuro
│   └── styles.css              ← componentes (reel, tablas, scratchpad, sql)
├── js/
│   ├── app.js                  ← controlador / navegación / autoplay
│   ├── data/
│   │   └── hr-cl.js            ← SCHEMA HR CHILENO (datos)
│   ├── engine/
│   │   ├── sql-engine.js       ← genera pasos (frames) de una lección
│   │   └── joins.js            ← algoritmos de join (lógicos y físicos)
│   ├── lessons/
│   │   └── lessons.js          ← catálogo de lecciones (consultas + narración)
│   └── components/
│       ├── reel.js             ← arma la tarjeta de una lección
│       ├── table-view.js       ← renderiza una tabla de datos
│       ├── scratchpad.js       ← renderiza el resultado intermedio
│       ├── query-panel.js      ← SQL con resaltado + cláusula activa
│       └── connectors.js       ← dibuja líneas punteadas (SVG overlay)
├── assets/
│   ├── fonts/                  ← (opcional) fuentes locales
│   └── icons/
└── sql/
    └── hr_chile.sql            ← DDL + INSERTs (referencia / opcional)
```

---

## 8. El motor de pasos (step engine)

Es la pieza central. Convierte una **lección** en una secuencia de **frames** que la UI anima. **No** se parsea SQL: cada lección declara su consulta de forma estructurada y el motor sabe simularla.

### 8.1 Forma de una lección
```js
// js/lessons/lessons.js
export const leccionLeftJoin = {
  id: 'left-join-empleados-departamentos',
  titulo: 'LEFT JOIN',
  subtitulo: 'VISUALIZANDO SQL LEFT JOIN',
  // SQL para el panel (tokens con resaltado)
  sql: [
    { ln: 1, kw: 'SELECT DISTINCT', txt: ' nombre, apellido, nombre_departamento' },
    { ln: 2, kw: 'FROM',            txt: ' empleados e' },
    { ln: 3, kw: 'LEFT JOIN',       txt: ' departamentos d ON',  clausula: 'JOIN' },
    { ln: 4, kw: '',                txt: '  e.id_departamento = d.id_departamento' },
    { ln: 5, kw: 'WHERE',           txt: " d.nombre_departamento = 'Ventas'", clausula: 'WHERE' },
    { ln: 6, kw: 'ORDER BY',        txt: ' apellido;', clausula: 'ORDER' },
  ],
  // Configuración de la simulación
  tablaIzquierda: 'empleados',
  tablaDerecha:   'departamentos',
  tipoJoin:       'LEFT',                       // INNER | LEFT | RIGHT | FULL | CROSS | SELF
  metodoFisico:   'NESTED_LOOPS',              // NESTED_LOOPS | HASH | SORT_MERGE
  condicion: (e, d) => e.id_departamento === d.id_departamento,
  proyeccion: ['nombre', 'apellido', 'nombre_departamento'],
  where:    (fila) => fila.nombre_departamento === 'Ventas',
  distinct: true,
  orderBy:  (a, b) => a.apellido.localeCompare(b.apellido),
  narracion: 'El LEFT JOIN conserva TODAS las filas de empleados. ' +
             'Si un empleado no tiene departamento, sus columnas de la derecha quedan en NULL.',
};
```

### 8.2 Forma de un frame
```js
// Lo que produce el motor y consumen los componentes
{
  indice: 3,
  total: 9,
  descripcion: 'Comparando EMPLEADOS.id_departamento = DEPARTAMENTOS.id_departamento',
  clausulaActiva: 'JOIN',          // qué línea SQL resaltar
  izquierda: {
    filas: [...],
    resaltadas: [2],               // índices de filas iluminadas
  },
  derecha: {
    filas: [...],
    resaltadas: [0],
  },
  conectores: [                    // líneas punteadas a dibujar
    { desdeFila: 2, lado: 'izq', haciaFila: 0, ladoDestino: 'der', estado: 'match' },
  ],
  scratchpad: {
    columnas: ['nombre', 'apellido', 'nombre_departamento'],
    filas: [
      { datos: ['Florencia', 'Pérez', 'Ventas'], estado: 'match' },   // verde
      { datos: ['Joaquín', 'Fuentes', null],     estado: 'sin-pareja' } // naranjo
    ],
  },
}
```

### 8.3 Algoritmo de generación (pseudocódigo)
```js
// js/engine/sql-engine.js
export function generarPasos(leccion, db) {
  const A = db[leccion.tablaIzquierda];
  const B = db[leccion.tablaDerecha];
  const pasos = [];

  // PASO 0 — presentar tablas fuente
  pasos.push(framePresentacion(A, B, leccion));

  // PASOS 1..N — recorrer el join según el método físico
  if (leccion.metodoFisico === 'NESTED_LOOPS') {
    const matched = new Set();
    A.forEach((filaA, i) => {
      B.forEach((filaB, j) => {
        const hayMatch = leccion.condicion(filaA, filaB);
        pasos.push(frameComparacion(i, j, hayMatch, scratchpadActual));
        if (hayMatch) { matched.add(j); pushAlScratchpad(filaA, filaB); }
      });
      // LEFT/FULL: si filaA no tuvo pareja → fila con NULLs a la derecha
      if (esLeftOFull(leccion) && !tuvoPareja(filaA))
        pushAlScratchpad(filaA, FILA_NULL);
    });
    // RIGHT/FULL: filas de B no emparejadas → NULLs a la izquierda
    if (esRightOFull(leccion))
      B.forEach((filaB, j) => { if (!matched.has(j)) pushAlScratchpad(FILA_NULL, filaB); });
  }
  // ... HASH (build/probe) y SORT_MERGE análogos ...

  // PASO WHERE — marcar y eliminar filas que no cumplen
  if (leccion.where) pasos.push(frameWhere(scratchpadActual, leccion.where));
  // PASO GROUP BY / HAVING / DISTINCT / ORDER BY ...
  // PASO FINAL — resultado proyectado
  pasos.push(frameResultado(resultadoFinal, leccion.proyeccion));

  return pasos;
}
```

> Para **Hash Join** se generan frames de *build* (insertar B en el hash) y *probe* (buscar cada A). Para **Sort-Merge** se generan frames de *sort* y luego de *merge*. Así la "vista física" enseña algo distinto a la "vista lógica" aunque el resultado sea el mismo.

---

## 9. Modelo de datos: Schema HR Chileno

Adaptación del clásico **Oracle HR sample schema** a **español chileno**: nombres de tablas/columnas en español, y **datos realistas de Chile** (RUT, sueldos en CLP, ciudades, regiones, teléfonos `+56 9`).

### 9.1 Mapeo de nombres (Oracle HR → HR Chileno)

| Oracle HR (tabla) | HR Chileno | Oracle HR (columna) → HR Chileno |
|---|---|---|
| `REGIONS` | `REGIONES` | `region_id→id_region`, `region_name→nombre_region` |
| `COUNTRIES` | `PAISES` | `country_id→id_pais`, `country_name→nombre_pais`, `region_id→id_region` |
| `LOCATIONS` | `UBICACIONES` | `location_id→id_ubicacion`, `street_address→direccion`, `postal_code→codigo_postal`, `city→ciudad`, `state_province→region`, `country_id→id_pais` |
| `DEPARTMENTS` | `DEPARTAMENTOS` | `department_id→id_departamento`, `department_name→nombre_departamento`, `manager_id→id_gerente`, `location_id→id_ubicacion` |
| `JOBS` | `CARGOS` | `job_id→id_cargo`, `job_title→titulo_cargo`, `min_salary→sueldo_min`, `max_salary→sueldo_max` |
| `EMPLOYEES` | `EMPLEADOS` | `employee_id→id_empleado`, `first_name→nombre`, `last_name→apellido`, `email→email`, `phone_number→telefono`, `hire_date→fecha_contratacion`, `job_id→id_cargo`, `salary→sueldo`, `commission_pct→pct_comision`, `manager_id→id_jefe`, `department_id→id_departamento` **(+ `rut` nuevo)** |
| `JOB_HISTORY` | `HISTORIAL_CARGOS` | `employee_id→id_empleado`, `start_date→fecha_inicio`, `end_date→fecha_termino`, `job_id→id_cargo`, `department_id→id_departamento` |

### 9.2 Diagrama entidad-relación (resumen)
```
REGIONES 1──< PAISES 1──< UBICACIONES 1──< DEPARTAMENTOS 1──< EMPLEADOS
                                                  ▲                │  │
                                                  └── id_gerente ──┘  │ (jefe → self-join)
                                       CARGOS 1──< EMPLEADOS           │
                                       EMPLEADOS 1──< HISTORIAL_CARGOS ┘
```

### 9.3 DDL Oracle (referencia — `sql/hr_chile.sql`)
```sql
CREATE TABLE regiones (
  id_region      NUMBER       PRIMARY KEY,
  nombre_region  VARCHAR2(50) NOT NULL
);

CREATE TABLE paises (
  id_pais     CHAR(2)       PRIMARY KEY,
  nombre_pais VARCHAR2(60)  NOT NULL,
  id_region   NUMBER        REFERENCES regiones(id_region)
);

CREATE TABLE ubicaciones (
  id_ubicacion  NUMBER        PRIMARY KEY,
  direccion     VARCHAR2(120),
  codigo_postal VARCHAR2(12),
  ciudad        VARCHAR2(60)  NOT NULL,
  region        VARCHAR2(60),               -- región administrativa chilena
  id_pais       CHAR(2)       REFERENCES paises(id_pais)
);

CREATE TABLE departamentos (
  id_departamento   NUMBER        PRIMARY KEY,
  nombre_departamento VARCHAR2(60) NOT NULL,
  id_gerente        NUMBER,                  -- FK diferida a empleados
  id_ubicacion      NUMBER        REFERENCES ubicaciones(id_ubicacion)
);

CREATE TABLE cargos (
  id_cargo    VARCHAR2(10)  PRIMARY KEY,
  titulo_cargo VARCHAR2(60) NOT NULL,
  sueldo_min  NUMBER,
  sueldo_max  NUMBER
);

CREATE TABLE empleados (
  id_empleado     NUMBER        PRIMARY KEY,
  nombre          VARCHAR2(40)  NOT NULL,
  apellido        VARCHAR2(40)  NOT NULL,
  rut             VARCHAR2(12)  UNIQUE,       -- formato 12.345.678-9
  email           VARCHAR2(60),
  telefono        VARCHAR2(20),              -- formato +56 9 XXXX XXXX
  fecha_contratacion DATE       NOT NULL,
  id_cargo        VARCHAR2(10)  REFERENCES cargos(id_cargo),
  sueldo          NUMBER,                     -- en CLP
  pct_comision    NUMBER(3,2),
  id_jefe         NUMBER        REFERENCES empleados(id_empleado),
  id_departamento NUMBER        REFERENCES departamentos(id_departamento)
);

ALTER TABLE departamentos
  ADD CONSTRAINT fk_dep_gerente FOREIGN KEY (id_gerente) REFERENCES empleados(id_empleado);

CREATE TABLE historial_cargos (
  id_empleado     NUMBER       REFERENCES empleados(id_empleado),
  fecha_inicio    DATE         NOT NULL,
  fecha_termino   DATE,
  id_cargo        VARCHAR2(10) REFERENCES cargos(id_cargo),
  id_departamento NUMBER       REFERENCES departamentos(id_departamento),
  PRIMARY KEY (id_empleado, fecha_inicio)
);
```

### 9.4 Datos de ejemplo (chilenos, internamente consistentes)

Diseñados para que los JOINs tengan casos interesantes:
- El empleado **Joaquín Fuentes (111)** tiene `id_departamento = NULL` → aparece en `LEFT`/`FULL JOIN`.
- Los departamentos **Marketing, Operaciones, Logística, Atención al Cliente** no tienen empleados → aparecen en `RIGHT`/`FULL JOIN`.

```sql
-- REGIONES
INSERT INTO regiones VALUES (1, 'Sudamérica');
INSERT INTO regiones VALUES (2, 'Norteamérica');
INSERT INTO regiones VALUES (3, 'Europa');
INSERT INTO regiones VALUES (4, 'Asia-Pacífico');

-- PAISES
INSERT INTO paises VALUES ('CL', 'Chile', 1);
INSERT INTO paises VALUES ('AR', 'Argentina', 1);
INSERT INTO paises VALUES ('PE', 'Perú', 1);
INSERT INTO paises VALUES ('BR', 'Brasil', 1);
INSERT INTO paises VALUES ('US', 'Estados Unidos', 2);
INSERT INTO paises VALUES ('ES', 'España', 3);

-- UBICACIONES
INSERT INTO ubicaciones VALUES (1000, 'Av. Apoquindo 4500',        '7550000', 'Santiago',    'Región Metropolitana',   'CL');
INSERT INTO ubicaciones VALUES (1100, 'Calle Prat 856',           '2340000', 'Valparaíso',  'Región de Valparaíso',   'CL');
INSERT INTO ubicaciones VALUES (1200, 'Av. Colón 1234',           '4030000', 'Concepción',  'Región del Biobío',      'CL');
INSERT INTO ubicaciones VALUES (1300, 'Av. Angamos 0610',         '1240000', 'Antofagasta', 'Región de Antofagasta',  'CL');
INSERT INTO ubicaciones VALUES (1400, 'Av. Fco. de Aguirre 220',  '1700000', 'La Serena',   'Región de Coquimbo',     'CL');
INSERT INTO ubicaciones VALUES (1500, 'Av. Alemania 0671',        '4780000', 'Temuco',      'Región de La Araucanía', 'CL');

-- CARGOS
INSERT INTO cargos VALUES ('GG', 'Gerente General',           4000000, 7000000);
INSERT INTO cargos VALUES ('JF', 'Jefe de Finanzas',          2800000, 4500000);
INSERT INTO cargos VALUES ('AC', 'Analista Contable',          900000, 1600000);
INSERT INTO cargos VALUES ('ID', 'Ingeniero de Datos',        1600000, 3000000);
INSERT INTO cargos VALUES ('DS', 'Desarrollador de Software', 1400000, 2800000);
INSERT INTO cargos VALUES ('UX', 'Diseñador UX',              1100000, 2000000);
INSERT INTO cargos VALUES ('ST', 'Soporte TI',                 700000, 1300000);
INSERT INTO cargos VALUES ('EV', 'Ejecutivo de Ventas',        700000, 1500000);
INSERT INTO cargos VALUES ('RH', 'Encargado de RR.HH.',       1200000, 2200000);
INSERT INTO cargos VALUES ('AA', 'Asistente Administrativo',   550000,  950000);

-- DEPARTAMENTOS  (90 sin gerente; 60/70/80/90 sin empleados)
INSERT INTO departamentos VALUES (10, 'Gerencia General',     100,  1000);
INSERT INTO departamentos VALUES (20, 'Finanzas',             101,  1000);
INSERT INTO departamentos VALUES (30, 'Recursos Humanos',     102,  1000);
INSERT INTO departamentos VALUES (40, 'Tecnología',           103,  1000);
INSERT INTO departamentos VALUES (50, 'Ventas',               104,  1100);
INSERT INTO departamentos VALUES (60, 'Marketing',            NULL, 1000);
INSERT INTO departamentos VALUES (70, 'Operaciones',          NULL, 1200);
INSERT INTO departamentos VALUES (80, 'Logística',            NULL, 1300);
INSERT INTO departamentos VALUES (90, 'Atención al Cliente',  NULL, 1100);

-- EMPLEADOS
INSERT INTO empleados VALUES (100,'Sofía','González',   '12.345.678-9','sgonzalez','+56 9 8123 4567', DATE '2015-03-02','GG',6500000,NULL, NULL,10);
INSERT INTO empleados VALUES (101,'Mateo','Muñoz',      '13.456.789-0','mmunoz',   '+56 9 8234 5678', DATE '2016-06-15','JF',4200000,NULL, 100, 20);
INSERT INTO empleados VALUES (102,'Martina','Rojas',    '14.567.890-1','mrojas',   '+56 9 8345 6789', DATE '2017-01-20','RH',2000000,NULL, 100, 30);
INSERT INTO empleados VALUES (103,'Benjamín','Díaz',    '15.678.901-2','bdiaz',    '+56 9 8456 7890', DATE '2016-09-10','ID',2900000,NULL, 100, 40);
INSERT INTO empleados VALUES (104,'Florencia','Pérez',  '16.789.012-3','fperez',   '+56 9 8567 8901', DATE '2018-04-05','EV',1300000,0.10, 100, 50);
INSERT INTO empleados VALUES (105,'Vicente','Soto',     '17.890.123-4','vsoto',    '+56 9 8678 9012', DATE '2019-07-22','EV',1100000,0.08, 104, 50);
INSERT INTO empleados VALUES (106,'Isidora','Contreras','18.901.234-5','icontreras','+56 9 8789 0123',DATE '2020-02-17','DS',1900000,NULL, 103, 40);
INSERT INTO empleados VALUES (107,'Agustín','Silva',    '19.012.345-6','asilva',   '+56 9 8890 1234', DATE '2019-11-03','AC',1200000,NULL, 101, 20);
INSERT INTO empleados VALUES (108,'Catalina','Martínez','20.123.456-7','cmartinez','+56 9 8901 2345', DATE '2021-05-12','UX',1600000,NULL, 103, 40);
INSERT INTO empleados VALUES (109,'Tomás','Sepúlveda',  '21.234.567-8','tsepulveda','+56 9 9012 3456',DATE '2022-08-01','ST',1000000,NULL, 103, 40);
INSERT INTO empleados VALUES (110,'Javiera','Morales',  '22.345.678-9','jmorales', '+56 9 9123 4567', DATE '2023-03-20','AA', 800000,NULL, 102, 30);
INSERT INTO empleados VALUES (111,'Joaquín','Fuentes',  '23.456.789-0','jfuentes', '+56 9 9234 5678', DATE '2024-01-15','EV', 950000,0.05, 104, NULL); -- sin depto

-- HISTORIAL_CARGOS
INSERT INTO historial_cargos VALUES (101, DATE '2016-06-15', DATE '2018-12-31', 'AC', 20);
INSERT INTO historial_cargos VALUES (103, DATE '2016-09-10', DATE '2019-05-31', 'DS', 40);
INSERT INTO historial_cargos VALUES (104, DATE '2018-04-05', DATE '2020-03-31', 'AA', 50);
INSERT INTO historial_cargos VALUES (106, DATE '2020-02-17', DATE '2022-01-31', 'ST', 40);
```

### 9.5 Dataset para la app (`js/data/hr-cl.js`)
Misma información en JS, que es lo que consume el visor (no hay servidor):

```js
// js/data/hr-cl.js
export const HR_CL = {
  regiones: [
    { id_region: 1, nombre_region: 'Sudamérica' },
    { id_region: 2, nombre_region: 'Norteamérica' },
    { id_region: 3, nombre_region: 'Europa' },
    { id_region: 4, nombre_region: 'Asia-Pacífico' },
  ],

  paises: [
    { id_pais: 'CL', nombre_pais: 'Chile',          id_region: 1 },
    { id_pais: 'AR', nombre_pais: 'Argentina',      id_region: 1 },
    { id_pais: 'PE', nombre_pais: 'Perú',           id_region: 1 },
    { id_pais: 'BR', nombre_pais: 'Brasil',         id_region: 1 },
    { id_pais: 'US', nombre_pais: 'Estados Unidos', id_region: 2 },
    { id_pais: 'ES', nombre_pais: 'España',         id_region: 3 },
  ],

  ubicaciones: [
    { id_ubicacion: 1000, direccion: 'Av. Apoquindo 4500',       codigo_postal: '7550000', ciudad: 'Santiago',    region: 'Región Metropolitana',   id_pais: 'CL' },
    { id_ubicacion: 1100, direccion: 'Calle Prat 856',           codigo_postal: '2340000', ciudad: 'Valparaíso',  region: 'Región de Valparaíso',   id_pais: 'CL' },
    { id_ubicacion: 1200, direccion: 'Av. Colón 1234',           codigo_postal: '4030000', ciudad: 'Concepción',  region: 'Región del Biobío',      id_pais: 'CL' },
    { id_ubicacion: 1300, direccion: 'Av. Angamos 0610',         codigo_postal: '1240000', ciudad: 'Antofagasta', region: 'Región de Antofagasta',  id_pais: 'CL' },
    { id_ubicacion: 1400, direccion: 'Av. Fco. de Aguirre 220',  codigo_postal: '1700000', ciudad: 'La Serena',   region: 'Región de Coquimbo',     id_pais: 'CL' },
    { id_ubicacion: 1500, direccion: 'Av. Alemania 0671',        codigo_postal: '4780000', ciudad: 'Temuco',      region: 'Región de La Araucanía', id_pais: 'CL' },
  ],

  cargos: [
    { id_cargo: 'GG', titulo_cargo: 'Gerente General',           sueldo_min: 4000000, sueldo_max: 7000000 },
    { id_cargo: 'JF', titulo_cargo: 'Jefe de Finanzas',          sueldo_min: 2800000, sueldo_max: 4500000 },
    { id_cargo: 'AC', titulo_cargo: 'Analista Contable',         sueldo_min:  900000, sueldo_max: 1600000 },
    { id_cargo: 'ID', titulo_cargo: 'Ingeniero de Datos',        sueldo_min: 1600000, sueldo_max: 3000000 },
    { id_cargo: 'DS', titulo_cargo: 'Desarrollador de Software', sueldo_min: 1400000, sueldo_max: 2800000 },
    { id_cargo: 'UX', titulo_cargo: 'Diseñador UX',              sueldo_min: 1100000, sueldo_max: 2000000 },
    { id_cargo: 'ST', titulo_cargo: 'Soporte TI',                sueldo_min:  700000, sueldo_max: 1300000 },
    { id_cargo: 'EV', titulo_cargo: 'Ejecutivo de Ventas',       sueldo_min:  700000, sueldo_max: 1500000 },
    { id_cargo: 'RH', titulo_cargo: 'Encargado de RR.HH.',       sueldo_min: 1200000, sueldo_max: 2200000 },
    { id_cargo: 'AA', titulo_cargo: 'Asistente Administrativo',  sueldo_min:  550000, sueldo_max:  950000 },
  ],

  departamentos: [
    { id_departamento: 10, nombre_departamento: 'Gerencia General',    id_gerente: 100,  id_ubicacion: 1000 },
    { id_departamento: 20, nombre_departamento: 'Finanzas',            id_gerente: 101,  id_ubicacion: 1000 },
    { id_departamento: 30, nombre_departamento: 'Recursos Humanos',    id_gerente: 102,  id_ubicacion: 1000 },
    { id_departamento: 40, nombre_departamento: 'Tecnología',          id_gerente: 103,  id_ubicacion: 1000 },
    { id_departamento: 50, nombre_departamento: 'Ventas',              id_gerente: 104,  id_ubicacion: 1100 },
    { id_departamento: 60, nombre_departamento: 'Marketing',           id_gerente: null, id_ubicacion: 1000 },
    { id_departamento: 70, nombre_departamento: 'Operaciones',         id_gerente: null, id_ubicacion: 1200 },
    { id_departamento: 80, nombre_departamento: 'Logística',           id_gerente: null, id_ubicacion: 1300 },
    { id_departamento: 90, nombre_departamento: 'Atención al Cliente', id_gerente: null, id_ubicacion: 1100 },
  ],

  empleados: [
    { id_empleado:100, nombre:'Sofía',     apellido:'González',  rut:'12.345.678-9', email:'sgonzalez',  telefono:'+56 9 8123 4567', fecha_contratacion:'2015-03-02', id_cargo:'GG', sueldo:6500000, pct_comision:null, id_jefe:null, id_departamento:10 },
    { id_empleado:101, nombre:'Mateo',     apellido:'Muñoz',     rut:'13.456.789-0', email:'mmunoz',     telefono:'+56 9 8234 5678', fecha_contratacion:'2016-06-15', id_cargo:'JF', sueldo:4200000, pct_comision:null, id_jefe:100,  id_departamento:20 },
    { id_empleado:102, nombre:'Martina',   apellido:'Rojas',     rut:'14.567.890-1', email:'mrojas',     telefono:'+56 9 8345 6789', fecha_contratacion:'2017-01-20', id_cargo:'RH', sueldo:2000000, pct_comision:null, id_jefe:100,  id_departamento:30 },
    { id_empleado:103, nombre:'Benjamín',  apellido:'Díaz',      rut:'15.678.901-2', email:'bdiaz',      telefono:'+56 9 8456 7890', fecha_contratacion:'2016-09-10', id_cargo:'ID', sueldo:2900000, pct_comision:null, id_jefe:100,  id_departamento:40 },
    { id_empleado:104, nombre:'Florencia', apellido:'Pérez',     rut:'16.789.012-3', email:'fperez',     telefono:'+56 9 8567 8901', fecha_contratacion:'2018-04-05', id_cargo:'EV', sueldo:1300000, pct_comision:0.10, id_jefe:100,  id_departamento:50 },
    { id_empleado:105, nombre:'Vicente',   apellido:'Soto',      rut:'17.890.123-4', email:'vsoto',      telefono:'+56 9 8678 9012', fecha_contratacion:'2019-07-22', id_cargo:'EV', sueldo:1100000, pct_comision:0.08, id_jefe:104,  id_departamento:50 },
    { id_empleado:106, nombre:'Isidora',   apellido:'Contreras', rut:'18.901.234-5', email:'icontreras', telefono:'+56 9 8789 0123', fecha_contratacion:'2020-02-17', id_cargo:'DS', sueldo:1900000, pct_comision:null, id_jefe:103,  id_departamento:40 },
    { id_empleado:107, nombre:'Agustín',   apellido:'Silva',     rut:'19.012.345-6', email:'asilva',     telefono:'+56 9 8890 1234', fecha_contratacion:'2019-11-03', id_cargo:'AC', sueldo:1200000, pct_comision:null, id_jefe:101,  id_departamento:20 },
    { id_empleado:108, nombre:'Catalina',  apellido:'Martínez',  rut:'20.123.456-7', email:'cmartinez',  telefono:'+56 9 8901 2345', fecha_contratacion:'2021-05-12', id_cargo:'UX', sueldo:1600000, pct_comision:null, id_jefe:103,  id_departamento:40 },
    { id_empleado:109, nombre:'Tomás',     apellido:'Sepúlveda', rut:'21.234.567-8', email:'tsepulveda', telefono:'+56 9 9012 3456', fecha_contratacion:'2022-08-01', id_cargo:'ST', sueldo:1000000, pct_comision:null, id_jefe:103,  id_departamento:40 },
    { id_empleado:110, nombre:'Javiera',   apellido:'Morales',   rut:'22.345.678-9', email:'jmorales',   telefono:'+56 9 9123 4567', fecha_contratacion:'2023-03-20', id_cargo:'AA', sueldo: 800000, pct_comision:null, id_jefe:102,  id_departamento:30 },
    { id_empleado:111, nombre:'Joaquín',   apellido:'Fuentes',   rut:'23.456.789-0', email:'jfuentes',   telefono:'+56 9 9234 5678', fecha_contratacion:'2024-01-15', id_cargo:'EV', sueldo: 950000, pct_comision:0.05, id_jefe:104,  id_departamento:null }, // sin depto
  ],

  historial_cargos: [
    { id_empleado:101, fecha_inicio:'2016-06-15', fecha_termino:'2018-12-31', id_cargo:'AC', id_departamento:20 },
    { id_empleado:103, fecha_inicio:'2016-09-10', fecha_termino:'2019-05-31', id_cargo:'DS', id_departamento:40 },
    { id_empleado:104, fecha_inicio:'2018-04-05', fecha_termino:'2020-03-31', id_cargo:'AA', id_departamento:50 },
    { id_empleado:106, fecha_inicio:'2020-02-17', fecha_termino:'2022-01-31', id_cargo:'ST', id_departamento:40 },
  ],
};

// Helpers de formato chileno (para la UI)
export const formatoCLP = (n) =>
  n == null ? '—' : n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export const formatoFecha = (iso) =>
  iso == null ? '—' : new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
```

---

## 10. Diseño UI/UX mobile-first

### 10.1 Principios
- **Mobile-first real:** se diseña a 360–430 px de ancho; el desktop solo centra la "tarjeta" tipo teléfono.
- **Tema oscuro** con `data-bs-theme="dark"` (nativo de Bootstrap 5.3) + variables propias.
- **Una lección = una pantalla** (`100dvh`), navegación por scroll vertical con *scroll-snap* (como un reel).
- **Tipografía monoespaciada** para tablas y SQL (clave para que se "vea como código").
- **Animaciones suaves** (200–400 ms) que respetan `prefers-reduced-motion`.

### 10.2 Paleta de color (variables CSS)
```css
/* css/theme.css */
:root {
  --c4s-bg:        #0b0f17;  /* fondo casi negro azulado */
  --c4s-surface:   #121826;  /* tarjetas / paneles */
  --c4s-surface-2: #1b2436;  /* paneles internos (scratchpad) */
  --c4s-border:    #233047;
  --c4s-text:      #e6edf3;  /* texto principal */
  --c4s-muted:     #7d8aa0;  /* secundario / nº de línea */
  --c4s-accent:    #22d3ee;  /* cian — títulos, línea activa */
  --c4s-accent-2:  #2dd4bf;  /* teal — JOIN destacado */
  --c4s-ok:        #4ade80;  /* verde — match / 'delivered' */
  --c4s-warn:      #fb923c;  /* naranjo — pendiente / sin pareja */
  --c4s-link:      #ef4444;  /* rojo — conectores punteados */
  --c4s-kw:        #a78bfa;  /* violeta — keywords SQL */
  --c4s-kw-2:      #f472b6;  /* rosado — DISTINCT */
  --c4s-str:       #4ade80;  /* verde — strings SQL */
  --c4s-num:       #fbbf24;  /* ámbar — números/CLP */
}
```

### 10.3 Layout (estructura responsive con Bootstrap)
- Contenedor raíz `.reels` con `scroll-snap-type: y mandatory; overflow-y: auto; height: 100dvh`.
- Cada `.reel` ocupa `height: 100dvh; scroll-snap-align: start` y por dentro usa el **grid de Bootstrap**: las dos tablas en `row > col-6`, paneles en `card`.
- Barra de progreso superior (segmentos por paso) tipo *stories*.
- Controles inferiores: anterior / play-pausa / siguiente, y selector de método físico (Nested Loops / Hash / Sort-Merge).

### 10.4 Accesibilidad
- Contraste AA en texto sobre fondos oscuros.
- Navegación por teclado (←/→ pasos, ↑/↓ lecciones, espacio play/pausa).
- `aria-live="polite"` en la zona de narración para lectores de pantalla.
- Respetar `prefers-reduced-motion`: desactivar conectores animados y transiciones.
- Áreas táctiles ≥ 44×44 px.

### 10.5 Gestos
- *Swipe* vertical → cambia de lección.
- *Tap* en mitad derecha → siguiente paso; mitad izquierda → paso anterior (como stories).
- *Tap* largo → pausa autoplay.

---

## 11. Especificación de componentes

Cada componente exporta una función `render(contenedor, frame, opts)` y no guarda estado propio (el estado vive en `app.js`).

| Componente | Responsabilidad | Entrada | Salida |
|---|---|---|---|
| `reel.js` | Arma el esqueleto de una lección (título, slots para tablas/scratchpad/SQL, controles) | `leccion` | nodo `.reel` |
| `table-view.js` | Renderiza una tabla de datos con cabecera y filas; aplica resaltado | `{ nombre, columnas, filas, resaltadas }` | nodo `.tabla` |
| `scratchpad.js` | Renderiza el resultado intermedio con estados (match/sin-pareja/filtrado) | `frame.scratchpad` | nodo `.scratchpad` |
| `query-panel.js` | Pinta el SQL con nº de línea, resaltado de sintaxis y cláusula activa | `{ sql, clausulaActiva }` | nodo `.sql` |
| `connectors.js` | Dibuja líneas punteadas entre filas usando un overlay SVG; recalcula en resize/scroll | `frame.conectores`, refs DOM | actualiza `<svg>` |
| `app.js` | Carga lecciones, genera pasos, controla navegación/autoplay, orquesta render | — | — |

### Notas técnicas de `connectors.js`
- Un único `<svg class="overlay">` posicionado `absolute` sobre el `.reel`.
- Para cada conector, calcula los puntos con `elemento.getBoundingClientRect()` relativos al SVG y dibuja un `<path>` con `stroke-dasharray` (punteado) y `stroke: var(--c4s-link)`.
- Animar el "trazo" con `stroke-dashoffset` (Web Animations API).
- Recalcular en `resize`, al cambiar de paso y en `scroll` del contenedor (debounce con `requestAnimationFrame`).

---

## 12. Catálogo de lecciones (reels)

Orden pedagógico sugerido. Cada una es un objeto en `lessons.js`.

| # | Lección | Concepto | Tablas HR |
|---|---|---|---|
| 1 | **SELECT + FROM** | Proyección básica y orden de ejecución | `empleados` |
| 2 | **WHERE** | Filtrado de filas (antes que SELECT) | `empleados` |
| 3 | **INNER JOIN** | Solo coincidencias | `empleados` × `departamentos` |
| 4 | **LEFT JOIN** | Conserva izquierda (Joaquín sin depto) | `empleados` × `departamentos` |
| 5 | **RIGHT JOIN** | Conserva derecha (deptos sin empleados) | `empleados` × `departamentos` |
| 6 | **FULL JOIN** | Ambos lados | `empleados` × `departamentos` |
| 7 | **CROSS JOIN** | Producto cartesiano | `empleados` × `cargos` |
| 8 | **SELF JOIN** | Empleado ↔ jefe | `empleados` × `empleados` |
| 9 | **GROUP BY + agregación** | `COUNT`, `AVG(sueldo)` por departamento | `empleados` |
| 10 | **HAVING** | Filtrar grupos (deptos con > 2 empleados) | `empleados` |
| 11 | **ORDER BY + DISTINCT** | Orden y deduplicación | `empleados` |
| 12 | **NULL en joins** | Por qué `WHERE` rompe el outer join | `empleados` × `departamentos` |
| 13 | **Vista física: Hash Join** | build/probe en el área PGA | `empleados` × `departamentos` |
| 14 | **Vista física: Sort-Merge** | sort + merge | `empleados` × `departamentos` |

> Cada lección reutiliza el **schema HR chileno**, así el usuario aprende JOINs *con datos que entiende* (Sofía González, depto de Ventas en Valparaíso, sueldos en CLP).

---

## 13. Snippets de implementación clave

### 13.1 `index.html` (esqueleto)
```html
<!doctype html>
<html lang="es-CL" data-bs-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Code4SQL — Visor interno de Oracle SQL</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="css/theme.css" rel="stylesheet">
  <link href="css/styles.css" rel="stylesheet">
</head>
<body>
  <!-- Barra de progreso tipo stories -->
  <div id="progreso" class="progreso" aria-hidden="true"></div>

  <!-- Contenedor de reels (scroll-snap vertical) -->
  <main id="reels" class="reels"></main>

  <!-- Controles -->
  <nav class="controles">
    <button id="prev" class="btn btn-icon" aria-label="Paso anterior"><i class="bi bi-chevron-left"></i></button>
    <button id="play" class="btn btn-icon" aria-label="Reproducir"><i class="bi bi-play-fill"></i></button>
    <button id="next" class="btn btn-icon" aria-label="Paso siguiente"><i class="bi bi-chevron-right"></i></button>
  </nav>

  <script type="module" src="js/app.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
</body>
</html>
```

### 13.2 `css/styles.css` (núcleo del look & feel)
```css
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--c4s-bg);
  color: var(--c4s-text);
  font-family: 'Inter', system-ui, sans-serif;
}

/* --- Contenedor tipo reel --- */
.reels { height: 100dvh; overflow-y: auto; scroll-snap-type: y mandatory; }
.reel {
  height: 100dvh; scroll-snap-align: start;
  display: flex; flex-direction: column; gap: .75rem;
  padding: 1rem; max-width: 480px; margin-inline: auto;
}

/* --- Títulos --- */
.reel__subtitulo { color: var(--c4s-accent-2); font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; }
.reel__subtitulo::before { content: "● "; color: var(--c4s-ok); }
.reel__titulo {
  color: var(--c4s-accent); font-weight: 800; font-size: 2rem; letter-spacing: .04em;
  text-shadow: 0 0 18px rgba(34,211,238,.45);
}

/* --- Tablas de datos (mono) --- */
.tabla { background: var(--c4s-surface); border: 1px solid var(--c4s-border); border-radius: .75rem; overflow: hidden; }
.tabla__cabecera { font: .68rem/1 'JetBrains Mono', monospace; color: var(--c4s-muted); padding: .5rem .75rem; text-transform: uppercase; letter-spacing: .1em; }
.tabla table { width: 100%; font: .8rem/1.6 'JetBrains Mono', monospace; border-collapse: collapse; }
.tabla td { padding: .15rem .75rem; }
.tabla tr.is-resaltada { background: rgba(34,211,238,.16); box-shadow: inset 2px 0 0 var(--c4s-accent); }
.val--ok   { color: var(--c4s-ok); }
.val--warn { color: var(--c4s-warn); }
.val--null { color: var(--c4s-muted); font-style: italic; }

/* --- Scratchpad (resultado intermedio) --- */
.scratchpad { background: var(--c4s-surface-2); border: 1px dashed var(--c4s-border); border-radius: .75rem; padding: .75rem; }
.scratchpad__titulo { font: .66rem 'JetBrains Mono', monospace; color: var(--c4s-text); letter-spacing: .14em; margin-bottom: .5rem; }
.scratchpad__fila--match     { color: var(--c4s-ok); }
.scratchpad__fila--sinpareja { color: var(--c4s-warn); }
.scratchpad__fila--filtrada  { color: var(--c4s-muted); text-decoration: line-through; }

/* --- Panel SQL --- */
.sql { background: var(--c4s-surface); border-radius: .75rem; padding: .75rem; font: .82rem/1.7 'JetBrains Mono', monospace; }
.sql__linea { display: grid; grid-template-columns: 1.5rem 1fr; gap: .5rem; padding: 0 .25rem; border-left: 3px solid transparent; }
.sql__linea.is-activa { background: rgba(45,212,191,.12); border-left-color: var(--c4s-accent-2); }
.sql__num { color: var(--c4s-muted); text-align: right; }
.tok-kw  { color: var(--c4s-kw); }     .tok-kw2 { color: var(--c4s-kw-2); }
.tok-str { color: var(--c4s-str); }    .tok-num { color: var(--c4s-num); }

/* --- Overlay de conectores --- */
.reel { position: relative; }
.overlay { position: absolute; inset: 0; pointer-events: none; z-index: 5; }
.overlay path { fill: none; stroke: var(--c4s-link); stroke-width: 2; stroke-dasharray: 5 5; }

/* --- Controles --- */
.controles { position: fixed; bottom: env(safe-area-inset-bottom, 1rem); left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; }
.btn-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--c4s-surface-2); color: var(--c4s-text); border: 1px solid var(--c4s-border); }

@media (prefers-reduced-motion: reduce) {
  .overlay path { stroke-dasharray: none; }
  * { animation: none !important; transition: none !important; }
}
```

### 13.3 `js/engine/joins.js` (algoritmos lógicos)
```js
// Devuelve el resultado lógico (sin animación) — útil para tests y para el frame final.
const FILA_NULL = (cols) => Object.fromEntries(cols.map(c => [c, null]));

export function join(A, B, cond, tipo, colsB) {
  const out = [];
  const usadasB = new Set();
  for (const a of A) {
    let emparejo = false;
    B.forEach((b, j) => {
      if (cond(a, b)) { out.push({ ...a, ...b }); usadasB.add(j); emparejo = true; }
    });
    if (!emparejo && (tipo === 'LEFT' || tipo === 'FULL'))
      out.push({ ...a, ...FILA_NULL(colsB) });
  }
  if (tipo === 'RIGHT' || tipo === 'FULL') {
    B.forEach((b, j) => { if (!usadasB.has(j)) out.push({ ...FILA_NULL(Object.keys(A[0] ?? {})), ...b }); });
  }
  if (tipo === 'CROSS') return A.flatMap(a => B.map(b => ({ ...a, ...b })));
  return out;
}
```

### 13.4 `js/app.js` (controlador, resumido)
```js
import { HR_CL } from './data/hr-cl.js';
import { LECCIONES } from './lessons/lessons.js';
import { generarPasos } from './engine/sql-engine.js';
import { renderReel } from './components/reel.js';
import { pintarFrame } from './components/index.js';

let leccionIdx = 0, pasoIdx = 0, pasos = [], autoplay = null;

function cargarLeccion(i) {
  const leccion = LECCIONES[i];
  pasos = generarPasos(leccion, HR_CL);
  pasoIdx = 0;
  renderReel(document.getElementById('reels'), leccion);
  pintarFrame(pasos[pasoIdx]);
  actualizarProgreso();
}

function siguiente() { if (pasoIdx < pasos.length - 1) { pasoIdx++; pintarFrame(pasos[pasoIdx]); actualizarProgreso(); } }
function anterior()  { if (pasoIdx > 0)               { pasoIdx--; pintarFrame(pasos[pasoIdx]); actualizarProgreso(); } }

document.getElementById('next').onclick = siguiente;
document.getElementById('prev').onclick = anterior;
document.getElementById('play').onclick = () => {
  if (autoplay) { clearInterval(autoplay); autoplay = null; }
  else autoplay = setInterval(() => (pasoIdx < pasos.length - 1 ? siguiente() : clearInterval(autoplay)), 1600);
};
addEventListener('keydown', (e) => ({ ArrowRight: siguiente, ArrowLeft: anterior }[e.key]?.()));

cargarLeccion(leccionIdx);
```

---

## 14. Roadmap de construcción

### Fase 0 — Cimientos (½ día)
- [ ] `index.html` + CDNs Bootstrap 5.3.x + Bootstrap Icons.
- [ ] `theme.css` (variables) y `styles.css` (esqueleto reel + scroll-snap).
- [ ] `hr-cl.js` con el dataset completo (sección 9.5).

### Fase 1 — Render estático (1 día)
- [ ] `table-view.js`: pintar `empleados` y `departamentos`.
- [ ] `query-panel.js`: SQL con nº de línea + resaltado.
- [ ] `scratchpad.js`: tabla de resultado intermedio.
- [ ] Maquetar un reel completo **sin animación** (frame fijo).

### Fase 2 — Motor de pasos (1–2 días)
- [ ] `joins.js`: algoritmos lógicos + tests manuales contra el dataset.
- [ ] `sql-engine.js`: `generarPasos()` para `INNER` y `LEFT`.
- [ ] `app.js`: navegación anterior/siguiente + barra de progreso.

### Fase 3 — Animación y conectores (1 día)
- [ ] `connectors.js`: overlay SVG + líneas punteadas animadas.
- [ ] Transiciones de resaltado y autoplay.
- [ ] Gestos táctiles (swipe / tap zones).

### Fase 4 — Catálogo completo (1–2 días)
- [ ] `RIGHT`, `FULL`, `CROSS`, `SELF`.
- [ ] `GROUP BY` / `HAVING` / `ORDER BY` / `DISTINCT`.
- [ ] Vista física: `HASH` y `SORT_MERGE`.

### Fase 5 — Pulido (½–1 día)
- [ ] Accesibilidad (teclado, `aria-live`, `prefers-reduced-motion`).
- [ ] Auditoría Lighthouse móvil.
- [ ] Deploy en GitHub Pages / Netlify.

---

## 15. Mejoras futuras
- **Editor SQL libre** con un mini-parser (p. ej. tokenizar y mapear a la estructura de lección) o integrando un motor como **sql.js** (SQLite en WebAssembly) para ejecutar consultas reales sobre el dataset.
- **Plan de ejecución estilo Oracle** (`EXPLAIN PLAN`) renderizado como árbol.
- **Modo quiz**: "¿qué filas devuelve este JOIN?" con feedback.
- **Exportar el reel como imagen/video** para compartir (canvas → PNG).
- **Más esquemas**: ventas, inventario, etc.
- **i18n**: alternar es-CL / en, manteniendo es-CL por defecto.
- **PWA**: instalable y 100% offline (service worker + manifest).

---

## 16. Glosario Oracle
| Término | Significado |
|---|---|
| **Row source** | Conjunto de filas que produce un paso del plan (una tabla, un índice, un join). |
| **PGA / work area** | Memoria privada de un proceso servidor donde Oracle hace sorts y hash joins (nuestro "scratchpad"). |
| **Nested Loops** | Join por doble bucle; bueno con pocas filas o índice en la tabla interna. |
| **Hash Join** | Construye tabla hash de la tabla menor y la sondea con la mayor; para igualdades y tablas grandes. |
| **Sort-Merge Join** | Ordena ambas entradas y las fusiona; útil para rangos o datos ya ordenados. |
| **Optimizer (CBO)** | Optimizador basado en costos que elige el plan/método de join. |
| **Cardinalidad** | Número estimado de filas; influye en el método de join elegido. |
| **NULL** | Ausencia de valor; no es igual a nada (ni a otro NULL) en comparaciones. |

---

## 17. Checklist de construcción
- [ ] Carpeta del proyecto creada según sección 7.
- [ ] CDNs de Bootstrap 5.3.x y Bootstrap Icons enlazados.
- [ ] `hr-cl.js` con schema HR chileno y helpers (CLP, fecha es-CL).
- [ ] Tema oscuro con variables CSS aplicado.
- [ ] Reel con scroll-snap y `100dvh` funcionando en móvil.
- [ ] Componentes de tabla, SQL y scratchpad renderizando un frame.
- [ ] Motor `generarPasos()` para INNER y LEFT.
- [ ] Conectores SVG animados.
- [ ] Catálogo de lecciones (12.x) implementado.
- [ ] Vista física (Hash / Sort-Merge) disponible.
- [ ] Accesibilidad y `prefers-reduced-motion`.
- [ ] Lighthouse móvil: Performance ≥ 90, Accessibility ≥ 90.
- [ ] Deploy publicado.

---

*Code4SQL — Hecho para enseñar lo que pasa "bajo el capó" de Oracle SQL, con datos chilenos. 🇨🇱*
