// ============================================================
// Code4SQL — Schema HR adaptado a español chileno (dataset)
// Fuente de verdad del visor. Sin servidor: datos embebidos.
// Casos pensados para los JOIN:
//   - Joaquín Fuentes (111) NO tiene departamento  -> LEFT/FULL JOIN
//   - Marketing/Operaciones/Logística/At. Cliente NO tienen empleados -> RIGHT/FULL JOIN
// ============================================================

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
    { id_ubicacion: 1000, direccion: 'Av. Apoquindo 4500',      codigo_postal: '7550000', ciudad: 'Santiago',    region: 'Región Metropolitana',   id_pais: 'CL' },
    { id_ubicacion: 1100, direccion: 'Calle Prat 856',          codigo_postal: '2340000', ciudad: 'Valparaíso',  region: 'Región de Valparaíso',   id_pais: 'CL' },
    { id_ubicacion: 1200, direccion: 'Av. Colón 1234',          codigo_postal: '4030000', ciudad: 'Concepción',  region: 'Región del Biobío',      id_pais: 'CL' },
    { id_ubicacion: 1300, direccion: 'Av. Angamos 0610',        codigo_postal: '1240000', ciudad: 'Antofagasta', region: 'Región de Antofagasta',  id_pais: 'CL' },
    { id_ubicacion: 1400, direccion: 'Av. Fco. de Aguirre 220', codigo_postal: '1700000', ciudad: 'La Serena',   region: 'Región de Coquimbo',     id_pais: 'CL' },
    { id_ubicacion: 1500, direccion: 'Av. Alemania 0671',       codigo_postal: '4780000', ciudad: 'Temuco',      region: 'Región de La Araucanía', id_pais: 'CL' },
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
    { id_empleado: 100, nombre: 'Sofía',     apellido: 'González',  rut: '12.345.678-9', email: 'sgonzalez',  telefono: '+56 9 8123 4567', fecha_contratacion: '2015-03-02', id_cargo: 'GG', sueldo: 6500000, pct_comision: null, id_jefe: null, id_departamento: 10 },
    { id_empleado: 101, nombre: 'Mateo',     apellido: 'Muñoz',     rut: '13.456.789-0', email: 'mmunoz',     telefono: '+56 9 8234 5678', fecha_contratacion: '2016-06-15', id_cargo: 'JF', sueldo: 4200000, pct_comision: null, id_jefe: 100,  id_departamento: 20 },
    { id_empleado: 102, nombre: 'Martina',   apellido: 'Rojas',     rut: '14.567.890-1', email: 'mrojas',     telefono: '+56 9 8345 6789', fecha_contratacion: '2017-01-20', id_cargo: 'RH', sueldo: 2000000, pct_comision: null, id_jefe: 100,  id_departamento: 30 },
    { id_empleado: 103, nombre: 'Benjamín',  apellido: 'Díaz',      rut: '15.678.901-2', email: 'bdiaz',      telefono: '+56 9 8456 7890', fecha_contratacion: '2016-09-10', id_cargo: 'ID', sueldo: 2900000, pct_comision: null, id_jefe: 100,  id_departamento: 40 },
    { id_empleado: 104, nombre: 'Florencia', apellido: 'Pérez',     rut: '16.789.012-3', email: 'fperez',     telefono: '+56 9 8567 8901', fecha_contratacion: '2018-04-05', id_cargo: 'EV', sueldo: 1300000, pct_comision: 0.10, id_jefe: 100,  id_departamento: 50 },
    { id_empleado: 105, nombre: 'Vicente',   apellido: 'Soto',      rut: '17.890.123-4', email: 'vsoto',      telefono: '+56 9 8678 9012', fecha_contratacion: '2019-07-22', id_cargo: 'EV', sueldo: 1100000, pct_comision: 0.08, id_jefe: 104,  id_departamento: 50 },
    { id_empleado: 106, nombre: 'Isidora',   apellido: 'Contreras', rut: '18.901.234-5', email: 'icontreras', telefono: '+56 9 8789 0123', fecha_contratacion: '2020-02-17', id_cargo: 'DS', sueldo: 1900000, pct_comision: null, id_jefe: 103,  id_departamento: 40 },
    { id_empleado: 107, nombre: 'Agustín',   apellido: 'Silva',     rut: '19.012.345-6', email: 'asilva',     telefono: '+56 9 8890 1234', fecha_contratacion: '2019-11-03', id_cargo: 'AC', sueldo: 1200000, pct_comision: null, id_jefe: 101,  id_departamento: 20 },
    { id_empleado: 108, nombre: 'Catalina',  apellido: 'Martínez',  rut: '20.123.456-7', email: 'cmartinez',  telefono: '+56 9 8901 2345', fecha_contratacion: '2021-05-12', id_cargo: 'UX', sueldo: 1600000, pct_comision: null, id_jefe: 103,  id_departamento: 40 },
    { id_empleado: 109, nombre: 'Tomás',     apellido: 'Sepúlveda', rut: '21.234.567-8', email: 'tsepulveda', telefono: '+56 9 9012 3456', fecha_contratacion: '2022-08-01', id_cargo: 'ST', sueldo: 1000000, pct_comision: null, id_jefe: 103,  id_departamento: 40 },
    { id_empleado: 110, nombre: 'Javiera',   apellido: 'Morales',   rut: '22.345.678-9', email: 'jmorales',   telefono: '+56 9 9123 4567', fecha_contratacion: '2023-03-20', id_cargo: 'AA', sueldo:  800000, pct_comision: null, id_jefe: 102,  id_departamento: 30 },
    { id_empleado: 111, nombre: 'Joaquín',   apellido: 'Fuentes',   rut: '23.456.789-0', email: 'jfuentes',   telefono: '+56 9 9234 5678', fecha_contratacion: '2024-01-15', id_cargo: 'EV', sueldo:  950000, pct_comision: 0.05, id_jefe: 104,  id_departamento: null }, // sin departamento
  ],

  historial_cargos: [
    { id_empleado: 101, fecha_inicio: '2016-06-15', fecha_termino: '2018-12-31', id_cargo: 'AC', id_departamento: 20 },
    { id_empleado: 103, fecha_inicio: '2016-09-10', fecha_termino: '2019-05-31', id_cargo: 'DS', id_departamento: 40 },
    { id_empleado: 104, fecha_inicio: '2018-04-05', fecha_termino: '2020-03-31', id_cargo: 'AA', id_departamento: 50 },
    { id_empleado: 106, fecha_inicio: '2020-02-17', fecha_termino: '2022-01-31', id_cargo: 'ST', id_departamento: 40 },
  ],
};

// --- Helpers de formato chileno (para la UI) ---
export const formatoCLP = (n) =>
  n == null ? '—' : n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export const formatoFecha = (iso) =>
  iso == null ? '—' : new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

// --- Utilidades de búsqueda ---
export const empleadoPorId = (id) => HR_CL.empleados.find((e) => e.id_empleado === id);
export const departamentoPorId = (id) => HR_CL.departamentos.find((d) => d.id_departamento === id);
export const cargoPorId = (id) => HR_CL.cargos.find((c) => c.id_cargo === id);
