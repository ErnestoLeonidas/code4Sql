# Code4SQL — Roadmap (v0.1.0 → v1.0.0)

> Plan de releases del **Visor del Funcionamiento Interno de Oracle SQL**.
> Documento compañero de [`code4sql.md`](./code4sql.md): aquí se ordena *en qué versión* se construye cada cosa.
> Cada versión es un **incremento demostrable** (se puede abrir en el navegador y mostrar).

---

## Convención de versionado (SemVer)

Usamos **Versionado Semántico** `MAJOR.MINOR.PATCH`:

- **`0.x.0` (pre-1.0):** hitos de desarrollo. Cada *minor* agrega una capacidad nueva y deja un build navegable. La API interna (forma de una *lección*, de un *frame*) puede cambiar.
- **`PATCH` (`0.x.y`):** corrección de bugs y ajustes menores sin features nuevas (p. ej. `v0.9.1`).
- **`1.0.0`:** producto completo, pulido, accesible y **publicado**. A partir de aquí la forma de una *lección* se considera estable.

**Regla de oro:** ninguna versión se "cierra" hasta cumplir su *Definición de Hecho* (DoD). Si un build queda a medias, se etiqueta como `-dev`; si está en pruebas, como `-rc`.

---

## Leyenda de estado

| Símbolo | Estado |
|:---:|---|
| ⬜ | Pendiente |
| 🟦 | En progreso |
| ✅ | Completado |
| 🧊 | Congelado / feature freeze |

---

## Resumen de hitos

| Versión | Nombre | Objetivo en una línea | Esfuerzo | Fase en `code4sql.md` | Estado |
|---|---|---|:---:|:---:|:---:|
| **v0.1.0** | Cimientos | Esqueleto navegable + dataset HR chileno cargado | ½ día | Fase 0 | ✅ |
| **v0.2.0** | Render estático | Un reel completo armado (frame fijo) | 1 día | Fase 1 | ✅ |
| **v0.3.0** | Motor de pasos | INNER + LEFT animados paso a paso | 1½ día | Fase 2 | ✅ |
| **v0.4.0** | Conectores | Líneas punteadas SVG + autoplay | 1 día | Fase 3 | ✅ |
| **v0.5.0** | Catálogo de JOINs | RIGHT, FULL, CROSS, SELF | 1 día | Fase 4 | ✅ |
| **v0.6.0** | Cláusulas | WHERE, GROUP BY, HAVING, ORDER BY, DISTINCT, NULL | 1½ día | Fase 4 | 🟦 |
| **v0.7.0** | Vista interna Oracle | Métodos físicos: Hash, Sort-Merge, Nested Loops | 1½ día | Fase 4 | ⬜ |
| **v0.8.0** | UX mobile y narrativa | Gestos, stories, narración, UI social | 1 día | Fase 5 | ⬜ |
| **v0.9.0** | A11y + rendimiento + i18n | Teclado, ARIA, Lighthouse ≥ 90 | 1 día | Fase 5 | ⬜ |
| **v0.9.x-rc** | Release Candidate | QA cross-device + congelación | ½–1 día | Fase 5 | ⬜ |
| **v1.0.0** | Lanzamiento | PWA offline + deploy público + docs | 1 día | Fase 5 | ⬜ |

**Esfuerzo total estimado:** ~10–12 días de desarrollo enfocado.

> **Avance al 2026-06-06:** v0.1.0 → v0.5.0 implementadas y verificadas (7 lecciones probadas en Node: INNER=3, LEFT=4, RIGHT=4, FULL=5, CROSS=6, SELF=3, LEFT+WHERE=2). **v0.6.0 en curso**: lección WHERE (rompe el outer join) lista; faltan GROUP BY, HAVING, ORDER BY y DISTINCT. App ejecutándose localmente en `http://localhost:8000`.

### Línea de tiempo

