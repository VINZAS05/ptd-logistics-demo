// Datos mock realistas basados en la operacion de PTD Logistics
// Puerto de Manzanillo - 10,000-15,000 contenedores/mes

// ============================================================
// RBAC - Roles, Permisos, Usuarios
// ============================================================

export type PanelId = 'home' | 'patio' | 'contenedores' | 'evacuados' | 'en_patio' | 'ingresados' | 'gate' | 'evacuaciones' | 'trafico' | 'maquinaria' | 'pagos' | 'kpis' | 'optimizador' | 'admin';

export type RolId = 'director' | 'gerente' | 'admin' | 'programacion' | 'checador' | 'operador';

export const ROLE_PANELS: Record<RolId, PanelId[]> = {
  director: ['home', 'patio', 'contenedores', 'evacuados', 'en_patio', 'ingresados', 'optimizador', 'gate', 'evacuaciones', 'maquinaria', 'trafico', 'pagos', 'kpis', 'admin'],
  gerente: ['home', 'patio', 'contenedores', 'evacuados', 'en_patio', 'ingresados', 'optimizador', 'gate', 'evacuaciones', 'maquinaria', 'trafico', 'pagos', 'kpis'],
  admin: ['home', 'pagos', 'kpis', 'admin'],
  programacion: ['home', 'evacuaciones', 'contenedores', 'evacuados', 'en_patio', 'ingresados'],
  checador: ['home', 'gate'],
  operador: ['home', 'patio', 'maquinaria'],
};

export const ROLES_META: Record<RolId, { label: string; descripcion: string; color: string; bgColor: string; nivel: number }> = {
  director: { label: 'Director', descripcion: 'Acceso completo - vista ejecutiva', color: 'text-purple-700', bgColor: 'bg-purple-100', nivel: 100 },
  gerente: { label: 'Gerente', descripcion: 'Acceso completo - vista operativa', color: 'text-blue-700', bgColor: 'bg-blue-100', nivel: 80 },
  admin: { label: 'Admin', descripcion: 'Pagos, KPIs y administracion', color: 'text-amber-700', bgColor: 'bg-amber-100', nivel: 60 },
  programacion: { label: 'Programacion', descripcion: 'Evacuaciones y contenedores', color: 'text-green-700', bgColor: 'bg-green-100', nivel: 40 },
  checador: { label: 'Checador', descripcion: 'Control de gate', color: 'text-cyan-700', bgColor: 'bg-cyan-100', nivel: 40 },
  operador: { label: 'Operador', descripcion: 'Patio y maquinaria', color: 'text-orange-700', bgColor: 'bg-orange-100', nivel: 40 },
};

export const PANEL_LABELS: Record<PanelId, string> = {
  home: 'Home', patio: 'Patio', contenedores: 'Contenedores', evacuados: 'Evacuados',
  en_patio: 'En Patio', ingresados: 'Ingresados', optimizador: 'Optimizador',
  gate: 'Gate', evacuaciones: 'Evacuaciones', maquinaria: 'Maquinaria',
  trafico: 'Trafico', pagos: 'Pagos', kpis: 'KPIs', admin: 'Admin',
};

export interface Usuario {
  id: string;
  nombre: string;
  rol: RolId;
  dispositivo: 'Web' | 'Tablet' | 'Web + movil';
  activo: boolean;
  avatar: string;
}

export const usuariosMock: Usuario[] = [
  { id: 'u1', nombre: 'Memo Woodward', rol: 'director', dispositivo: 'Web + movil', activo: true, avatar: 'MW' },
  { id: 'u2', nombre: 'Gerente Ops.', rol: 'gerente', dispositivo: 'Web + movil', activo: true, avatar: 'GO' },
  { id: 'u3', nombre: 'Esmeralda', rol: 'programacion', dispositivo: 'Web', activo: true, avatar: 'ES' },
  { id: 'u4', nombre: 'Checador Gate 1', rol: 'checador', dispositivo: 'Tablet', activo: true, avatar: 'C1' },
  { id: 'u5', nombre: 'Checador Gate 2', rol: 'checador', dispositivo: 'Tablet', activo: true, avatar: 'C2' },
  { id: 'u6', nombre: 'Operador Grua 1', rol: 'operador', dispositivo: 'Tablet', activo: true, avatar: 'O1' },
  { id: 'u7', nombre: 'Administracion', rol: 'admin', dispositivo: 'Web', activo: true, avatar: 'AD' },
];

export type Naviera = 'CMA CGM' | 'Cosco Shipping' | 'HMM' | 'ONE' | 'PIL' | 'Evergreen' | 'Wan Hai' | 'Yang Ming' | 'Hapag-Lloyd';

export const NAVIERAS: { nombre: Naviera; color: string; abrev: string }[] = [
  { nombre: 'CMA CGM', color: '#E66414', abrev: 'CMA' },
  { nombre: 'Cosco Shipping', color: '#0064B4', abrev: 'COS' },
  { nombre: 'HMM', color: '#0096C8', abrev: 'HMM' },
  { nombre: 'ONE', color: '#FF1493', abrev: 'ONE' },
  { nombre: 'PIL', color: '#8B4513', abrev: 'PIL' },
  { nombre: 'Evergreen', color: '#008C46', abrev: 'EVE' },
  { nombre: 'Wan Hai', color: '#D4B400', abrev: 'WAN' },
  { nombre: 'Yang Ming', color: '#00CED1', abrev: 'YML' },
  { nombre: 'Hapag-Lloyd', color: '#E68200', abrev: 'HAP' },
];

// Tipos de contenedor segun operacion real
export type TipoContenedor = '40HC' | '20DC' | '40HR' | '40DC' | '20FR' | '40OH' | '40OT' | '40RF' | '40FH' | '40FR' | '20OT';

export const TIPOS_CONTENEDOR: { tipo: TipoContenedor; descripcion: string }[] = [
  { tipo: '40HC', descripcion: '40ft High Cube' },
  { tipo: '20DC', descripcion: '20ft Dry Container' },
  { tipo: '40HR', descripcion: '40ft High Cube Reefer' },
  { tipo: '40DC', descripcion: '40ft Dry Container' },
  { tipo: '20FR', descripcion: '20ft Flat Rack' },
  { tipo: '40OH', descripcion: '40ft Open Top High' },
  { tipo: '40OT', descripcion: '40ft Open Top' },
  { tipo: '40RF', descripcion: '40ft Reefer' },
  { tipo: '40FH', descripcion: '40ft Flat High' },
  { tipo: '40FR', descripcion: '40ft Flat Rack' },
  { tipo: '20OT', descripcion: '20ft Open Top' },
];

// Distribucion realista de tipos de contenedor (basada en datos operacionales reales)
const DIST_TIPOS: { tipo: TipoContenedor; peso: number }[] = [
  { tipo: '40HC', peso: 71.8 },
  { tipo: '20DC', peso: 16.5 },
  { tipo: '40HR', peso: 7.9 },
  { tipo: '40DC', peso: 3.5 },
  { tipo: '20FR', peso: 0.1 },
  { tipo: '40OH', peso: 0.1 },
  { tipo: '40OT', peso: 0.05 },
  { tipo: '40RF', peso: 0.05 },
];

export function tipoContenedorAleatorio(): TipoContenedor {
  const r = Math.random() * 100;
  let acc = 0;
  for (const d of DIST_TIPOS) {
    acc += d.peso;
    if (r < acc) return d.tipo;
  }
  return '40HC';
}

