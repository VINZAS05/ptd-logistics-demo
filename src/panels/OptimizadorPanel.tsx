import { useState } from 'react';
import {
  Brain, Play, Trash2, Plus, ArrowDown, ArrowUp, Zap, Clock,
  TrendingDown, Package, ChevronRight, RotateCcw, Layers, Truck,
} from 'lucide-react';
import { NAVIERAS, type Naviera } from '../data/mockData';
import {
  type LineaOrden, type SolicitudOptimizacion, type ResultadoOptimizacion,
  type TipoOperacion, PRESETS_ORDENES,
} from '../data/optimizadorTypes';
import { optimizar } from '../utils/optimizador';

const navieraColor: Record<string, string> = {};
NAVIERAS.forEach(n => { navieraColor[n.nombre] = n.color; });

// ==========================================
// FORMULARIO DE ORDEN
// ==========================================
function FormularioOrden({
  onOptimizar,
}: {
  onOptimizar: (solicitud: SolicitudOptimizacion) => void;
}) {
  const [lineas, setLineas] = useState<LineaOrden[]>([
    { naviera: 'CMA CGM', cantidad: 100, tipo: 'ingreso' },
  ]);
  const [nombre, setNombre] = useState('');

  const addLinea = () => {
    setLineas([...lineas, { naviera: 'Cosco Shipping', cantidad: 50, tipo: 'ingreso' }]);
  };

  const removeLinea = (idx: number) => {
    if (lineas.length <= 1) return;
    setLineas(lineas.filter((_, i) => i !== idx));
  };

  const updateLinea = (idx: number, field: keyof LineaOrden, value: string | number) => {
    const newLineas = [...lineas];
    if (field === 'naviera') newLineas[idx].naviera = value as Naviera;
    else if (field === 'cantidad') newLineas[idx].cantidad = Math.max(1, Number(value));
    else if (field === 'tipo') newLineas[idx].tipo = value as TipoOperacion;
    setLineas(newLineas);
  };

  const cargarPreset = (idx: number) => {
    const preset = PRESETS_ORDENES[idx];
    setLineas([...preset.lineas]);
    setNombre(preset.nombre);
  };

  const totalIngresos = lineas.filter(l => l.tipo === 'ingreso').reduce((s, l) => s + l.cantidad, 0);
  const totalEvacuaciones = lineas.filter(l => l.tipo === 'evacuacion').reduce((s, l) => s + l.cantidad, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-800">Orden de Operacion</h3>
          </div>
          <div className="flex gap-1.5">
            {PRESETS_ORDENES.map((preset, i) => (
              <button
                key={i}
                onClick={() => cargarPreset(i)}
                className="px-2 py-1 text-[10px] bg-white border border-gray-200 rounded-md hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
                title={preset.descripcion}
              >
                {preset.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Nombre de la orden */}
        <input
          type="text"
          placeholder="Nombre de la orden (opcional)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
        />

        {/* Lineas de orden */}
        <div className="space-y-2">
          {lineas.map((linea, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
              {/* Tipo */}
              <select
                value={linea.tipo}
                onChange={(e) => updateLinea(idx, 'tipo', e.target.value)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${
                  linea.tipo === 'ingreso'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <option value="ingreso">Ingreso</option>
                <option value="evacuacion">Evacuacion</option>
              </select>

              {/* Cantidad */}
              <input
                type="number"
                min={1}
                max={1000}
                value={linea.cantidad}
                onChange={(e) => updateLinea(idx, 'cantidad', e.target.value)}
                className="w-20 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400"
              />

              <span className="text-xs text-gray-400">de</span>

              {/* Naviera */}
              <select
                value={linea.naviera}
                onChange={(e) => updateLinea(idx, 'naviera', e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:border-indigo-400"
              >
                {NAVIERAS.map(n => (
                  <option key={n.nombre} value={n.nombre}>{n.nombre}</option>
                ))}
              </select>

              {/* Color indicator */}
              <div className="w-4 h-4 rounded" style={{ backgroundColor: navieraColor[linea.naviera] }} />

              {/* Remove */}
              <button
                onClick={() => removeLinea(idx)}
                className="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add line + totals */}
        <div className="flex items-center justify-between">
          <button
            onClick={addLinea}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors"
          >
            <Plus size={12} />
            Agregar linea
          </button>

          <div className="flex gap-3 text-xs">
            {totalIngresos > 0 && (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <ArrowDown size={12} />
                {totalIngresos} ingreso
              </span>
            )}
            {totalEvacuaciones > 0 && (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <ArrowUp size={12} />
                {totalEvacuaciones} evacuacion
              </span>
            )}
          </div>
        </div>

        {/* Boton optimizar */}
        <button
          onClick={() => {
            onOptimizar({
              lineas,
              fechaObjetivo: new Date().toISOString().split('T')[0],
              nombre: nombre || undefined,
            });
          }}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl
            hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200
            flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={16} />
          Optimizar Operacion
        </button>
      </div>
    </div>
  );
}

// ==========================================
// METRICAS COMPARATIVAS
// ==========================================
function MetricasCard({ resultado }: { resultado: ResultadoOptimizacion }) {
  const { metricas, metricasBaseline, mejoraPct } = resultado;

  const cards = [
    {
      label: 'Rehandles',
      optimizado: metricas.rehandles,
      baseline: metricasBaseline.rehandles,
      mejora: mejoraPct,
      icon: <Layers size={16} className="text-indigo-500" />,
      color: 'indigo',
    },
    {
      label: 'Tiempo estimado',
      optimizado: metricas.tiempoEstimadoMin,
      baseline: metricasBaseline.tiempoEstimadoMin,
      mejora: metricasBaseline.tiempoEstimadoMin > 0
        ? Math.round((1 - metricas.tiempoEstimadoMin / metricasBaseline.tiempoEstimadoMin) * 1000) / 10
        : 0,
      icon: <Clock size={16} className="text-amber-500" />,
      suffix: 'min',
      color: 'amber',
    },
    {
      label: 'Movimientos totales',
      optimizado: metricas.totalMovimientos,
      baseline: metricasBaseline.totalMovimientos,
      mejora: metricasBaseline.totalMovimientos > 0
        ? Math.round((1 - metricas.totalMovimientos / metricasBaseline.totalMovimientos) * 1000) / 10
        : 0,
      icon: <Package size={16} className="text-emerald-500" />,
      color: 'emerald',
    },
    {
      label: 'Rehandles/evacuacion',
      optimizado: metricas.rehandlesPorEvacuacion,
      baseline: metricasBaseline.rehandlesPorEvacuacion,
      mejora: metricasBaseline.rehandlesPorEvacuacion > 0
        ? Math.round((1 - metricas.rehandlesPorEvacuacion / metricasBaseline.rehandlesPorEvacuacion) * 1000) / 10
        : 0,
      icon: <TrendingDown size={16} className="text-rose-500" />,
      color: 'rose',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            {card.icon}
            <span className="text-[11px] text-gray-500 font-medium">{card.label}</span>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <p className="text-2xl font-black text-gray-800">
                {typeof card.optimizado === 'number' && card.optimizado % 1 !== 0
                  ? card.optimizado.toFixed(2)
                  : card.optimizado.toLocaleString()}
                {card.suffix && <span className="text-sm text-gray-400 ml-1">{card.suffix}</span>}
              </p>
              <p className="text-[10px] text-gray-400">Optimizado</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 line-through">
                {typeof card.baseline === 'number' && card.baseline % 1 !== 0
                  ? card.baseline.toFixed(2)
                  : card.baseline.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">Sin optimizar</p>
            </div>
          </div>

          {card.mejora > 0 && (
            <div className="mt-2 flex items-center gap-1 bg-green-50 rounded-lg px-2 py-1">
              <TrendingDown size={10} className="text-green-600" />
              <span className="text-xs font-bold text-green-600">-{card.mejora}%</span>
              <span className="text-[10px] text-green-500">mejora</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// RESUMEN ANTES/DESPUES
// ==========================================
function ResumenComparativo({ resultado }: { resultado: ResultadoOptimizacion }) {
  const { estadoPatioPrevio, estadoPatioPost } = resultado;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          Estado ANTES
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Contenedores</span>
            <span className="font-bold text-gray-800">{estadoPatioPrevio.totalContenedores.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ocupacion</span>
            <span className="font-bold text-gray-800">{estadoPatioPrevio.ocupacionPct}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rehandles prom.</span>
            <span className="font-bold text-gray-800">{estadoPatioPrevio.rehandlesPromedio}</span>
          </div>
          <div className="mt-2 space-y-1">
            {estadoPatioPrevio.porNaviera.slice(0, 5).map(n => (
              <div key={n.naviera} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: navieraColor[n.naviera] }} />
                <span className="text-gray-500 flex-1">{n.naviera}</span>
                <span className="font-bold text-gray-700">{n.cantidad.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h4 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          Estado DESPUES
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Contenedores</span>
            <span className="font-bold text-gray-800">{estadoPatioPost.totalContenedores.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ocupacion</span>
            <span className="font-bold text-gray-800">{estadoPatioPost.ocupacionPct}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Rehandles prom.</span>
            <span className="font-bold text-green-600">{estadoPatioPost.rehandlesPromedio}</span>
          </div>
          <div className="mt-2 space-y-1">
            {estadoPatioPost.porNaviera.slice(0, 5).map(n => (
              <div key={n.naviera} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: navieraColor[n.naviera] }} />
                <span className="text-gray-500 flex-1">{n.naviera}</span>
                <span className="font-bold text-gray-700">{n.cantidad.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TABLA DE MOVIMIENTOS SECUENCIALES
// ==========================================
function TablaMovimientos({ resultado }: { resultado: ResultadoOptimizacion }) {
  const { movimientos } = resultado;
  const [expandido, setExpandido] = useState(false);
  const visibles = expandido ? movimientos : movimientos.slice(0, 20);

  const tipoColor = {
    ingreso: 'bg-green-100 text-green-700',
    evacuacion: 'bg-red-100 text-red-700',
    rehandle: 'bg-amber-100 text-amber-700',
  };

  const tipoIcon = {
    ingreso: <ArrowDown size={10} />,
    evacuacion: <ArrowUp size={10} />,
    rehandle: <RotateCcw size={10} />,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-gray-500" />
          <h3 className="text-sm font-bold text-gray-700">
            Secuencia de Movimientos ({movimientos.length} pasos)
          </h3>
        </div>
        <div className="flex gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            {movimientos.filter(m => m.tipo === 'ingreso').length} ingresos
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            {movimientos.filter(m => m.tipo === 'evacuacion').length} evacuaciones
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            {movimientos.filter(m => m.tipo === 'rehandle').length} rehandles
          </span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Tipo</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Contenedor</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Naviera</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Origen</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Destino</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium">Nota</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((mov) => (
              <tr key={mov.paso} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-2 font-mono text-gray-400">{mov.paso}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${tipoColor[mov.tipo]}`}>
                    {tipoIcon[mov.tipo]}
                    {mov.tipo}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-gray-700">{mov.contenedorId}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: navieraColor[mov.naviera] }} />
                    <span className="text-gray-600">{mov.naviera}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-500 font-mono">
                  {mov.origen ? `${mov.origen.islaId} F${mov.origen.fila}C${mov.origen.columna}N${mov.origen.nivel}` : '-'}
                </td>
                <td className="px-3 py-2 text-gray-500 font-mono">
                  {mov.destino ? `${mov.destino.islaId} F${mov.destino.fila}C${mov.destino.columna}N${mov.destino.nivel}` : 'SALIDA'}
                </td>
                <td className="px-3 py-2 text-gray-400">
                  {mov.rehandlesDe && <span className="text-amber-500">Para liberar {mov.rehandlesDe.slice(0, 10)}...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {movimientos.length > 20 && (
        <div className="px-5 py-2 border-t border-gray-100 text-center">
          <button
            onClick={() => setExpandido(!expandido)}
            className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1 mx-auto"
          >
            <ChevronRight size={12} className={`transition-transform ${expandido ? 'rotate-90' : ''}`} />
            {expandido ? 'Mostrar menos' : `Ver todos (${movimientos.length} movimientos)`}
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// MAPA DE POSICIONES RECOMENDADAS
// ==========================================
function MapaPosiciones({ resultado }: { resultado: ResultadoOptimizacion }) {
  const { posicionesIngreso, movimientos } = resultado;

  // Agrupar posiciones por isla
  const porIsla: Record<string, { ingresos: number; evacuaciones: number; rehandles: number; scoreAvg: number }> = {};

  for (const pos of posicionesIngreso) {
    const key = pos.posicion.islaId;
    if (!porIsla[key]) porIsla[key] = { ingresos: 0, evacuaciones: 0, rehandles: 0, scoreAvg: 0 };
    porIsla[key].ingresos++;
    porIsla[key].scoreAvg += pos.score;
  }

  for (const mov of movimientos) {
    if (mov.tipo === 'evacuacion' && mov.origen) {
      const key = mov.origen.islaId;
      if (!porIsla[key]) porIsla[key] = { ingresos: 0, evacuaciones: 0, rehandles: 0, scoreAvg: 0 };
      porIsla[key].evacuaciones++;
    }
    if (mov.tipo === 'rehandle' && mov.origen) {
      const key = mov.origen.islaId;
      if (!porIsla[key]) porIsla[key] = { ingresos: 0, evacuaciones: 0, rehandles: 0, scoreAvg: 0 };
      porIsla[key].rehandles++;
    }
  }

  // Calcular promedios
  for (const key of Object.keys(porIsla)) {
    if (porIsla[key].ingresos > 0) porIsla[key].scoreAvg = Math.round(porIsla[key].scoreAvg / porIsla[key].ingresos);
  }

  const islas = Object.entries(porIsla).sort((a, b) => (b[1].ingresos + b[1].evacuaciones) - (a[1].ingresos + a[1].evacuaciones));

  if (islas.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-700">Distribucion por Isla</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {islas.map(([islaId, data]) => {
            const total = data.ingresos + data.evacuaciones;
            return (
              <div key={islaId} className="rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">{islaId}</span>
                  {data.scoreAvg > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded font-bold">
                      Score {data.scoreAvg}
                    </span>
                  )}
                </div>

                {/* Barra visual */}
                <div className="flex gap-0.5 h-3 rounded overflow-hidden mb-2">
                  {data.ingresos > 0 && (
                    <div
                      className="bg-green-400 rounded-l"
                      style={{ width: `${(data.ingresos / total) * 100}%` }}
                    />
                  )}
                  {data.evacuaciones > 0 && (
                    <div
                      className="bg-red-400"
                      style={{ width: `${(data.evacuaciones / total) * 100}%` }}
                    />
                  )}
                  {data.rehandles > 0 && (
                    <div
                      className="bg-amber-400 rounded-r"
                      style={{ width: `${(data.rehandles / Math.max(total, 1)) * 100}%` }}
                    />
                  )}
                </div>

                <div className="flex gap-2 text-[10px]">
                  {data.ingresos > 0 && <span className="text-green-600">{data.ingresos} in</span>}
                  {data.evacuaciones > 0 && <span className="text-red-600">{data.evacuaciones} out</span>}
                  {data.rehandles > 0 && <span className="text-amber-600">{data.rehandles} reh</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SCORE DETALLE (top posiciones)
// ==========================================
function TopPosiciones({ resultado }: { resultado: ResultadoOptimizacion }) {
  const top = resultado.posicionesIngreso
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (top.length === 0) return null;

  const factores = ['clusteringNaviera', 'alturaStack', 'proximidadAcceso', 'lifoTemporal', 'pesoTamano'] as const;
  const factorLabels: Record<string, string> = {
    clusteringNaviera: 'Cluster',
    alturaStack: 'Altura',
    proximidadAcceso: 'Acceso',
    lifoTemporal: 'LIFO',
    pesoTamano: 'Peso',
  };
  const factorColors: Record<string, string> = {
    clusteringNaviera: '#6366f1',
    alturaStack: '#f59e0b',
    proximidadAcceso: '#10b981',
    lifoTemporal: '#3b82f6',
    pesoTamano: '#ec4899',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Top Posiciones (Score Detallado)</h3>
        <div className="flex gap-2">
          {factores.map(f => (
            <div key={f} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: factorColors[f] }} />
              <span className="text-[9px] text-gray-400">{factorLabels[f]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-4 gap-2">
        {top.map((pos, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-gray-500">{pos.posicion.islaId} F{pos.posicion.fila}C{pos.posicion.columna}</span>
              <span className="text-sm font-black text-indigo-600">{pos.score}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: navieraColor[pos.naviera] }} />
              <span className="text-[10px] text-gray-600">{pos.naviera}</span>
            </div>
            {/* Score bars */}
            <div className="mt-2 space-y-1">
              {factores.map(f => (
                <div key={f} className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400 w-8">{factorLabels[f]}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div className="h-full rounded-full" style={{
                      width: `${pos.scoreDetalle[f]}%`,
                      backgroundColor: factorColors[f],
                    }} />
                  </div>
                  <span className="text-[7px] text-gray-400 w-4 text-right">{pos.scoreDetalle[f]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// PANEL PRINCIPAL
// ==========================================
export default function OptimizadorPanel() {
  const [resultado, setResultado] = useState<ResultadoOptimizacion | null>(null);
  const [ejecutando, setEjecutando] = useState(false);

  const handleOptimizar = (solicitud: SolicitudOptimizacion) => {
    setEjecutando(true);
    // Simular delay para que se vea el loading
    setTimeout(() => {
      const result = optimizar(solicitud);
      setResultado(result);
      setEjecutando(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Header descriptivo */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Brain size={24} />
          <h2 className="text-lg font-bold">Optimizador de Operaciones</h2>
        </div>
        <p className="text-sm text-white/80 max-w-2xl">
          Define una orden de operacion (ingreso y/o evacuacion de contenedores por naviera) y el algoritmo
          calculara las posiciones optimas minimizando rehandles, tiempos de espera y costos operativos.
        </p>
      </div>

      {/* Formulario */}
      <FormularioOrden onOptimizar={handleOptimizar} />

      {/* Loading */}
      {ejecutando && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Calculando plan optimo...</p>
        </div>
      )}

      {/* Resultados */}
      {resultado && !ejecutando && (
        <>
          {/* Banner de mejora */}
          <div className={`rounded-xl p-4 flex items-center justify-between ${
            resultado.mejoraPct > 0
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                resultado.mejoraPct > 0 ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <TrendingDown size={20} className={resultado.mejoraPct > 0 ? 'text-green-600' : 'text-gray-500'} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {resultado.mejoraPct > 0
                    ? `${resultado.mejoraPct}% menos rehandles vs. colocacion sin optimizar`
                    : 'Operacion optimizada'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {resultado.metricas.totalMovimientos} movimientos en ~{resultado.metricas.tiempoEstimadoMin} minutos |
                  {' '}{resultado.solicitud.lineas.map(l => `${l.cantidad} ${l.naviera} (${l.tipo})`).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Metricas */}
          <MetricasCard resultado={resultado} />

          {/* Resumen antes/despues */}
          <ResumenComparativo resultado={resultado} />

          {/* Mapa de distribucion */}
          <MapaPosiciones resultado={resultado} />

          {/* Top posiciones con score */}
          <TopPosiciones resultado={resultado} />

          {/* Tabla de movimientos */}
          <TablaMovimientos resultado={resultado} />
        </>
      )}
    </div>
  );
}