```
v0.1.0 ──► v0.2.0 ──► v0.3.0 ──► v0.4.0 ──► v0.5.0 ──► v0.6.0 ──► v0.7.0 ──► v0.8.0 ──► v0.9.0 ──► v0.9.x-rc ──► v1.0.0
Cimientos  Render     Motor      Conect.    JOINs      Cláusulas  Vista      UX         A11y       QA            🚀
           estático   (IN/LEFT)             completos             interna    mobile     Perf       freeze
```

---

## v0.1.0 — Cimientos

**Objetivo:** dejar el proyecto en pie: estructura, dependencias y datos cargados, con una pantalla *reel* vacía que ya hace scroll-snap.

### Alcance
- ⬜ Estructura de carpetas según sección 7 de `code4sql.md`.
- ⬜ `index.html` con `data-bs-theme="dark"`, viewport `viewport-fit=cover`, CDNs de **Bootstrap 5.3.x** y **Bootstrap Icons**.
- ⬜ `css/theme.css` con las variables de paleta (sección 10.2).
- ⬜ `css/styles.css` con reset + contenedor `.reels` (scroll-snap, `100dvh`).
- ⬜ `js/data/hr-cl.js` **completo** (schema HR chileno, sección 9.5) + helpers `formatoCLP` y `formatoFecha`.
- ⬜ `js/app.js` mínimo que importa `HR_CL` y pinta un `.reel` de prueba con un título.

### Archivos tocados
`index.html`, `css/theme.css`, `css/styles.css`, `js/data/hr-cl.js`, `js/app.js`

### Definición de Hecho
- Abre en navegador de escritorio y móvil sin errores de consola.
- El `import` de `HR_CL` funciona (módulos ES) y las claves foráneas del dataset son consistentes.
- El scroll vertical hace *snap* entre pantallas a `100dvh`.

---

## v0.2.0 — Render estático

**Objetivo:** ver **un reel completo** idéntico a las imágenes de referencia, pero con datos fijos (sin animación todavía).

### Alcance
- ⬜ `js/components/table-view.js`: renderiza una tabla (cabecera mono + filas) y aplica resaltado por índices.
- ⬜ `js/components/query-panel.js`: SQL con número de línea, resaltado de sintaxis (`tok-kw`, `tok-str`, `tok-num`) y cláusula activa.
- ⬜ `js/components/scratchpad.js`: tabla de resultado intermedio con estados `match` / `sin-pareja` / `filtrada`.
- ⬜ `js/components/reel.js`: esqueleto del reel (subtítulo con dot, título con glow, slots para tablas/scratchpad/SQL).
- ⬜ Maquetar el reel de **LEFT JOIN** con un *frame* hardcodeado usando `empleados` × `departamentos`.

### Archivos tocados
`js/components/{reel,table-view,query-panel,scratchpad}.js`, `css/styles.css`

### Definición de Hecho
- El reel se ve fiel a la referencia visual (tablas lado a lado, scratchpad, SQL con cláusula activa).
- Responsive y legible entre 360–430 px de ancho.
- Sueldos en formato CLP y fechas en `es-CL`.

---

## v0.3.0 — Motor de pasos (INNER + LEFT)

**Objetivo:** primera **animación paso a paso real** generada por el motor, no hardcodeada.

### Alcance
- ⬜ `js/engine/joins.js`: algoritmos lógicos `INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS` (resultado, sin animación).
- ⬜ `js/engine/sql-engine.js`: `generarPasos(leccion, db)` para método `NESTED_LOOPS`, casos `INNER` y `LEFT`.
- ⬜ `js/lessons/lessons.js`: lecciones **#3 (INNER JOIN)** y **#4 (LEFT JOIN)** del catálogo.
- ⬜ `js/components/index.js`: `pintarFrame(frame)` que orquesta los componentes.
- ⬜ `js/app.js`: estado `pasoActual`, navegación anterior/siguiente, barra de progreso tipo *stories*.
- ⬜ Atajos de teclado ←/→ para navegar pasos.

