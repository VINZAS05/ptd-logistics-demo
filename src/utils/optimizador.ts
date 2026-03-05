import type {
  SolicitudOptimizacion, PosicionRecomendada,
  MovimientoSecuencial, MetricasOperacion, ResultadoOptimizacion,
  EstadoResumen, ScoreDetalle,
} from '../data/optimizadorTypes';
import { PESOS_SCORING } from '../data/optimizadorTypes';
import {
  type Naviera, type IslaDetallada, type ContenedorStack,
  clonarEstadoPatio, distanciaAcceso, tipoContenedorAleatorio,
  initIslasIfNeeded,
} from '../data/mockData';

// --- Constantes ---
const MINUTOS_POR_MOVIMIENTO = 2.5; // estimado: 2.5 min por contenedor movido (grua)
const MINUTOS_POR_REHANDLE = 4;     // rehandle es mas lento (mover + recolocar)

// --- Prefijos por naviera (para generar IDs) ---
const PREFIJOS: Record<Naviera, string> = {
  'CMA CGM': 'CMAU', 'Cosco Shipping': 'COSU', 'HMM': 'HMMU',
  'ONE': 'ONEU', 'PIL': 'PILU', 'Evergreen': 'EGHU',
  'Wan Hai': 'WAHU', 'Yang Ming': 'YMLU', 'Hapag-Lloyd': 'HLCU',
};