// Datos operacionales reales
export const datosOperacionales = {
  contenedoresEnPatio: {
    total: 3842,
    porNaviera: [
      { naviera: 'CMA CGM' as Naviera, cantidad: 1084 },
      { naviera: 'Cosco Shipping' as Naviera, cantidad: 939 },
      { naviera: 'HMM' as Naviera, cantidad: 656 },
      { naviera: 'ONE' as Naviera, cantidad: 407 },
      { naviera: 'PIL' as Naviera, cantidad: 401 },
      { naviera: 'Evergreen' as Naviera, cantidad: 142 },
      { naviera: 'Wan Hai' as Naviera, cantidad: 128 },
      { naviera: 'Yang Ming' as Naviera, cantidad: 63 },
      { naviera: 'Hapag-Lloyd' as Naviera, cantidad: 22 },
    ],
    porTipo: [
      { tipo: '40HC' as TipoContenedor, cantidad: 2757 },
      { tipo: '20DC' as TipoContenedor, cantidad: 633 },
      { tipo: '40HR' as TipoContenedor, cantidad: 304 },
      { tipo: '40DC' as TipoContenedor, cantidad: 135 },
      { tipo: '20FR' as TipoContenedor, cantidad: 4 },
      { tipo: '40OH' as TipoContenedor, cantidad: 4 },
      { tipo: '40OT' as TipoContenedor, cantidad: 2 },
      { tipo: '40RF' as TipoContenedor, cantidad: 2 },
    ],
  },
  contenedoresIngresados: {
    total: 9894,
    porNaviera: [
      { naviera: 'CMA CGM' as Naviera, cantidad: 2445 },
      { naviera: 'Wan Hai' as Naviera, cantidad: 1959 },
      { naviera: 'Cosco Shipping' as Naviera, cantidad: 1770 },
      { naviera: 'HMM' as Naviera, cantidad: 1568 },
      { naviera: 'ONE' as Naviera, cantidad: 865 },
      { naviera: 'PIL' as Naviera, cantidad: 797 },
      { naviera: 'Evergreen' as Naviera, cantidad: 248 },
    ],
    porTipo: [
      { tipo: '40HC' as TipoContenedor, cantidad: 7015 },
      { tipo: '20DC' as TipoContenedor, cantidad: 2058 },
      { tipo: '40DC' as TipoContenedor, cantidad: 347 },
      { tipo: '40HR' as TipoContenedor, cantidad: 304 },
      { tipo: '40FR' as TipoContenedor, cantidad: 72 },
      { tipo: '40FH' as TipoContenedor, cantidad: 25 },
      { tipo: '40OT' as TipoContenedor, cantidad: 20 },
    ],
  },
  contenedoresEvacuados: {
    total: 14498,
    porNaviera: [
      { naviera: 'CMA CGM' as Naviera, cantidad: 4204 },
      { naviera: 'ONE' as Naviera, cantidad: 2316 },
      { naviera: 'Wan Hai' as Naviera, cantidad: 2274 },
      { naviera: 'PIL' as Naviera, cantidad: 1837 },
      { naviera: 'Evergreen' as Naviera, cantidad: 1108 },
      { naviera: 'Hapag-Lloyd' as Naviera, cantidad: 1077 },
      { naviera: 'HMM' as Naviera, cantidad: 1056 },
    ],
    porTipo: [
      { tipo: '40HC' as TipoContenedor, cantidad: 11173 },
      { tipo: '20DC' as TipoContenedor, cantidad: 2502 },
      { tipo: '40DC' as TipoContenedor, cantidad: 383 },
      { tipo: '40HR' as TipoContenedor, cantidad: 205 },
      { tipo: '40FR' as TipoContenedor, cantidad: 107 },
      { tipo: '40FH' as TipoContenedor, cantidad: 41 },
      { tipo: '20OT' as TipoContenedor, cantidad: 32 },
    ],
  },
};

// ============================================================
// DATOS DETALLADOS PARA PANELES EVACUADOS / EN PATIO / INGRESADOS
// ============================================================

export interface MovimientoDiario {
  fecha: string; // 'YYYY-MM-DD'
  dia: number;
  mes: string;
  cantidad: number;
  naviera: Naviera;
  tipo: TipoContenedor;
}

// Helper: generar movimientos individuales con desglose por naviera y tipo
function generarMovimientos(
  baseData: { dia: number; mes: string; cantidad: number }[],
  navieras: { naviera: Naviera; peso: number }[],
  tipos: { tipo: TipoContenedor; peso: number }[],
  year: number,
): MovimientoDiario[] {
  const mesNum: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };
  const result: MovimientoDiario[] = [];
  for (const d of baseData) {
    const m = mesNum[d.mes] || 1;
    const fecha = `${year}-${String(m).padStart(2, '0')}-${String(d.dia).padStart(2, '0')}`;
    // Distribuir la cantidad entre navieras y tipos
    let restante = d.cantidad;
    for (let ni = 0; ni < navieras.length; ni++) {
      const nPeso = navieras[ni].peso;
      const nCant = ni === navieras.length - 1 ? restante : Math.round(d.cantidad * nPeso / 100);
      if (nCant <= 0) continue;
      restante -= nCant;
      let tRestante = nCant;
      for (let ti = 0; ti < tipos.length; ti++) {
        const tCant = ti === tipos.length - 1 ? tRestante : Math.round(nCant * tipos[ti].peso / 100);
        if (tCant <= 0) continue;
        tRestante -= tCant;
        result.push({ fecha, dia: d.dia, mes: d.mes, cantidad: tCant, naviera: navieras[ni].naviera, tipo: tipos[ti].tipo });
      }
    }
  }
  return result;
}

const pesoNavierasEvac = [
  { naviera: 'CMA CGM' as Naviera, peso: 29 },
  { naviera: 'ONE' as Naviera, peso: 16 },
  { naviera: 'Wan Hai' as Naviera, peso: 15.7 },
  { naviera: 'PIL' as Naviera, peso: 12.7 },
  { naviera: 'Evergreen' as Naviera, peso: 7.6 },
  { naviera: 'Hapag-Lloyd' as Naviera, peso: 7.4 },
  { naviera: 'HMM' as Naviera, peso: 7.3 },
  { naviera: 'Cosco Shipping' as Naviera, peso: 4.3 },
];

const pesoNavierasIng = [
  { naviera: 'CMA CGM' as Naviera, peso: 24.7 },
  { naviera: 'Wan Hai' as Naviera, peso: 19.8 },
  { naviera: 'Cosco Shipping' as Naviera, peso: 17.9 },
  { naviera: 'HMM' as Naviera, peso: 15.8 },
  { naviera: 'ONE' as Naviera, peso: 8.7 },
  { naviera: 'PIL' as Naviera, peso: 8.1 },
  { naviera: 'Evergreen' as Naviera, peso: 2.5 },
  { naviera: 'Yang Ming' as Naviera, peso: 2.5 },
];