### Archivos tocados
`js/engine/{joins,sql-engine}.js`, `js/lessons/lessons.js`, `js/components/index.js`, `js/app.js`

### Definición de Hecho
- Los botones y las flechas recorren los pasos; el scratchpad se llena progresivamente.
- El resultado final coincide con la verificación manual sobre el dataset (Joaquín sin depto aparece con `NULL` a la derecha en LEFT).
- La barra de progreso refleja `pasoActual / total`.

---

## v0.4.0 — Conectores y animación

**Objetivo:** dar vida al lenguaje visual de las imágenes (la línea roja punteada y los resaltados que se mueven).

### Alcance
- ⬜ `js/components/connectors.js`: overlay `<svg>`, líneas punteadas (`stroke-dasharray`), animación con `stroke-dashoffset` (Web Animations API).
- ⬜ Recalcular endpoints con `getBoundingClientRect()` en `resize`, cambio de paso y `scroll` (debounce con `requestAnimationFrame`).
- ⬜ Transiciones suaves al resaltar filas y al cambiar la cláusula SQL activa.
- ⬜ **Autoplay**: botón play/pausa con intervalo configurable (~1.6 s/paso).
- ⬜ Respetar `prefers-reduced-motion` (sin trazos animados ni transiciones).

### Archivos tocados
`js/components/connectors.js`, `js/app.js`, `css/styles.css`

### Definición de Hecho
- En LEFT JOIN se ve la línea conectando la fila evaluada con su match.
- El autoplay recorre la lección completa y se detiene al final.
- Sin *jank* perceptible en móvil; con `reduce-motion` la app sigue siendo usable.

---

## v0.5.0 — Catálogo de JOINs completo

**Objetivo:** cubrir **todos los tipos de JOIN** y aprovechar los casos de borde del dataset.

### Alcance
- ⬜ `sql-engine` + `lessons`: **RIGHT**, **FULL**, **CROSS**, **SELF**.
- ⬜ RIGHT/FULL muestran los **departamentos sin empleados** (Marketing, Operaciones, Logística, Atención al Cliente).
- ⬜ SELF JOIN **empleado ↔ jefe** (alias `e` / `j` sobre `empleados`).
- ⬜ CROSS JOIN `empleados` × `cargos` con advertencia visual del tamaño del producto cartesiano.
- ⬜ Navegación vertical entre lecciones (swipe / scroll-snap) y listado de lecciones.

### Archivos tocados
`js/engine/sql-engine.js`, `js/lessons/lessons.js`, `js/app.js`

### Definición de Hecho
- Las 6 variantes (`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`, `SELF`) producen el resultado correcto y se distinguen visualmente.
- El *swipe* vertical cambia de lección y reinicia su animación.

---

## v0.6.0 — Cláusulas y agregación

**Objetivo:** ir más allá del JOIN: filtrado, agrupación, orden y el insight estrella sobre `NULL`.

### Alcance
- ⬜ Lecciones: **SELECT+FROM**, **WHERE**, **GROUP BY** (`COUNT`, `AVG(sueldo)`), **HAVING**, **ORDER BY + DISTINCT**.
- ⬜ *Frames* especiales: colapsar grupos (GROUP BY) y reordenar filas (ORDER BY).
- ⬜ Lección **"NULL en joins"**: demostrar que un `WHERE` sobre la tabla derecha convierte un `LEFT JOIN` en `INNER JOIN`.
- ⬜ Narración que refuerza el **orden lógico de procesamiento** (sección 4.1).

### Archivos tocados
`js/engine/sql-engine.js`, `js/lessons/lessons.js`, `js/components/scratchpad.js`

### Definición de Hecho
- Catálogo base de **12 lecciones** completo y correcto.
- La lección de `NULL` muestra claramente el colapso LEFT→INNER.
- Agregaciones con CLP correctamente formateadas.

---

## v0.7.0 — Vista interna de Oracle (métodos físicos)

**Objetivo:** el **diferenciador del producto** — mostrar *cómo* Oracle ejecuta el join por dentro, no solo qué devuelve.

