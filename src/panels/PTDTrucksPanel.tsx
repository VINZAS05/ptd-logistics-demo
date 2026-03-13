import { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Truck, Clock, AlertTriangle, Navigation,
  Zap, CheckCircle, XCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const kpis = [
  { label: 'Camiones activos', value: '47', sub: 'de 128 registrados', icon: <Truck size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'En ruta', value: '23', sub: 'PTD ↔ ConTeCon', icon: <Navigation size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Vel. promedio', value: '42', sub: 'km/h (flota)', icon: <Zap size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Tiempo medio', value: '38', sub: 'min por viaje', icon: <Clock size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Alertas hoy', value: '3', sub: '1 critica', icon: <AlertTriangle size={18} />, color: 'text-red-600', bg: 'bg-red-50' },
];

const camionesActivos = [
  { id: 'GPS-01', placa: 'JN-847-KL', transportista: 'Transportes Gomez', velocidad: 45, segmento: 'Jalipa → ConTeCon', estado: 'en_ruta', tiempo: 22, score: 92 },
  { id: 'GPS-02', placa: 'MZ-123-AB', transportista: 'Fletes del Pacifico', velocidad: 0, segmento: 'Zona Carga ConTeCon', estado: 'en_contecon', tiempo: 48, score: 85 },
  { id: 'GPS-03', placa: 'CL-456-XY', transportista: 'Carga Express Col.', velocidad: 52, segmento: 'PTD → Pancho Villa', estado: 'en_ruta', tiempo: 12, score: 78 },
  { id: 'GPS-04', placa: 'MZ-789-CD', transportista: 'Trans. Hernandez', velocidad: 48, segmento: 'Carretera Colima → PTD', estado: 'regreso', tiempo: 35, score: 88 },
  { id: 'GPS-05', placa: 'JN-321-EF', transportista: 'Autotransportes Silva', velocidad: 20, segmento: 'Salida PTD', estado: 'en_ruta', tiempo: 3, score: 95 },
  { id: 'GPS-06', placa: 'CL-654-GH', transportista: 'Fletes Colima', velocidad: 0, segmento: 'Pancho Villa', estado: 'parado', tiempo: 67, score: 62 },
  { id: 'GPS-07', placa: 'MZ-555-JK', transportista: 'Logistica Manzanillo', velocidad: 38, segmento: 'Jalipa → Carr. Colima', estado: 'en_ruta', tiempo: 28, score: 91 },
  { id: 'GPS-08', placa: 'JN-999-LM', transportista: 'Trans. Pacifica', velocidad: 0, segmento: 'Zona Descarga PTD', estado: 'en_patio', tiempo: 15, score: 87 },
];

const geocercas = [
  { nombre: 'Salida PTD', km: 0, camiones: 3, color: '#28A050' },
  { nombre: 'Pancho Villa', km: 3, camiones: 5, color: '#4682C8' },
  { nombre: 'Jalipa', km: 8, camiones: 8, color: '#4682C8' },
  { nombre: 'Carr. Colima', km: 12, camiones: 6, color: '#4682C8' },
  { nombre: 'Entrada ConTeCon', km: 14, camiones: 4, color: '#E67E22' },
];

const tiemposPorHora = [
  { hora: '06:00', real: 35, optimo: 32, camiones: 8 },
  { hora: '07:00', real: 38, optimo: 32, camiones: 12 },
  { hora: '08:00', real: 52, optimo: 32, camiones: 18 },
  { hora: '09:00', real: 45, optimo: 32, camiones: 15 },
  { hora: '10:00', real: 40, optimo: 32, camiones: 14 },
  { hora: '11:00', real: 38, optimo: 32, camiones: 10 },
  { hora: '12:00', real: 42, optimo: 32, camiones: 16 },
  { hora: '13:00', real: 55, optimo: 32, camiones: 20 },
  { hora: '14:00', real: 48, optimo: 32, camiones: 17 },
  { hora: '15:00', real: 43, optimo: 32, camiones: 13 },
  { hora: '16:00', real: 36, optimo: 32, camiones: 9 },
  { hora: '17:00', real: 34, optimo: 32, camiones: 6 },
];

const tiemposCarga = [
  { zona: 'Carga ConTeCon', promedio: 85, objetivo: 60 },
  { zona: 'Descarga PTD', promedio: 42, objetivo: 30 },
  { zona: 'Espera Gate PTD', promedio: 18, objetivo: 10 },
  { zona: 'Espera Gate ConTeCon', promedio: 22, objetivo: 15 },
];

const alertasRecientes = [
  { tipo: 'critical', icon: <XCircle size={14} />, msg: 'Camion CL-654-GH parado >60 min en Pancho Villa', hora: '10:32' },
  { tipo: 'warning', icon: <AlertTriangle size={14} />, msg: 'MZ-555-JK velocidad 78 km/h en Carretera Colima', hora: '10:15' },
  { tipo: 'info', icon: <CheckCircle size={14} />, msg: 'GPS-04 completo viaje PTD→ConTeCon en 38 min', hora: '09:58' },
];

const scoreDistribucion = [
  { rango: '90-100', count: 32, color: '#28A050' },
  { rango: '70-89', count: 58, color: '#F59E0B' },
  { rango: '50-69', count: 28, color: '#E67E22' },
  { rango: '<50', count: 10, color: '#EF4444' },
];

// ---------------------------------------------------------------------------

const ESTADO_BADGE: Record<string, { label: string; class: string }> = {
  en_ruta: { label: 'En Ruta', class: 'bg-green-100 text-green-700' },
  en_contecon: { label: 'En ConTeCon', class: 'bg-blue-100 text-blue-700' },
  regreso: { label: 'Regreso', class: 'bg-amber-100 text-amber-700' },
  en_patio: { label: 'En Patio', class: 'bg-gray-100 text-gray-600' },
  parado: { label: 'Parado', class: 'bg-red-100 text-red-700' },
};

export default function PTDTrucksPanel() {
  const [sortBy, setSortBy] = useState<'velocidad' | 'tiempo' | 'score'>('tiempo');

  const sorted = [...camionesActivos].sort((a, b) =>
    sortBy === 'tiempo' ? b.tiempo - a.tiempo :
    sortBy === 'velocidad' ? b.velocidad - a.velocidad :
    a.score - b.score
  );

  return (
    <div className="space-y-5">
      {/* AI Prediction */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3 flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Zap size={16} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-indigo-700">PTD Trucks — Prediccion en tiempo real</p>
          <p className="text-[11px] text-indigo-600 mt-0.5">
            Hora optima de despacho: <strong>06:00-07:00</strong> y <strong>16:00-17:00</strong> (38 min promedio).
            Evitar 08:00-09:00 y 13:00-14:00 (52-55 min). Camion CL-654-GH lleva 67 min parado — posible anomalia.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-gray-500 uppercase">{k.label}</span>
              <div className={`w-7 h-7 ${k.bg} rounded-lg flex items-center justify-center ${k.color}`}>{k.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{k.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Transit time by hour */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Tiempo de transito por hora (PTD ↔ ConTeCon)</h3>
            <span className="text-[10px] text-gray-400">Hoy</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={tiemposPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'min', position: 'insideTopLeft', style: { fontSize: 10 } }} />
              <Tooltip formatter={(v, n) => [`${v} min`, n === 'optimo' ? 'Optimo' : 'Tiempo real']} />
              <Area type="monotone" dataKey="real" stroke="#4682C8" fill="#4682C8" fillOpacity={0.15} strokeWidth={2} name="Tiempo real" />
              <Area type="monotone" dataKey="optimo" stroke="#28A050" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Optimo" />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trucks per geofence */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Camiones por geocerca</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={geocercas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 9 }} width={85} />
              <Tooltip formatter={(v) => [`${v} camiones`]} />
              <Bar dataKey="camiones" fill="#4682C8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route schematic */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ruta PTD → ConTeCon (14 km)</h3>
        <div className="flex items-center justify-between px-4">
          {geocercas.map((g, i) => (
            <div key={g.nombre} className="flex flex-col items-center">
              <div className="flex items-center">
                {i > 0 && <div className="w-16 h-0.5 bg-gray-200 -mr-1" />}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: g.color }}
                >
                  {g.camiones}
                </div>
                {i < geocercas.length - 1 && <div className="w-16 h-0.5 bg-gray-200 -ml-1" />}
              </div>
              <p className="text-[9px] text-gray-500 mt-1 text-center leading-tight">{g.nombre}</p>
              <p className="text-[8px] text-gray-400">km {g.km}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trucks table + sidebar */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active trucks table */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Camiones con GPS activo</h3>
            <div className="flex gap-1">
              {(['tiempo', 'velocidad', 'score'] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-[10px] px-2 py-0.5 rounded ${sortBy === s ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-400 hover:bg-gray-50'}`}
                >{s === 'tiempo' ? 'Tiempo' : s === 'velocidad' ? 'Velocidad' : 'Score'}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase border-b">
                <th className="text-left py-1.5">Placa</th>
                <th className="text-left py-1.5">Transportista</th>
                <th className="text-left py-1.5">Segmento</th>
                <th className="text-center py-1.5">Vel.</th>
                <th className="text-center py-1.5">Tiempo</th>
                <th className="text-center py-1.5">Score</th>
                <th className="text-center py-1.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => {
                const badge = ESTADO_BADGE[c.estado] || ESTADO_BADGE.en_patio;
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-1.5 font-semibold text-gray-700">{c.placa}</td>
                    <td className="py-1.5 text-gray-600">{c.transportista}</td>
                    <td className="py-1.5 text-gray-500">{c.segmento}</td>
                    <td className="py-1.5 text-center font-medium">
                      <span className={c.velocidad > 70 ? 'text-red-600' : 'text-gray-700'}>{c.velocidad}</span>
                      <span className="text-gray-400 text-[9px]"> km/h</span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className={c.tiempo > 60 ? 'text-red-600 font-semibold' : 'text-gray-700'}>{c.tiempo}</span>
                      <span className="text-gray-400 text-[9px]"> min</span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className={`font-semibold ${c.score >= 90 ? 'text-green-600' : c.score >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {c.score}
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${badge.class}`}>{badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sidebar: alerts + loading times + score dist */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Alertas recientes</h3>
            <div className="space-y-2">
              {alertasRecientes.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] ${
                  a.tipo === 'critical' ? 'bg-red-50 text-red-700' :
                  a.tipo === 'warning' ? 'bg-amber-50 text-amber-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  <span className="mt-0.5">{a.icon}</span>
                  <div className="flex-1">
                    <p>{a.msg}</p>
                    <p className="text-[9px] opacity-60 mt-0.5">{a.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading/unloading times */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tiempos carga/descarga</h3>
            <div className="space-y-2">
              {tiemposCarga.map((t) => (
                <div key={t.zona} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600 w-28">{t.zona}</span>
                  <div className="flex-1 mx-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.promedio > t.objetivo * 1.5 ? 'bg-red-400' : t.promedio > t.objetivo ? 'bg-amber-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min((t.promedio / (t.objetivo * 2)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 w-12 text-right">{t.promedio} min</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Distribucion de scores</h3>
            <div className="space-y-1.5">
              {scoreDistribucion.map((s) => (
                <div key={s.rango} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-10">{s.rango}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / 60) * 100}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
