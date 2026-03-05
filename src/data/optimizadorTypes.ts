import type { Naviera } from './mockData';

// --- Ordenes de operacion ---

export type TipoOperacion = 'ingreso' | 'evacuacion';

export interface LineaOrden {
  naviera: Naviera;
  cantidad: number;
  tipo: TipoOperacion;
}

export interface SolicitudOptimizacion {
  lineas: LineaOrden[];
  fechaObjetivo: string; // ISO date
  nombre?: string;       // nombre descriptivo de la orden
}

// --- Plan de colocacion ---

export interface PosicionPatio {
  islaId: string;
  fila: number;
  columna: number;
  nivel: number; // 0 = suelo
}

export interface PosicionRecomendada {
  contenedorId: string;
  naviera: Naviera;
  posicion: PosicionPatio;
  score: number;         // score total de la posicion (0-100)
  scoreDetalle: ScoreDetalle;
}

export interface ScoreDetalle {
  clusteringNaviera: number;   // 0-100
  alturaStack: number;         // 0-100
  proximidadAcceso: number;    // 0-100
  lifoTemporal: number;        // 0-100
  pesoTamano: number;          // 0-100
}

// --- Movimientos secuenciales ---

export type TipoMovimiento = 'ingreso' | 'evacuacion' | 'rehandle';

export interface MovimientoSecuencial {
  paso: number;
  tipo: TipoMovimiento;
  contenedorId: string;
  naviera: Naviera;
  origen: PosicionPatio | null;  // null si es ingreso nuevo
  destino: PosicionPatio | null; // null si es evacuacion (sale del patio)
  rehandlesDe?: string;         // ID del contenedor que estamos liberando
}

// --- Resultado de la optimizacion ---

export interface MetricasOperacion {
  totalMovimientos: number;
  rehandles: number;
  rehandlesPorEvacuacion: number; // promedio
  tiempoEstimadoMin: number;
  groundSlotsLiberados: number;
  groundSlotsOcupados: number;
}

export interface ResultadoOptimizacion {
  solicitud: SolicitudOptimizacion;
  posicionesIngreso: PosicionRecomendada[];
  movimientos: MovimientoSecuencial[];
  metricas: MetricasOperacion;
  metricasBaseline: MetricasOperacion; // sin optimizar (aleatorio)
  mejoraPct: number;                   // % reduccion rehandles vs baseline
  estadoPatioPrevio: EstadoResumen;
  estadoPatioPost: EstadoResumen;
}

export interface EstadoResumen {
  totalContenedores: number;
  ocupacionPct: number;
  porNaviera: { naviera: Naviera; cantidad: number }[];
  rehandlesPromedio: number;
}

// --- Pesos del scoring ---

export const PESOS_SCORING = {
  clusteringNaviera: 0.40,
  alturaStack: 0.20,
  proximidadAcceso: 0.15,
  lifoTemporal: 0.15,
  pesoTamano: 0.10,
} as const;

// --- Presets de ordenes ---

export interface PresetOrden {
  nombre: string;
  descripcion: string;
  lineas: LineaOrden[];
}

export const PRESETS_ORDENES: PresetOrden[] = [
  {
    nombre: 'Evacuacion CMA CGM',
    descripcion: 'Evacuar 300 contenedores CMA CGM',
    lineas: [{ naviera: 'CMA CGM', cantidad: 300, tipo: 'evacuacion' }],
  },
  {
    nombre: 'Recepcion mixta',
    descripcion: '100 Cosco + 150 HMM + 80 CMA CGM ingreso',
    lineas: [
      { naviera: 'Cosco Shipping', cantidad: 100, tipo: 'ingreso' },
      { naviera: 'HMM', cantidad: 150, tipo: 'ingreso' },
      { naviera: 'CMA CGM', cantidad: 80, tipo: 'ingreso' },
    ],
  },
  {
    nombre: 'Rotacion ONE',
    descripcion: 'Evacuar 200 ONE + recibir 150 ONE',
    lineas: [
      { naviera: 'ONE', cantidad: 200, tipo: 'evacuacion' },
      { naviera: 'ONE', cantidad: 150, tipo: 'ingreso' },
    ],
  },
  {
    nombre: 'Evacuacion masiva multi-naviera',
    descripcion: 'Evacuar 150 de cada naviera principal',
    lineas: [
      { naviera: 'CMA CGM', cantidad: 150, tipo: 'evacuacion' },
      { naviera: 'Cosco Shipping', cantidad: 150, tipo: 'evacuacion' },
      { naviera: 'HMM', cantidad: 150, tipo: 'evacuacion' },
      { naviera: 'ONE', cantidad: 150, tipo: 'evacuacion' },
    ],
  },
  {
    nombre: 'Ingreso Wan Hai + PIL',
    descripcion: 'Recibir 250 Wan Hai + 100 PIL',
    lineas: [
      { naviera: 'Wan Hai', cantidad: 250, tipo: 'ingreso' },
      { naviera: 'PIL', cantidad: 100, tipo: 'ingreso' },
    ],
  },
];