const pesoNavierasPatio = [
  { naviera: 'CMA CGM' as Naviera, peso: 28.2 },
  { naviera: 'Cosco Shipping' as Naviera, peso: 24.4 },
  { naviera: 'HMM' as Naviera, peso: 17.1 },
  { naviera: 'ONE' as Naviera, peso: 10.6 },
  { naviera: 'PIL' as Naviera, peso: 10.4 },
  { naviera: 'Evergreen' as Naviera, peso: 3.7 },
  { naviera: 'Wan Hai' as Naviera, peso: 3.3 },
  { naviera: 'Yang Ming' as Naviera, peso: 1.6 },
  { naviera: 'Hapag-Lloyd' as Naviera, peso: 0.6 },
];

const pesoTiposStd = [
  { tipo: '40HC' as TipoContenedor, peso: 71 },
  { tipo: '20DC' as TipoContenedor, peso: 17 },
  { tipo: '40DC' as TipoContenedor, peso: 4 },
  { tipo: '40HR' as TipoContenedor, peso: 4 },
  { tipo: '40FR' as TipoContenedor, peso: 1.5 },
  { tipo: '40FH' as TipoContenedor, peso: 1 },
  { tipo: '20OT' as TipoContenedor, peso: 0.8 },
  { tipo: '40OT' as TipoContenedor, peso: 0.7 },
];

// Datos diarios base (sin desglose)
const evacuadosDiarioBase = [
  { dia: 1, mes: 'enero', cantidad: 877 }, { dia: 2, mes: 'enero', cantidad: 1065 },
  { dia: 3, mes: 'enero', cantidad: 793 }, { dia: 4, mes: 'enero', cantidad: 616 },
  { dia: 5, mes: 'enero', cantidad: 211 }, { dia: 6, mes: 'enero', cantidad: 579 },
  { dia: 7, mes: 'enero', cantidad: 842 }, { dia: 8, mes: 'enero', cantidad: 1394 },
  { dia: 9, mes: 'enero', cantidad: 634 }, { dia: 10, mes: 'enero', cantidad: 314 },
  { dia: 11, mes: 'enero', cantidad: 257 }, { dia: 12, mes: 'enero', cantidad: 206 },
  { dia: 13, mes: 'enero', cantidad: 173 },
  { dia: 1, mes: 'febrero', cantidad: 884 }, { dia: 2, mes: 'febrero', cantidad: 663 },
  { dia: 3, mes: 'febrero', cantidad: 496 }, { dia: 4, mes: 'febrero', cantidad: 354 },
  { dia: 5, mes: 'febrero', cantidad: 117 }, { dia: 6, mes: 'febrero', cantidad: 298 },
  { dia: 7, mes: 'febrero', cantidad: 285 }, { dia: 8, mes: 'febrero', cantidad: 601 },
  { dia: 9, mes: 'febrero', cantidad: 546 }, { dia: 10, mes: 'febrero', cantidad: 302 },
  { dia: 11, mes: 'febrero', cantidad: 446 }, { dia: 12, mes: 'febrero', cantidad: 262 },
  { dia: 13, mes: 'febrero', cantidad: 323 }, { dia: 14, mes: 'febrero', cantidad: 331 },
  { dia: 15, mes: 'febrero', cantidad: 629 }, { dia: 16, mes: 'febrero', cantidad: 487 },
  { dia: 17, mes: 'febrero', cantidad: 395 }, { dia: 18, mes: 'febrero', cantidad: 512 },
  { dia: 19, mes: 'febrero', cantidad: 678 }, { dia: 20, mes: 'febrero', cantidad: 544 },
  { dia: 21, mes: 'febrero', cantidad: 389 }, { dia: 22, mes: 'febrero', cantidad: 456 },
  { dia: 23, mes: 'febrero', cantidad: 523 }, { dia: 24, mes: 'febrero', cantidad: 611 },
  { dia: 25, mes: 'febrero', cantidad: 478 }, { dia: 26, mes: 'febrero', cantidad: 534 },
  { dia: 27, mes: 'febrero', cantidad: 592 }, { dia: 28, mes: 'febrero', cantidad: 712 },
];

const ingresadosDiarioBase = [
  { dia: 1, mes: 'febrero', cantidad: 500 }, { dia: 2, mes: 'febrero', cantidad: 312 },
  { dia: 3, mes: 'febrero', cantidad: 69 }, { dia: 4, mes: 'febrero', cantidad: 450 },
  { dia: 5, mes: 'febrero', cantidad: 281 }, { dia: 6, mes: 'febrero', cantidad: 619 },
  { dia: 7, mes: 'febrero', cantidad: 381 }, { dia: 8, mes: 'febrero', cantidad: 290 },
  { dia: 9, mes: 'febrero', cantidad: 32 }, { dia: 10, mes: 'febrero', cantidad: 191 },
  { dia: 11, mes: 'febrero', cantidad: 226 }, { dia: 12, mes: 'febrero', cantidad: 179 },
  { dia: 13, mes: 'febrero', cantidad: 200 }, { dia: 14, mes: 'febrero', cantidad: 196 },
  { dia: 15, mes: 'febrero', cantidad: 344 }, { dia: 16, mes: 'febrero', cantidad: 39 },
  { dia: 17, mes: 'febrero', cantidad: 345 }, { dia: 18, mes: 'febrero', cantidad: 369 },
  { dia: 19, mes: 'febrero', cantidad: 702 }, { dia: 20, mes: 'febrero', cantidad: 556 },
  { dia: 21, mes: 'febrero', cantidad: 512 }, { dia: 22, mes: 'febrero', cantidad: 26 },
  { dia: 23, mes: 'febrero', cantidad: 258 }, { dia: 24, mes: 'febrero', cantidad: 387 },
  { dia: 25, mes: 'febrero', cantidad: 393 }, { dia: 26, mes: 'febrero', cantidad: 208 },
  { dia: 27, mes: 'febrero', cantidad: 236 }, { dia: 28, mes: 'febrero', cantidad: 384 },
];

const enPatioDiarioBase = [
  { dia: 4, mes: 'enero', cantidad: 2 }, { dia: 5, mes: 'enero', cantidad: 1 },
  { dia: 12, mes: 'enero', cantidad: 1 }, { dia: 21, mes: 'enero', cantidad: 1 },
  { dia: 24, mes: 'enero', cantidad: 7 }, { dia: 25, mes: 'enero', cantidad: 2 },
  { dia: 26, mes: 'enero', cantidad: 10 }, { dia: 27, mes: 'enero', cantidad: 89 },
  { dia: 28, mes: 'enero', cantidad: 54 }, { dia: 29, mes: 'enero', cantidad: 1 },
  { dia: 30, mes: 'enero', cantidad: 3 }, { dia: 31, mes: 'enero', cantidad: 1 },
  { dia: 3, mes: 'febrero', cantidad: 6 }, { dia: 4, mes: 'febrero', cantidad: 9 },
  { dia: 5, mes: 'febrero', cantidad: 8 }, { dia: 6, mes: 'febrero', cantidad: 18 },
  { dia: 7, mes: 'febrero', cantidad: 2 }, { dia: 8, mes: 'febrero', cantidad: 11 },
  { dia: 9, mes: 'febrero', cantidad: 13 }, { dia: 10, mes: 'febrero', cantidad: 10 },
  { dia: 11, mes: 'febrero', cantidad: 63 }, { dia: 12, mes: 'febrero', cantidad: 120 },
  { dia: 13, mes: 'febrero', cantidad: 121 }, { dia: 14, mes: 'febrero', cantidad: 97 },
  { dia: 15, mes: 'febrero', cantidad: 52 }, { dia: 17, mes: 'febrero', cantidad: 14 },
  { dia: 18, mes: 'febrero', cantidad: 166 }, { dia: 19, mes: 'febrero', cantidad: 247 },
  { dia: 20, mes: 'febrero', cantidad: 218 }, { dia: 21, mes: 'febrero', cantidad: 98 },
  { dia: 22, mes: 'febrero', cantidad: 208 }, { dia: 23, mes: 'febrero', cantidad: 236 },
  { dia: 24, mes: 'febrero', cantidad: 310 }, { dia: 25, mes: 'febrero', cantidad: 345 },
  { dia: 26, mes: 'febrero', cantidad: 384 }, { dia: 27, mes: 'febrero', cantidad: 732 },
];