### Alcance
- ⬜ Toggle **Vista lógica / Vista física**.
- ⬜ **Hash Join**: *frames* de fase *build* (armar tabla hash de la tabla menor) y fase *probe* (sondear con la mayor).
- ⬜ **Sort-Merge Join**: *frames* de *sort* de ambas entradas + *merge* en paralelo.
- ⬜ **Nested Loops** explícito como tercera opción (doble bucle).
- ⬜ Narración que mapea el scratchpad al **work area de la PGA** (sección 4.3 y glosario).

### Archivos tocados
`js/engine/sql-engine.js`, `js/engine/joins.js`, `js/lessons/lessons.js`, `js/app.js`

### Definición de Hecho
- La misma consulta, con el mismo resultado, ofrece **3 animaciones internas distintas**.
- El usuario distingue las fases *build* y *probe* del hash join.

---

## v0.8.0 — UX mobile y narrativa

**Objetivo:** que la experiencia **se sienta un reel**, navegable solo con el pulgar.

### Alcance
- ⬜ Gestos: *tap-zones* (mitad izq/der = paso ∓), *swipe* vertical = lección, *long-press* = pausa.
- ⬜ Barra de progreso tipo *stories* (un segmento por paso).
- ⬜ Zona de **narración** por lección (`aria-live`) + caption estilo red social.
- ⬜ UI social **decorativa** (like / comentario / compartir / guardar) coherente con la referencia.
- ⬜ Microinteracciones y pulido visual (glow del título, espaciados, tipografía mono).

### Archivos tocados
`js/app.js`, `js/components/reel.js`, `css/styles.css`

### Definición de Hecho
- Toda la navegación es posible con una sola mano en móvil.
- El look & feel es indistinguible en espíritu de las imágenes de referencia.

---

## v0.9.0 — Accesibilidad, rendimiento e i18n base

**Objetivo:** calidad de producto: que sea rápido, accesible y fácil de traducir.

### Alcance
- ⬜ Teclado completo: ←/→ pasos, ↑/↓ lecciones, espacio = play/pausa, foco visible.
- ⬜ ARIA: `aria-live="polite"` en narración, roles y `aria-label` en controles, contraste AA.
- ⬜ `prefers-reduced-motion` aplicado en toda la app.
- ⬜ Rendimiento: carga diferida de lecciones, evitar *reflows* costosos, fuentes con `display=swap`.
- ⬜ i18n base: strings centralizados en un módulo, `es-CL` por defecto.
- ⬜ Auditoría **Lighthouse móvil**.

### Archivos tocados
`js/app.js`, `js/components/*`, `css/styles.css`, `js/i18n.js`

### Definición de Hecho
- **Lighthouse móvil: Performance ≥ 90 y Accessibility ≥ 90.**
- App usable solo con teclado y con lector de pantalla.

---

## v0.9.x-rc — Release Candidate (endurecimiento)

**Objetivo:** congelar features y dejar el build a prueba de balas en dispositivos reales.

### Alcance
- 🧊 **Feature freeze**: solo correcciones, nada de features nuevas.
- ⬜ Pruebas en **iOS Safari**, **Chrome Android** y escritorio.
- ⬜ Corrección de bugs en *patch releases* (`v0.9.1`, `v0.9.2`, …).
- ⬜ Verificación de datos del schema, textos y formatos (CLP, RUT, fechas).
- ⬜ Manejo de errores y estados vacíos.
- ⬜ Checklist de QA cross-device.

### Definición de Hecho
- **Cero bugs bloqueantes.**
- Checklist de QA en verde en al menos 3 dispositivos/navegadores distintos.

---

## v1.0.0 — Lanzamiento 🚀

**Objetivo:** producto **completo, pulido y publicado**, instalable y offline.