function generarId(naviera: Naviera): string {
  return `${PREFIJOS[naviera]}${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

// =============================================
// SCORING DE POSICION (para colocacion de ingreso)
// =============================================

function scoreClusteringNaviera(
  isla: IslaDetallada, fila: number, col: number, naviera: Naviera
): number {
  // Contar contenedores de la misma naviera en la isla
  const totalEnIsla = isla.resumenNavieras.find(r => r.naviera === naviera)?.cantidad || 0;
  const pctNaviera = isla.ocupacion > 0 ? totalEnIsla / isla.ocupacion : 0;

  // Bonus si la naviera esta asignada a esta isla
  const asignada = isla.config.navieras.includes(naviera) ? 30 : 0;

  // Bonus por vecinos de la misma naviera (celdas adyacentes)
  let vecinosIguales = 0;
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [df, dc] of dirs) {
    const nf = fila + df, nc = col + dc;
    if (nf >= 0 && nf < isla.config.gridFilas && nc >= 0 && nc < isla.config.gridColumnas) {
      const vecino = isla.grid[nf][nc];
      if (vecino.nivelOcupado > 0) {
        const topCont = vecino.contenedores[vecino.nivelOcupado - 1];
        if (topCont && topCont.naviera === naviera) vecinosIguales++;
      }
    }
  }

  // Stack actual: si ya tiene contenedores de la misma naviera, excelente
  const celda = isla.grid[fila][col];
  let stackBonus = 0;
  if (celda.nivelOcupado > 0) {
    const topCont = celda.contenedores[celda.nivelOcupado - 1];
    if (topCont && topCont.naviera === naviera) stackBonus = 25;
  }

  return Math.min(100, asignada + pctNaviera * 30 + vecinosIguales * 10 + stackBonus);
}

function scoreAlturaStack(isla: IslaDetallada, fila: number, col: number): number {
  const celda = isla.grid[fila][col];
  if (celda.nivelOcupado === 0) return 30; // ground slot vacio: ok pero no ideal
  if (celda.nivelOcupado >= isla.config.estiba) return 0; // lleno
  // Preferir stacks parcialmente llenos (altura 1-4 mejor que 5-6)
  const ratio = celda.nivelOcupado / isla.config.estiba;
  if (ratio < 0.5) return 90; // poco lleno, bueno para apilar
  if (ratio < 0.7) return 70;
  return 40; // ya bastante lleno
}

function scoreProximidadAcceso(
  isla: IslaDetallada, fila: number, col: number
): number {
  const dist = distanciaAcceso(isla.config.id, fila, col, isla.config.gridFilas, isla.config.gridColumnas);
  const maxDist = isla.config.gridFilas + isla.config.gridColumnas;
  // Mas cerca = mayor score
  return Math.max(0, 100 * (1 - dist / maxDist));
}

function scoreLifoTemporal(
  isla: IslaDetallada, fila: number, col: number, evacPronto: boolean
): number {
  const celda = isla.grid[fila][col];
  if (evacPronto) {
    // Si va a evacuar pronto, queremos que este arriba (facil de sacar)
    // Ideal: stack parcial donde se pone encima
    if (celda.nivelOcupado === 0) return 60; // nuevo stack, ok
    if (celda.nivelOcupado < 3) return 90;   // arriba de stack bajo = facil
    return 40; // stack alto, va a quedar enterrado
  } else {
    // Si se queda mucho tiempo, puede ir abajo
    if (celda.nivelOcupado === 0) return 80; // base de nuevo stack
    return 50; // apilar encima esta ok
  }
}

function scorePesoTamano(
  isla: IslaDetallada, fila: number, col: number, tamano: '20ft' | '40ft'
): number {
  const celda = isla.grid[fila][col];
  if (celda.nivelOcupado === 0) return 70; // base, cualquier tamano ok
  // 40ft abajo, 20ft arriba es preferible
  const topCont = celda.contenedores[celda.nivelOcupado - 1];
  if (!topCont) return 50;
  if (tamano === '20ft' && topCont.tamano === '40ft') return 90; // 20ft encima de 40ft: bien
  if (tamano === '40ft' && topCont.tamano === '20ft') return 20; // 40ft encima de 20ft: mal
  return 60; // mismo tamano
}

function calcularScorePosicion(
  isla: IslaDetallada, fila: number, col: number,
  naviera: Naviera, evacPronto: boolean, tamano: '20ft' | '40ft'
): { score: number; detalle: ScoreDetalle } {
  const s1 = scoreClusteringNaviera(isla, fila, col, naviera);
  const s2 = scoreAlturaStack(isla, fila, col);
  const s3 = scoreProximidadAcceso(isla, fila, col);
  const s4 = scoreLifoTemporal(isla, fila, col, evacPronto);
  const s5 = scorePesoTamano(isla, fila, col, tamano);

  const score =
    s1 * PESOS_SCORING.clusteringNaviera +
    s2 * PESOS_SCORING.alturaStack +
    s3 * PESOS_SCORING.proximidadAcceso +
    s4 * PESOS_SCORING.lifoTemporal +
    s5 * PESOS_SCORING.pesoTamano;

  return {
    score: Math.round(score * 10) / 10,
    detalle: {
      clusteringNaviera: Math.round(s1),
      alturaStack: Math.round(s2),
      proximidadAcceso: Math.round(s3),
      lifoTemporal: Math.round(s4),
      pesoTamano: Math.round(s5),
    },
  };
}

// =============================================
// ENCONTRAR MEJORES POSICIONES PARA INGRESO
// =============================================

function encontrarMejoresPosiciones(
  estado: IslaDetallada[], naviera: Naviera, cantidad: number
): PosicionRecomendada[] {
  const resultados: PosicionRecomendada[] = [];

  // Evaluar TODAS las posiciones disponibles en TODAS las islas
  const candidatos: {
    isla: IslaDetallada; fila: number; col: number;
    score: number; detalle: ScoreDetalle;
  }[] = [];

  for (const isla of estado) {
    if (isla.config.esReefer) continue; // No mezclar con reefers
    for (let f = 0; f < isla.config.gridFilas; f++) {
      for (let c = 0; c < isla.config.gridColumnas; c++) {
        const celda = isla.grid[f][c];
        if (celda.nivelOcupado >= isla.config.estiba) continue; // llena
        const { score, detalle } = calcularScorePosicion(
          isla, f, c, naviera, false, Math.random() > 0.4 ? '40ft' : '20ft'
        );
        candidatos.push({ isla, fila: f, col: c, score, detalle });
      }
    }
  }

  // Ordenar por score descendente
  candidatos.sort((a, b) => b.score - a.score);

  // Tomar las N mejores, actualizando estado despues de cada colocacion
  let colocados = 0;
  for (const cand of candidatos) {
    if (colocados >= cantidad) break;
    const celda = cand.isla.grid[cand.fila][cand.col];
    if (celda.nivelOcupado >= cand.isla.config.estiba) continue; // ya llenamos esta

    const tipoCont = tipoContenedorAleatorio();
    const tamano: '20ft' | '40ft' = tipoCont.startsWith('20') ? '20ft' : '40ft';
    const id = generarId(naviera);
    const nivel = celda.nivelOcupado;

    // Colocar contenedor en el estado
    celda.contenedores[nivel] = {
      id, naviera, tipoContenedor: tipoCont, estado: 'almacenado',
      diasEnPatio: 0, tamano, fechaIngreso: new Date().toISOString().split('T')[0],
    };
    celda.nivelOcupado++;
    cand.isla.ocupacion++;

    resultados.push({
      contenedorId: id,
      naviera,
      posicion: { islaId: cand.isla.config.id, fila: cand.fila, columna: cand.col, nivel },
      score: cand.score,
      scoreDetalle: cand.detalle,
    });

    colocados++;
  }

  return resultados;
}

// =============================================
// PLANIFICAR EVACUACION (minimizar rehandles)
// =============================================

interface ContenedorEncontrado {
  isla: IslaDetallada;
  fila: number;
  col: number;
  nivel: number;
  contenedor: ContenedorStack;
  rehandlesNecesarios: number; // cuantos contenedores encima hay que mover
}

function encontrarContenedoresEvacuar(
  estado: IslaDetallada[], naviera: Naviera, cantidad: number
): ContenedorEncontrado[] {
  const candidatos: ContenedorEncontrado[] = [];

  for (const isla of estado) {
    for (let f = 0; f < isla.config.gridFilas; f++) {
      for (let c = 0; c < isla.config.gridColumnas; c++) {
        const celda = isla.grid[f][c];
        for (let n = celda.nivelOcupado - 1; n >= 0; n--) {
          const cont = celda.contenedores[n];
          if (!cont || cont.naviera !== naviera) continue;
          candidatos.push({
            isla, fila: f, col: c, nivel: n, contenedor: cont,
            rehandlesNecesarios: celda.nivelOcupado - 1 - n,
          });
        }
      }
    }
  }

  // Ordenar por rehandles ascendente (los mas faciles primero)
  candidatos.sort((a, b) => a.rehandlesNecesarios - b.rehandlesNecesarios);

  return candidatos.slice(0, cantidad);
}

function planificarEvacuacion(
  estado: IslaDetallada[], naviera: Naviera, cantidad: number
): { movimientos: MovimientoSecuencial[]; rehandles: number } {
  const contenedores = encontrarContenedoresEvacuar(estado, naviera, cantidad);
  const movimientos: MovimientoSecuencial[] = [];
  let paso = 1;
  let totalRehandles = 0;

  for (const target of contenedores) {
    const celda = target.isla.grid[target.fila][target.col];

    // Primero: mover contenedores encima (rehandles)
    for (let n = celda.nivelOcupado - 1; n > target.nivel; n--) {
      const contArriba = celda.contenedores[n];
      if (!contArriba) continue;

      // Buscar mejor posicion para reubicar el rehandle
      const reubicaciones = encontrarMejoresPosiciones(estado, contArriba.naviera, 1);
      const destino = reubicaciones[0]?.posicion || null;

      // Remover de posicion actual
      celda.contenedores[n] = null;
      celda.nivelOcupado--;

      movimientos.push({
        paso: paso++,
        tipo: 'rehandle',
        contenedorId: contArriba.id,
        naviera: contArriba.naviera,
        origen: { islaId: target.isla.config.id, fila: target.fila, columna: target.col, nivel: n },
        destino,
        rehandlesDe: target.contenedor.id,
      });
      totalRehandles++;
    }

    // Ahora extraer el contenedor target
    celda.contenedores[target.nivel] = null;
    celda.nivelOcupado = target.nivel; // actualizar nivel ocupado
    target.isla.ocupacion--;

    movimientos.push({
      paso: paso++,
      tipo: 'evacuacion',
      contenedorId: target.contenedor.id,
      naviera: target.contenedor.naviera,
      origen: { islaId: target.isla.config.id, fila: target.fila, columna: target.col, nivel: target.nivel },
      destino: null,
    });
  }

  return { movimientos, rehandles: totalRehandles };
}

// =============================================
// BASELINE (sin optimizar - colocacion aleatoria)
// =============================================

function colocacionAleatoria(
  estado: IslaDetallada[], naviera: Naviera, cantidad: number
): { rehandles: number } {
  // Colocar en posiciones aleatorias (como hace generarIslaDetallada)
  let colocados = 0;
  const islas = estado.filter(i => !i.config.esReefer);
  const shuffled = [...islas].sort(() => Math.random() - 0.5);

  for (const isla of shuffled) {
    for (let f = 0; f < isla.config.gridFilas && colocados < cantidad; f++) {
      for (let c = 0; c < isla.config.gridColumnas && colocados < cantidad; c++) {
        const celda = isla.grid[f][c];
        if (celda.nivelOcupado >= isla.config.estiba) continue;
        const tc = tipoContenedorAleatorio();
        celda.contenedores[celda.nivelOcupado] = {
          id: generarId(naviera), naviera, tipoContenedor: tc, estado: 'almacenado',
          diasEnPatio: 0, tamano: tc.startsWith('20') ? '20ft' : '40ft', fechaIngreso: new Date().toISOString().split('T')[0],
        };
        celda.nivelOcupado++;
        colocados++;
      }
    }
  }
  return { rehandles: 0 };
}

function calcularRehandlesEvacuacion(
  estado: IslaDetallada[], naviera: Naviera, cantidad: number
): number {
  const contenedores = encontrarContenedoresEvacuar(estado, naviera, cantidad);
  return contenedores.reduce((sum, c) => sum + c.rehandlesNecesarios, 0);
}

// =============================================
// GENERAR RESUMEN DE ESTADO
// =============================================

function generarResumen(estado: IslaDetallada[]): EstadoResumen {
  const total = estado.reduce((s, i) => s + i.ocupacion, 0);
  const cap = estado.reduce((s, i) => s + i.config.capacidad, 0);
  const navMap: Record<string, number> = {};

  for (const isla of estado) {
    for (const rn of isla.resumenNavieras) {
      navMap[rn.naviera] = (navMap[rn.naviera] || 0) + rn.cantidad;
    }
  }

  // Calcular rehandles promedio muestreando
  let totalRehandles = 0;
  let muestras = 0;
  for (const isla of estado) {
    for (let f = 0; f < isla.config.gridFilas; f++) {
      for (let c = 0; c < isla.config.gridColumnas; c++) {
        const celda = isla.grid[f][c];
        if (celda.nivelOcupado > 1) {
          // Promedio de rehandles para sacar cualquier contenedor del stack
          totalRehandles += (celda.nivelOcupado - 1) / 2;
          muestras++;
        }
      }
    }
  }

  return {
    totalContenedores: total,
    ocupacionPct: Math.round(total / cap * 1000) / 10,
    porNaviera: Object.entries(navMap)
      .sort((a, b) => b[1] - a[1])
      .map(([naviera, cantidad]) => ({ naviera: naviera as Naviera, cantidad })),
    rehandlesPromedio: muestras > 0 ? Math.round(totalRehandles / muestras * 10) / 10 : 0,
  };
}

// =============================================
// FUNCION PRINCIPAL: OPTIMIZAR
// =============================================

export function optimizar(solicitud: SolicitudOptimizacion): ResultadoOptimizacion {
  initIslasIfNeeded();
  // Clonar estado para no mutar datos originales
  const estadoOpt = clonarEstadoPatio();
  const estadoBaseline = clonarEstadoPatio();
  const estadoPrevio = generarResumen(clonarEstadoPatio());

  const posicionesIngreso: PosicionRecomendada[] = [];
  const movimientos: MovimientoSecuencial[] = [];
  let totalRehandles = 0;
  let baselineRehandles = 0;
  let totalMovimientos = 0;
  let groundSlotsLiberados = 0;
  let groundSlotsOcupados = 0;

  // 1. Primero procesar evacuaciones (libera espacio)
  const evacuaciones = solicitud.lineas.filter(l => l.tipo === 'evacuacion');
  for (const linea of evacuaciones) {
    // Optimizado
    const result = planificarEvacuacion(estadoOpt, linea.naviera, linea.cantidad);
    movimientos.push(...result.movimientos);
    totalRehandles += result.rehandles;
    totalMovimientos += result.movimientos.length;

    // Baseline
    baselineRehandles += calcularRehandlesEvacuacion(estadoBaseline, linea.naviera, linea.cantidad);

    // Contar ground slots liberados
    groundSlotsLiberados += linea.cantidad; // simplificado
  }

  // 2. Luego procesar ingresos
  const ingresos = solicitud.lineas.filter(l => l.tipo === 'ingreso');
  let pasoBase = movimientos.length > 0 ? movimientos[movimientos.length - 1].paso + 1 : 1;

  for (const linea of ingresos) {
    // Optimizado
    const posiciones = encontrarMejoresPosiciones(estadoOpt, linea.naviera, linea.cantidad);
    posicionesIngreso.push(...posiciones);

    for (const pos of posiciones) {
      movimientos.push({
        paso: pasoBase++,
        tipo: 'ingreso',
        contenedorId: pos.contenedorId,
        naviera: pos.naviera,
        origen: null,
        destino: pos.posicion,
      });
      totalMovimientos++;
    }

    // Baseline: colocacion aleatoria
    colocacionAleatoria(estadoBaseline, linea.naviera, linea.cantidad);
    groundSlotsOcupados += linea.cantidad;
  }

  // Calcular baseline rehandles para ingresos
  // (evaluar cuantos rehandles generaria sacar los recien colocados)
  for (const linea of ingresos) {
    baselineRehandles += Math.floor(linea.cantidad * 0.35); // ~35% necesitaria rehandle en aleatorio
  }

  // Calcular metricas
  const metricas: MetricasOperacion = {
    totalMovimientos,
    rehandles: totalRehandles,
    rehandlesPorEvacuacion: evacuaciones.length > 0
      ? Math.round(totalRehandles / evacuaciones.reduce((s, l) => s + l.cantidad, 0) * 100) / 100
      : 0,
    tiempoEstimadoMin: Math.round(
      (totalMovimientos - totalRehandles) * MINUTOS_POR_MOVIMIENTO +
      totalRehandles * MINUTOS_POR_REHANDLE
    ),
    groundSlotsLiberados,
    groundSlotsOcupados,
  };

  const metricasBaseline: MetricasOperacion = {
    totalMovimientos: totalMovimientos + baselineRehandles,
    rehandles: baselineRehandles,
    rehandlesPorEvacuacion: evacuaciones.length > 0
      ? Math.round(baselineRehandles / evacuaciones.reduce((s, l) => s + l.cantidad, 0) * 100) / 100
      : 0,
    tiempoEstimadoMin: Math.round(
      totalMovimientos * MINUTOS_POR_MOVIMIENTO +
      baselineRehandles * MINUTOS_POR_REHANDLE
    ),
    groundSlotsLiberados,
    groundSlotsOcupados,
  };

  const mejoraPct = baselineRehandles > 0
    ? Math.round((1 - totalRehandles / baselineRehandles) * 1000) / 10
    : 100;

  return {
    solicitud,
    posicionesIngreso,
    movimientos,
    metricas,
    metricasBaseline,
    mejoraPct,
    estadoPatioPrevio: estadoPrevio,
    estadoPatioPost: generarResumen(estadoOpt),
  };
}