// Generar movimientos detallados
export const movimientosEvacuados = generarMovimientos(evacuadosDiarioBase, pesoNavierasEvac, pesoTiposStd, 2026);
export const movimientosIngresados = generarMovimientos(ingresadosDiarioBase, pesoNavierasIng, pesoTiposStd, 2026);
export const movimientosEnPatio = generarMovimientos(enPatioDiarioBase, pesoNavierasPatio, pesoTiposStd, 2026);

// Datos base para graficos simples (sin desglose)
export const evacuadosPorDia = evacuadosDiarioBase;
export const ingresadosPorDia = ingresadosDiarioBase;
export const enPatioPorDia = enPatioDiarioBase;

// Semanas
export const evacuadosPorSemana = [
  { semana: 1, cantidad: 877 }, { semana: 2, cantidad: 3467 },
  { semana: 3, cantidad: 2584 }, { semana: 4, cantidad: 950 },
  { semana: 5, cantidad: 2798 }, { semana: 6, cantidad: 2844 },
  { semana: 7, cantidad: 3322 }, { semana: 8, cantidad: 3748 },
  { semana: 9, cantidad: 3927 },
];

export const ingresadosPorSemana = [
  { semana: 5, cantidad: 1612 }, { semana: 6, cantidad: 2053 },
  { semana: 7, cantidad: 1375 }, { semana: 8, cantidad: 2938 },
  { semana: 9, cantidad: 3459 },
];

// Meses
export const evacuadosPorMes = [
  { mes: 'enero', cantidad: 7961 }, { mes: 'febrero', cantidad: 14498 },
];

export const ingresadosPorMes = [
  { mes: 'enero', cantidad: 1423 }, { mes: 'febrero', cantidad: 9894 },
];

export const enPatioPorMesIngreso = [
  { mes: 'enero', cantidad: 171 }, { mes: 'febrero', cantidad: 3491 },
  { mes: 'marzo', cantidad: 125 }, { mes: 'septiembre', cantidad: 1 },
  { mes: 'octubre', cantidad: 2 }, { mes: 'noviembre', cantidad: 21 },
  { mes: 'diciembre', cantidad: 31 },
];

// Dias promedio en patio por naviera
export const diasPromedioPatio = [
  { naviera: 'CMA CGM' as Naviera, dias: 12.3 },
  { naviera: 'Cosco Shipping' as Naviera, dias: 15.1 },
  { naviera: 'HMM' as Naviera, dias: 18.7 },
  { naviera: 'ONE' as Naviera, dias: 9.4 },
  { naviera: 'PIL' as Naviera, dias: 22.5 },
  { naviera: 'Evergreen' as Naviera, dias: 11.8 },
  { naviera: 'Wan Hai' as Naviera, dias: 14.2 },
  { naviera: 'Yang Ming' as Naviera, dias: 8.6 },
  { naviera: 'Hapag-Lloyd' as Naviera, dias: 6.3 },
];

// Tiempo promedio evacuacion (horas desde solicitud)
export const tiempoEvacuacion = [
  { naviera: 'CMA CGM' as Naviera, horas: 4.2 },
  { naviera: 'ONE' as Naviera, horas: 3.8 },
  { naviera: 'Wan Hai' as Naviera, horas: 5.1 },
  { naviera: 'PIL' as Naviera, horas: 6.3 },
  { naviera: 'Evergreen' as Naviera, horas: 4.7 },
  { naviera: 'Hapag-Lloyd' as Naviera, horas: 3.5 },
  { naviera: 'HMM' as Naviera, horas: 5.8 },
  { naviera: 'Cosco Shipping' as Naviera, horas: 4.0 },
];

// Control de maquinaria - 8+1 reach stackers
export type EstadoMaquina = 'operando' | 'standby' | 'mantenimiento' | 'fuera_servicio';

export interface Maquina {
  id: string;
  nombre: string;
  tipo: 'reach_stacker' | 'grua_patio';
  estado: EstadoMaquina;
  operador: string;
  maniobrasHoy: number;
  maniobrasObjetivo: number;
  horasOperacion: number;
  combustiblePct: number;
  ultimaManiobraHora: string;
  islaAsignada: string | null;
}

export const maquinaria: Maquina[] = [
  { id: 'RS-01', nombre: 'Reach Stacker 01', tipo: 'reach_stacker', estado: 'operando', operador: 'J. Garcia', maniobrasHoy: 87, maniobrasObjetivo: 100, horasOperacion: 7.5, combustiblePct: 62, ultimaManiobraHora: '14:52', islaAsignada: 'ISLA-01' },
  { id: 'RS-02', nombre: 'Reach Stacker 02', tipo: 'reach_stacker', estado: 'operando', operador: 'M. Lopez', maniobrasHoy: 94, maniobrasObjetivo: 100, horasOperacion: 8.0, combustiblePct: 45, ultimaManiobraHora: '14:50', islaAsignada: 'ISLA-03' },
  { id: 'RS-03', nombre: 'Reach Stacker 03', tipo: 'reach_stacker', estado: 'operando', operador: 'R. Hernandez', maniobrasHoy: 72, maniobrasObjetivo: 100, horasOperacion: 6.5, combustiblePct: 78, ultimaManiobraHora: '14:48', islaAsignada: 'ISLA-04' },
  { id: 'RS-04', nombre: 'Reach Stacker 04', tipo: 'reach_stacker', estado: 'standby', operador: 'A. Martinez', maniobrasHoy: 56, maniobrasObjetivo: 100, horasOperacion: 5.0, combustiblePct: 55, ultimaManiobraHora: '14:30', islaAsignada: null },
  { id: 'RS-05', nombre: 'Reach Stacker 05', tipo: 'reach_stacker', estado: 'operando', operador: 'C. Ramirez', maniobrasHoy: 81, maniobrasObjetivo: 100, horasOperacion: 7.0, combustiblePct: 38, ultimaManiobraHora: '14:51', islaAsignada: 'ISLA-05' },
  { id: 'RS-06', nombre: 'Reach Stacker 06', tipo: 'reach_stacker', estado: 'operando', operador: 'F. Torres', maniobrasHoy: 68, maniobrasObjetivo: 100, horasOperacion: 6.0, combustiblePct: 71, ultimaManiobraHora: '14:45', islaAsignada: 'SUR-A' },
  { id: 'RS-07', nombre: 'Reach Stacker 07', tipo: 'reach_stacker', estado: 'mantenimiento', operador: '-', maniobrasHoy: 0, maniobrasObjetivo: 100, horasOperacion: 0, combustiblePct: 90, ultimaManiobraHora: '-', islaAsignada: null },
  { id: 'RS-08', nombre: 'Reach Stacker 08', tipo: 'reach_stacker', estado: 'operando', operador: 'L. Gomez', maniobrasHoy: 91, maniobrasObjetivo: 100, horasOperacion: 7.8, combustiblePct: 33, ultimaManiobraHora: '14:53', islaAsignada: 'ISLA-06' },
  { id: 'GP-01', nombre: 'Grua de Patio 01', tipo: 'grua_patio', estado: 'operando', operador: 'P. Sanchez', maniobrasHoy: 45, maniobrasObjetivo: 60, horasOperacion: 7.0, combustiblePct: 80, ultimaManiobraHora: '14:49', islaAsignada: 'ISLA-02' },
];