### Alcance
- ⬜ Catálogo **completo de 14 lecciones** (secciones 12.x de `code4sql.md`), incluida la vista física.
- ⬜ **PWA**: `manifest.webmanifest` + *service worker* → instalable y 100% offline.
- ⬜ `README.md` con descripción, captura y modo de uso; licencia; `CHANGELOG.md`.
- ⬜ **Deploy** en GitHub Pages / Netlify.
- ⬜ Favicon, *meta* Open Graph (para compartir) y *screenshot*.
- ⬜ Etiqueta de versión `v1.0.0` en git.

### Archivos tocados
`manifest.webmanifest`, `sw.js`, `README.md`, `CHANGELOG.md`, `index.html`

### Definición de Hecho
- Instalable como app y funcional **sin conexión**.
- Desplegado en una URL pública y accesible.
- Documentación lista; `CHANGELOG.md` refleja v0.1.0 → v1.0.0.

---

## Definición de Hecho global (aplica a toda versión)

Una versión solo se etiqueta (sin `-dev`/`-rc`) cuando:

1. ✅ Cumple su DoD específico (arriba).
2. ✅ Abre sin errores de consola en escritorio **y** móvil.
3. ✅ Respeta `prefers-reduced-motion` (a partir de v0.4.0).
4. ✅ El dataset HR chileno se mantiene consistente (FKs válidas).
5. ✅ Los nuevos textos están en `es-CL`.
6. ✅ Se actualiza `CHANGELOG.md` con lo entregado.

---

## Política de *patch releases*

- Los **bugs** se corrigen en `v0.x.y` sin agregar features (ej.: tras v0.7.0, un fix de conectores es `v0.7.1`).
- Un cambio que rompa la forma de una *lección* o de un *frame* **antes** de 1.0.0 sube el *minor*; **después** de 1.0.0 sube el *major*.
- Cada *patch* también entra en `CHANGELOG.md`.

---

## Más allá de v1.0.0 (vision post-lanzamiento)

No forma parte del rango v0.1.0→v1.0.0, pero queda anotado para no perderlo (ver sección 15 de `code4sql.md`):

| Versión tentativa | Idea |
|---|---|
| **v1.1.0** | **Editor SQL libre** con mini-parser o integrando **sql.js** (SQLite WASM) para ejecutar consultas reales sobre el dataset. |
| **v1.2.0** | **Plan de ejecución** estilo `EXPLAIN PLAN` renderizado como árbol. |
| **v1.3.0** | **Modo quiz**: "¿qué filas devuelve este JOIN?" con feedback. |
| **v1.4.0** | **Exportar reel** como imagen/video (canvas → PNG) para compartir. |
| **v1.5.0** | **Más esquemas** (ventas, inventario) y selector de dataset. |
| **v2.0.0** | Cambio mayor de arquitectura (ej.: framework reactivo, multiusuario, contenido colaborativo). |

---

## Métricas de éxito (post v1.0.0)

- ⏱️ Carga inicial < 1.5 s en gama media.
- 📱 Lighthouse móvil: Performance ≥ 90, Accessibility ≥ 90.
- 🎓 Cada lección se entiende **sin texto adicional** (la animación basta).
- 🔁 Tasa de finalización de lección (usuario llega al último paso).

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Conectores SVG se desalinean al hacer scroll/resize | Alto (rompe el efecto visual) | Recalcular con `rAF` en `scroll`/`resize`; cubrir en v0.4.0 antes de sumar lecciones. |
| `100dvh` inconsistente entre navegadores móviles | Medio | Usar `100dvh` + `viewport-fit=cover` + `safe-area-inset`; probar en iOS/Android en RC. |
| Animaciones pesadas en gama baja | Medio | `prefers-reduced-motion`, transiciones GPU-friendly, autoplay con intervalo holgado. |
| Alcance del motor crece sin control | Medio | Mantener lecciones declarativas; **no** construir parser SQL antes de v1.0.0. |
| Datos del schema con inconsistencias de FK | Bajo | Validación del dataset en v0.1.0 y en el DoD global. |

---

*Roadmap de Code4SQL — del primer commit al lanzamiento. 🇨🇱*