export const resumenMaquinaria = {
  totalMaquinas: 9,
  operando: maquinaria.filter(m => m.estado === 'operando').length,
  standby: maquinaria.filter(m => m.estado === 'standby').length,
  mantenimiento: maquinaria.filter(m => m.estado === 'mantenimiento').length,
  maniobrasHoyTotal: maquinaria.reduce((s, m) => s + m.maniobrasHoy, 0),
  maniobrasObjetivoTotal: maquinaria.reduce((s, m) => s + m.maniobrasObjetivo, 0),
  horasOperacionPromedio: Math.round(maquinaria.filter(m => m.estado === 'operando').reduce((s, m) => s + m.horasOperacion, 0) / Math.max(1, maquinaria.filter(m => m.estado === 'operando').length) * 10) / 10,
  combustiblePromedio: Math.round(maquinaria.filter(m => m.estado !== 'mantenimiento').reduce((s, m) => s + m.combustiblePct, 0) / Math.max(1, maquinaria.filter(m => m.estado !== 'mantenimiento').length)),
};

// Tendencia de maniobras por hora (para grafica de maquinaria)
export const maniobrasHorarias = [
  { hora: '06:00', maniobras: 45, maquinasActivas: 6 },
  { hora: '07:00', maniobras: 72, maquinasActivas: 7 },
  { hora: '08:00', maniobras: 88, maquinasActivas: 8 },
  { hora: '09:00', maniobras: 95, maquinasActivas: 8 },
  { hora: '10:00', maniobras: 102, maquinasActivas: 8 },
  { hora: '11:00', maniobras: 98, maquinasActivas: 7 },
  { hora: '12:00', maniobras: 65, maquinasActivas: 5 },
  { hora: '13:00', maniobras: 78, maquinasActivas: 7 },
  { hora: '14:00', maniobras: 92, maquinasActivas: 7 },
];

export interface ContenedorEnPatio {
  id: string;
  naviera: Naviera;
  bloque: string;
  fila: number;
  nivel: number;
  fechaIngreso: string;
  diasEnPatio: number;
  estado: 'almacenado' | 'listo_evacuar' | 'en_inspeccion';
}

export interface EvacuacionActiva {
  naviera: Naviera;
  solicitados: number;
  completados: number;
  enRuta: number;
}

export interface SlotTransportista {
  id: string;
  transportista: string;
  horario: string;
  gate: number;
  estado: 'confirmado' | 'en_ruta' | 'en_patio' | 'completado' | 'no_show';
  vueltasCompletadas: number;
  vueltasObjetivo: number;
}

export interface AlertaDashboard {
  id: string;
  tipo: 'critica' | 'warning' | 'info';
  mensaje: string;
  hora: string;
  modulo: string;
}

export interface OperacionReciente {
  id: string;
  hora: string;
  tipo: 'ingreso' | 'salida' | 'pago' | 'evacuacion' | 'alerta';
  descripcion: string;
}

export interface PagoTransportista {
  id: string;
  transportista: string;
  monto: number;
  estado: 'pendiente' | 'procesado' | 'completado';
  fecha: string;
  viajes: number;
  cfdi: string;
}

export interface CamionEnRuta {
  id: string;
  transportista: string;
  placa: string;
  posicion: { lat: number; lng: number };
  estado: 'hacia_contecon' | 'en_contecon' | 'regreso_patio' | 'en_espera';
  contenedor: string;
  horaInicio: string;
}

// --- DATOS AGREGADOS ---

// resumenPatio se calcula despues de islasDetalladas (ver mas abajo)
export let resumenPatio: {
  totalContenedores: number;
  deltaHoy: number;
  capacidadMaxima: number;
  porNaviera: { naviera: Naviera; cantidad: number; porcentaje: number }[];
  dwellTimePromedio: number;
  ocupacion: number;
};

export const resumenEvacuacion = {
  objetivo: 3000,
  completados: 2460,
  porcentaje: 82,
  enRuta: 45,
  porNaviera: [
    { naviera: 'CMA CGM' as Naviera, solicitados: 600, completados: 580, porcentaje: 96.7 },
    { naviera: 'ONE' as Naviera, solicitados: 500, completados: 490, porcentaje: 98 },
    { naviera: 'Wan Hai' as Naviera, solicitados: 450, completados: 380, porcentaje: 84.4 },
    { naviera: 'PIL' as Naviera, solicitados: 400, completados: 340, porcentaje: 85 },
    { naviera: 'Cosco Shipping' as Naviera, solicitados: 350, completados: 280, porcentaje: 80 },
    { naviera: 'HMM' as Naviera, solicitados: 300, completados: 210, porcentaje: 70 },
    { naviera: 'Evergreen' as Naviera, solicitados: 200, completados: 120, porcentaje: 60 },
    { naviera: 'Hapag-Lloyd' as Naviera, solicitados: 150, completados: 45, porcentaje: 30 },
    { naviera: 'Yang Ming' as Naviera, solicitados: 50, completados: 15, porcentaje: 30 },
  ],
  horaEstimadaFin: '22:30',
};

export const resumenGate = {
  tiempoPromedioMin: 3.2,
  procesadosHoy: 187,
  enCola: 4,
  lanesActivas: 2,
  lanesTotales: 3,
  picoHoy: { hora: '10:00', cantidad: 32 },
  autorizadosPendientes: 12,
};

export const resumenTrafico = {
  estado: 'verde' as 'verde' | 'amarillo' | 'rojo',
  camionesEnRuta: 45,
  tiempoTransitoPromedio: 42, // minutos
  incidentesHoy: 0,
  desviacionesRuta: 0,
  zonas: [
    { nombre: 'Pancho Villa', estado: 'verde' as const },
    { nombre: 'Jalipa', estado: 'verde' as const },
    { nombre: 'Carretera Colima-Mzllo', estado: 'amarillo' as const },
  ],
};

export const resumenPagos = {
  procesadosHoy: 847500,
  pendientes: 234000,
  transportistasPagados: 72,
  facturasEmitidas: 156,
  facturasTimbradas: 148,
  tiempoPromedioPago: 18.5, // horas
};

export const alertas: AlertaDashboard[] = [
  { id: 'a1', tipo: 'critica', mensaje: 'ConTeCon reporta demora promedio de 3.5h en modulacion', hora: '14:45', modulo: 'Trazabilidad' },
  { id: 'a2', tipo: 'warning', mensaje: 'ISLA-01 (CMA CGM) al 95% de capacidad', hora: '14:30', modulo: 'Patio' },
  { id: 'a3', tipo: 'warning', mensaje: '8 camiones sin slot asignado intentaron entrar', hora: '14:15', modulo: 'Gate' },
  { id: 'a4', tipo: 'warning', mensaje: 'Evacuacion Hapag-Lloyd atrasada: 30% objetivo', hora: '13:50', modulo: 'Evacuaciones' },
  { id: 'a5', tipo: 'info', mensaje: 'Reach Stacker RS-08: 91 maniobras (mejor rendimiento)', hora: '13:30', modulo: 'Maquinaria' },
  { id: 'a6', tipo: 'warning', mensaje: 'RS-07 en mantenimiento preventivo - disponible manana', hora: '13:00', modulo: 'Maquinaria' },
  { id: 'a7', tipo: 'warning', mensaje: 'Carretera Colima-Mzllo: trafico moderado por obras', hora: '12:00', modulo: 'Trafico' },
];

export const operacionesRecientes: OperacionReciente[] = [
  { id: 'o1', hora: '14:52', tipo: 'ingreso', descripcion: 'HMMU1234567 ingreso Gate 1 - HMM 40HC' },
  { id: 'o2', hora: '14:50', tipo: 'evacuacion', descripcion: 'Slot #234 completado - CMA CGM - 4ta vuelta' },
  { id: 'o3', hora: '14:48', tipo: 'pago', descripcion: 'Pago $4,500 a Transportes Gomez - SPEI' },
  { id: 'o4', hora: '14:45', tipo: 'alerta', descripcion: 'ConTeCon demora 3.5h promedio en modulacion' },
  { id: 'o5', hora: '14:42', tipo: 'salida', descripcion: 'COSU9876543 salida evacuacion - Cosco Shipping' },
  { id: 'o6', hora: '14:38', tipo: 'ingreso', descripcion: 'CMAU4567890 ingreso Gate 2 - CMA CGM 20DC' },
  { id: 'o7', hora: '14:35', tipo: 'pago', descripcion: 'Pago $3,800 a Fletes del Pacifico - SPEI' },
  { id: 'o8', hora: '14:30', tipo: 'evacuacion', descripcion: 'Slot #233 completado - ONE - 3ra vuelta' },
];

// Datos para graficos de tendencia (ultimos 7 dias)
export const tendenciaSemanal = [
  { dia: 'Lun', contenedores: 7200, evacuados: 0, ingresos: 450 },
  { dia: 'Mar', contenedores: 7450, evacuados: 0, ingresos: 520 },
  { dia: 'Mie', contenedores: 7680, evacuados: 0, ingresos: 480 },
  { dia: 'Jue', contenedores: 7900, evacuados: 0, ingresos: 390 },
  { dia: 'Vie', contenedores: 8100, evacuados: 800, ingresos: 350 },
  { dia: 'Sab', contenedores: 7500, evacuados: 2200, ingresos: 120 },
  { dia: 'Dom', contenedores: 7842, evacuados: 460, ingresos: 80 },
];

export const tendenciaGate = [
  { hora: '06:00', entradas: 8, salidas: 5 },
  { hora: '07:00', entradas: 15, salidas: 12 },
  { hora: '08:00', entradas: 25, salidas: 18 },
  { hora: '09:00', entradas: 30, salidas: 22 },
  { hora: '10:00', entradas: 32, salidas: 28 },
  { hora: '11:00', entradas: 28, salidas: 25 },
  { hora: '12:00', entradas: 20, salidas: 22 },
  { hora: '13:00', entradas: 18, salidas: 20 },
  { hora: '14:00', entradas: 22, salidas: 18 },
];

// ============================
// LAYOUT REAL DEL PATIO - Plano PC-001 CONTAINERS (10 Junio 2025)
// Zona Norte: A=116,828.52 m2 - 7 islas (15,407 contenedores, estiba 7)
// Zona Sur: A=37,568.80 m2 - 4,788 contenedores, estiba 7
// Area Usos Multiples + Reefers (Isla 07)
// 2 Accesos: Sur (Carretera Manzanillo-Minatitlan), Oeste (Av. Lopez Mateos)
// ============================

export interface IslaConfig {
  id: string;
  nombre: string;
  capacidad: number;         // contenedores totales segun plano (con estiba)
  zona: 'norte' | 'sur';
  navieras: Naviera[];
  esReefer: boolean;
  // Dimensiones reales del grid: filas (largo) x columnas (ancho) x estiba (alto)
  gridFilas: number;         // filas de contenedores (eje largo)
  gridColumnas: number;      // columnas de contenedores (eje ancho/transversal)
  estiba: number;            // niveles de apilamiento (7 segun plano)
}

// Capacidad = gridFilas * gridColumnas * estiba
// ground slots = gridFilas * gridColumnas = capacidad / 7
export const islasConfig: IslaConfig[] = [
  // ZONA NORTE - 7 islas (15,407 contenedores, estiba 7)
  { id: 'ISLA-01', nombre: 'Isla 01', capacidad: 2233, zona: 'norte', navieras: ['CMA CGM', 'Cosco Shipping'], esReefer: false, gridFilas: 16, gridColumnas: 20, estiba: 7 },
  { id: 'ISLA-02', nombre: 'Isla 02', capacidad: 2037, zona: 'norte', navieras: ['HMM', 'ONE'], esReefer: false, gridFilas: 15, gridColumnas: 20, estiba: 7 },
  { id: 'ISLA-03', nombre: 'Isla 03', capacidad: 2520, zona: 'norte', navieras: ['CMA CGM', 'Hapag-Lloyd'], esReefer: false, gridFilas: 18, gridColumnas: 20, estiba: 7 },
  { id: 'ISLA-04', nombre: 'Isla 04', capacidad: 2884, zona: 'norte', navieras: ['Cosco Shipping', 'PIL'], esReefer: false, gridFilas: 20, gridColumnas: 21, estiba: 7 },
  { id: 'ISLA-05', nombre: 'Isla 05', capacidad: 2520, zona: 'norte', navieras: ['Wan Hai', 'Evergreen'], esReefer: false, gridFilas: 18, gridColumnas: 20, estiba: 7 },
  { id: 'ISLA-06', nombre: 'Isla 06', capacidad: 2765, zona: 'norte', navieras: ['ONE', 'Yang Ming', 'HMM'], esReefer: false, gridFilas: 19, gridColumnas: 21, estiba: 7 },
  { id: 'ISLA-07', nombre: 'Isla 07 (Reefers)', capacidad: 448, zona: 'norte', navieras: ['CMA CGM', 'Cosco Shipping', 'HMM', 'ONE', 'PIL', 'Evergreen', 'Wan Hai', 'Yang Ming', 'Hapag-Lloyd'], esReefer: true, gridFilas: 8, gridColumnas: 8, estiba: 7 },

  // ZONA SUR - 7 bloques (4,788 contenedores, estiba 7)
  { id: 'SUR-A', nombre: 'Sur Bloque A', capacidad: 1372, zona: 'sur', navieras: ['CMA CGM', 'Cosco Shipping'], esReefer: false, gridFilas: 14, gridColumnas: 14, estiba: 7 },
  { id: 'SUR-B', nombre: 'Sur Bloque B', capacidad: 364, zona: 'sur', navieras: ['Evergreen', 'Wan Hai'], esReefer: false, gridFilas: 7, gridColumnas: 8, estiba: 7 },
  { id: 'SUR-C', nombre: 'Sur Bloque C', capacidad: 420, zona: 'sur', navieras: ['HMM', 'PIL'], esReefer: false, gridFilas: 8, gridColumnas: 8, estiba: 7 },
  { id: 'SUR-D', nombre: 'Sur Bloque D', capacidad: 882, zona: 'sur', navieras: ['ONE', 'Hapag-Lloyd'], esReefer: false, gridFilas: 9, gridColumnas: 14, estiba: 7 },
  { id: 'SUR-E', nombre: 'Sur Bloque E', capacidad: 532, zona: 'sur', navieras: ['Wan Hai', 'Yang Ming'], esReefer: false, gridFilas: 8, gridColumnas: 10, estiba: 7 },
  { id: 'SUR-F', nombre: 'Sur Bloque F', capacidad: 630, zona: 'sur', navieras: ['Cosco Shipping', 'CMA CGM'], esReefer: false, gridFilas: 9, gridColumnas: 10, estiba: 7 },
  { id: 'SUR-G', nombre: 'Sur Bloque G', capacidad: 588, zona: 'sur', navieras: ['PIL', 'Evergreen'], esReefer: false, gridFilas: 7, gridColumnas: 12, estiba: 7 },
];

export interface ContenedorStack {
  id: string;
  naviera: Naviera;
  tipoContenedor: TipoContenedor;
  estado: 'almacenado' | 'listo_evacuar' | 'en_inspeccion' | 'reefer';
  diasEnPatio: number;
  tamano: '20ft' | '40ft';
  fechaIngreso: string; // ISO date
  // Campos opcionales para optimizador
  fechaEvacuacionEstimada?: string; // ISO date
  prioridad?: number;               // 1 (alta) a 5 (baja)
  pesoTon?: number;                 // peso en toneladas
}

// Grid real: cada celda [fila][columna] tiene un array de niveles (0=suelo, max=estiba-1)
export interface CeldaGrid {
  contenedores: (ContenedorStack | null)[]; // array de longitud = estiba
  nivelOcupado: number;                     // cuantos niveles tienen contenedor
}

export interface IslaDetallada {
  config: IslaConfig;
  ocupacion: number;
  ocupacionPct: number;
  groundSlots: number;       // filas * columnas
  groundSlotsOcupados: number;
  grid: CeldaGrid[][];       // [fila][columna]
  // Resumen por naviera dentro de la isla
  resumenNavieras: { naviera: Naviera; cantidad: number }[];
}

const prefijos: Record<Naviera, string> = {
  'CMA CGM': 'CMAU', 'Cosco Shipping': 'COSU', 'HMM': 'HMMU',
  'ONE': 'ONEU', 'PIL': 'PILU', 'Evergreen': 'EGHU',
  'Wan Hai': 'WAHU', 'Yang Ming': 'YMLU', 'Hapag-Lloyd': 'HLCU',
};

function generarContenedor(naviera: Naviera, diasEnPatio: number, esReefer: boolean): ContenedorStack {
  const pre = prefijos[naviera];
  const num = Math.floor(Math.random() * 9000000 + 1000000);
  const estados: ContenedorStack['estado'][] = esReefer
    ? ['reefer', 'reefer', 'reefer', 'listo_evacuar']
    : ['almacenado', 'almacenado', 'almacenado', 'almacenado', 'listo_evacuar', 'en_inspeccion'];
  const tipo = tipoContenedorAleatorio();
  const tamano = tipo.startsWith('20') ? '20ft' : '40ft';
  const fechaIngreso = new Date(Date.now() - diasEnPatio * 86400000).toISOString().split('T')[0];
  return {
    id: `${pre}${num}`,
    naviera,
    tipoContenedor: tipo,
    estado: estados[Math.floor(Math.random() * estados.length)],
    diasEnPatio,
    tamano,
    fechaIngreso,
  };
}

function generarIslaDetallada(config: IslaConfig): IslaDetallada {
  const { gridFilas, gridColumnas, estiba } = config;
  const groundSlots = gridFilas * gridColumnas;

  // Ocupacion realista: entre 55% y 92%
  const ocupacionPct = config.esReefer
    ? Math.floor(Math.random() * 20 + 70)
    : Math.floor(Math.random() * 37 + 55);
  const ocupacion = Math.floor(config.capacidad * ocupacionPct / 100);

  // Crear grid vacio
  const grid: CeldaGrid[][] = Array.from({ length: gridFilas }, () =>
    Array.from({ length: gridColumnas }, () => ({
      contenedores: Array.from({ length: estiba }, () => null),
      nivelOcupado: 0,
    }))
  );

  // Distribuir contenedores en el grid de forma realista
  // Primero llenar posiciones de ground level, luego apilar
  let restantes = ocupacion;
  const navieraCount: Record<string, number> = {};

  // Fase 1: llenar ground slots (nivel 0) aleatorios
  const posiciones: [number, number][] = [];
  for (let f = 0; f < gridFilas; f++) {
    for (let c = 0; c < gridColumnas; c++) {
      posiciones.push([f, c]);
    }
  }
  // Shuffle
  for (let i = posiciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [posiciones[i], posiciones[j]] = [posiciones[j], posiciones[i]];
  }

  let groundSlotsOcupados = 0;

  for (const [f, c] of posiciones) {
    if (restantes <= 0) break;
    const nav = config.navieras[Math.floor(Math.random() * config.navieras.length)];
    // Decidir cuantos niveles apilar en esta posicion (1 a estiba)
    const nivelTarget = Math.min(
      estiba,
      Math.max(1, Math.floor(Math.random() * (estiba - 1)) + 1),
      restantes
    );
    for (let n = 0; n < nivelTarget; n++) {
      if (restantes <= 0) break;
      const dias = Math.floor(Math.random() * 15) + 1;
      const cont = generarContenedor(nav, dias, config.esReefer);
      grid[f][c].contenedores[n] = cont;
      grid[f][c].nivelOcupado = n + 1;
      navieraCount[cont.naviera] = (navieraCount[cont.naviera] || 0) + 1;
      restantes--;
    }
    groundSlotsOcupados++;
  }

  const resumenNavieras = Object.entries(navieraCount)
    .sort((a, b) => b[1] - a[1])
    .map(([naviera, cantidad]) => ({ naviera: naviera as Naviera, cantidad }));

  return {
    config,
    ocupacion: ocupacion - restantes,
    ocupacionPct,
    groundSlots,
    groundSlotsOcupados,
    grid,
    resumenNavieras,
  };
}

// Lazy generation: solo se genera cuando se accede por primera vez
let _islasDetalladas: IslaDetallada[] | null = null;
function getIslasDetalladas(): IslaDetallada[] {
  if (!_islasDetalladas) {
    _islasDetalladas = islasConfig.map(c => generarIslaDetallada(c));
    // Calcular resumenPatio
    const _totalCont = _islasDetalladas.reduce((s, i) => s + i.ocupacion, 0);
    const _contPorNaviera: Record<Naviera, number> = { 'CMA CGM': 0, 'Cosco Shipping': 0, 'HMM': 0, 'ONE': 0, 'PIL': 0, 'Evergreen': 0, 'Wan Hai': 0, 'Yang Ming': 0, 'Hapag-Lloyd': 0 };
    _islasDetalladas.forEach(isla => isla.resumenNavieras.forEach(rn => { _contPorNaviera[rn.naviera] += rn.cantidad; }));
    resumenPatio = {
      totalContenedores: _totalCont,
      deltaHoy: 234,
      capacidadMaxima: 20195,
      porNaviera: (Object.entries(_contPorNaviera) as [Naviera, number][])
        .sort((a, b) => b[1] - a[1])
        .map(([naviera, cantidad]) => ({
          naviera,
          cantidad,
          porcentaje: Math.round(cantidad / _totalCont * 1000) / 10,
        })),
      dwellTimePromedio: 8.3,
      ocupacion: Math.round(_totalCont / 20195 * 1000) / 10,
    };
  }
  return _islasDetalladas;
}

// Getters lazy - no generan datos hasta que se usen
export const islasDetalladas: IslaDetallada[] = new Proxy([] as IslaDetallada[], {
  get(_, prop) {
    const data = getIslasDetalladas();
    const val = (data as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? (val as Function).bind(data) : val;
  },
});

// Separar por zona (tambien lazy)
export const islasZonaNorte = new Proxy([] as IslaDetallada[], {
  get(_, prop) {
    const data = getIslasDetalladas().filter(i => i.config.zona === 'norte');
    const val = (data as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? (val as Function).bind(data) : val;
  },
});
export const islasZonaSur = new Proxy([] as IslaDetallada[], {
  get(_, prop) {
    const data = getIslasDetalladas().filter(i => i.config.zona === 'sur');
    const val = (data as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? (val as Function).bind(data) : val;
  },
});

// Resumen del patio actualizado basado en plano real
export const capacidadTotalPlano = {
  zonaNorte: { area: 116828.52, contenedores: 15407, estiba: 7, islas: 7 },
  zonaSur: { area: 37568.80, contenedores: 4788, estiba: 7 },
  total: 20195,
  reefers: 448,
};

// Para compatibilidad: grid antiguo ya no se usa pero mantenemos la interfaz
export type BloqueEstado = {
  id: string;
  naviera: Naviera | null;
  contenedores: number;
  capacidad: number;
  nivel: number;
};

export const bloquesPatio: BloqueEstado[][] = [];

export interface BloqueDetallado {
  id: string;
  naviera: Naviera | null;
  filas: number;
  columnas: number;
  maxNivel: number;
  grid: (ContenedorStack | null)[][][];
}

export const bloquesDetallados: BloqueDetallado[][] = [];

// Slots de evacuacion activos
export const slotsEvacuacion: SlotTransportista[] = [
  { id: 's1', transportista: 'Transportes Gomez', horario: '06:00-06:30', gate: 1, estado: 'completado', vueltasCompletadas: 6, vueltasObjetivo: 5 },
  { id: 's2', transportista: 'Fletes del Pacifico', horario: '06:00-06:30', gate: 2, estado: 'completado', vueltasCompletadas: 5, vueltasObjetivo: 5 },
  { id: 's3', transportista: 'Logistica Manzanillo', horario: '06:30-07:00', gate: 1, estado: 'completado', vueltasCompletadas: 4, vueltasObjetivo: 4 },
  { id: 's4', transportista: 'Autotransportes Silva', horario: '07:00-07:30', gate: 2, estado: 'en_ruta', vueltasCompletadas: 3, vueltasObjetivo: 5 },
  { id: 's5', transportista: 'Carga Express Col.', horario: '07:30-08:00', gate: 1, estado: 'en_patio', vueltasCompletadas: 2, vueltasObjetivo: 4 },
  { id: 's6', transportista: 'Trans. Hernandez', horario: '08:00-08:30', gate: 2, estado: 'confirmado', vueltasCompletadas: 0, vueltasObjetivo: 4 },
  { id: 's7', transportista: 'Fletes Colima', horario: '08:30-09:00', gate: 1, estado: 'confirmado', vueltasCompletadas: 0, vueltasObjetivo: 4 },
  { id: 's8', transportista: 'Trans. Lopez', horario: '09:00-09:30', gate: 2, estado: 'no_show', vueltasCompletadas: 0, vueltasObjetivo: 4 },
];

export const pagosTransportistas: PagoTransportista[] = [
  { id: 'p1', transportista: 'Transportes Gomez', monto: 27000, estado: 'completado', fecha: '2026-03-03', viajes: 6, cfdi: 'CFDI-2026-0891' },
  { id: 'p2', transportista: 'Fletes del Pacifico', monto: 22500, estado: 'completado', fecha: '2026-03-03', viajes: 5, cfdi: 'CFDI-2026-0892' },
  { id: 'p3', transportista: 'Logistica Manzanillo', monto: 18000, estado: 'procesado', fecha: '2026-03-03', viajes: 4, cfdi: 'CFDI-2026-0893' },
  { id: 'p4', transportista: 'Autotransportes Silva', monto: 13500, estado: 'pendiente', fecha: '2026-03-03', viajes: 3, cfdi: '' },
  { id: 'p5', transportista: 'Carga Express Col.', monto: 9000, estado: 'pendiente', fecha: '2026-03-03', viajes: 2, cfdi: '' },
  { id: 'p6', transportista: 'Trans. Hernandez', monto: 0, estado: 'pendiente', fecha: '2026-03-03', viajes: 0, cfdi: '' },
];

// KPIs historicos (ultimas 4 semanas)
export const kpisHistoricos = [
  { semana: 'Sem 9', truckTurnTime: 72, gateWait: 18, tiempoContecon: 240, evacuationRate: 89, rehandles: 2.8 },
  { semana: 'Sem 10', truckTurnTime: 65, gateWait: 14, tiempoContecon: 220, evacuationRate: 91, rehandles: 2.5 },
  { semana: 'Sem 11', truckTurnTime: 58, gateWait: 8, tiempoContecon: 195, evacuationRate: 94, rehandles: 1.9 },
  { semana: 'Sem 12', truckTurnTime: 52, gateWait: 5, tiempoContecon: 180, evacuationRate: 96, rehandles: 1.5 },
];

// --- Utilidades para el optimizador ---

// Clonar el estado completo del patio (deep copy) para que el optimizador trabaje sin mutar
export function clonarEstadoPatio(): IslaDetallada[] {
  return getIslasDetalladas().map(isla => ({
    ...isla,
    grid: isla.grid.map(fila =>
      fila.map(celda => ({
        contenedores: celda.contenedores.map(c => c ? { ...c } : null),
        nivelOcupado: celda.nivelOcupado,
      }))
    ),
    resumenNavieras: isla.resumenNavieras.map(r => ({ ...r })),
  }));
}

// Distancia Manhattan de una posicion al acceso mas cercano (unidades de grid)
// Acceso 1 (Sur): posicion (fila=maxFila, col=centro) -> filas al sur
// Acceso 2 (Oeste): posicion (fila=centro, col=0) -> columnas al oeste
export function distanciaAcceso(islaId: string, fila: number, columna: number, gridFilas: number, gridColumnas: number): number {
  // Islas zona sur estan mas cerca del Acceso 1 (sur)
  // Islas zona norte estan mas cerca del Acceso 2 (oeste)
  const esSur = islaId.startsWith('SUR');
  if (esSur) {
    // Acceso 1 esta al sur, distancia = filas restantes hasta borde + columna hasta centro
    return (gridFilas - fila) + Math.abs(columna - gridColumnas / 2);
  } else {
    // Acceso 2 esta al oeste, distancia = columna (0 = mas cerca) + filas hasta centro
    return columna + Math.abs(fila - gridFilas / 2);
  }
}
