import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import {
  Truck, ShieldCheck, AlertTriangle, Brain, Phone, TrendingUp,
  CalendarCheck, Clock, UserX, ChevronDown, ChevronUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock data (inline)
// ---------------------------------------------------------------------------

interface Transportista {
  ranking: number;
  empresa: string;
  operador: string;
  telefono: string;
  viajesMes: number;
  completados: number;
  noShows: number;
  fiabilidad: number;
  clasificacion: 'fiable' | 'regular' | 'riesgo';
  ultimaActividad: string;
}

const transportistas: Transportista[] = [
  { ranking: 1, empresa: 'Transportes Gomez', operador: 'Juan Carlos Gomez', telefono: '314-112-3344', viajesMes: 48, completados: 47, noShows: 1, fiabilidad: 97.9, clasificacion: 'fiable', ultimaActividad: 'Hoy 08:15' },
  { ranking: 2, empresa: 'Fletes del Pacifico', operador: 'Roberto Sanchez M.', telefono: '314-223-5567', viajesMes: 52, completados: 50, noShows: 2, fiabilidad: 96.2, clasificacion: 'fiable', ultimaActividad: 'Hoy 09:30' },
  { ranking: 3, empresa: 'Logistica Manzanillo', operador: 'Miguel A. Torres', telefono: '314-331-7890', viajesMes: 44, completados: 42, noShows: 2, fiabilidad: 95.5, clasificacion: 'fiable', ultimaActividad: 'Hoy 07:45' },
  { ranking: 4, empresa: 'Autotransportes Silva', operador: 'Fernando Silva R.', telefono: '312-445-1122', viajesMes: 39, completados: 37, noShows: 2, fiabilidad: 94.9, clasificacion: 'fiable', ultimaActividad: 'Ayer 17:20' },
  { ranking: 5, empresa: 'Carga Express Colima', operador: 'Luis E. Cervantes', telefono: '312-556-3344', viajesMes: 41, completados: 38, noShows: 3, fiabilidad: 92.7, clasificacion: 'fiable', ultimaActividad: 'Hoy 10:05' },
  { ranking: 6, empresa: 'Trans. Hernandez', operador: 'Hector Hernandez P.', telefono: '314-667-5566', viajesMes: 36, completados: 33, noShows: 3, fiabilidad: 91.7, clasificacion: 'fiable', ultimaActividad: 'Hoy 08:50' },
  { ranking: 7, empresa: 'Fletes Colima', operador: 'Armando Diaz L.', telefono: '312-778-7788', viajesMes: 33, completados: 30, noShows: 3, fiabilidad: 90.9, clasificacion: 'fiable', ultimaActividad: 'Ayer 16:30' },
  { ranking: 8, empresa: 'Trans. Lopez', operador: 'Ricardo Lopez V.', telefono: '314-889-9900', viajesMes: 38, completados: 33, noShows: 5, fiabilidad: 86.8, clasificacion: 'regular', ultimaActividad: 'Hoy 09:15' },
  { ranking: 9, empresa: 'Transportes El Puerto', operador: 'Jose M. Navarro', telefono: '314-990-1122', viajesMes: 30, completados: 26, noShows: 4, fiabilidad: 86.7, clasificacion: 'regular', ultimaActividad: 'Hoy 07:30' },
  { ranking: 10, empresa: 'Mudanzas y Fletes Ramirez', operador: 'Carlos Ramirez O.', telefono: '312-101-3344', viajesMes: 28, completados: 23, noShows: 5, fiabilidad: 82.1, clasificacion: 'regular', ultimaActividad: 'Ayer 15:10' },
  { ranking: 11, empresa: 'Autotransportes Costa', operador: 'Eduardo Costa B.', telefono: '314-212-5566', viajesMes: 25, completados: 20, noShows: 5, fiabilidad: 80.0, clasificacion: 'regular', ultimaActividad: 'Hoy 10:40' },
  { ranking: 12, empresa: 'Fletes Martinez Hnos.', operador: 'Oscar Martinez G.', telefono: '312-323-7788', viajesMes: 32, completados: 25, noShows: 7, fiabilidad: 78.1, clasificacion: 'regular', ultimaActividad: 'Ayer 14:20' },
  { ranking: 13, empresa: 'Trans. Oceano Pacifico', operador: 'Pablo Ruiz S.', telefono: '314-434-9900', viajesMes: 22, completados: 15, noShows: 7, fiabilidad: 68.2, clasificacion: 'riesgo', ultimaActividad: 'Hace 3 dias' },
  { ranking: 14, empresa: 'Carga Segura Manzanillo', operador: 'Sergio Medina T.', telefono: '314-545-1133', viajesMes: 18, completados: 12, noShows: 6, fiabilidad: 66.7, clasificacion: 'riesgo', ultimaActividad: 'Hace 2 dias' },
  { ranking: 15, empresa: 'Transportes del Valle', operador: 'Antonio Valle C.', telefono: '312-656-2244', viajesMes: 20, completados: 12, noShows: 8, fiabilidad: 60.0, clasificacion: 'riesgo', ultimaActividad: 'Hace 5 dias' },
];

const fiabilidadChart = transportistas.slice(0, 15).map(t => ({
  empresa: t.empresa.replace('Transportes ', 'T. ').replace('Autotransportes ', 'A. ').replace('Mudanzas y Fletes ', 'M.F. ').replace('Trans. Oceano ', 'T.O. ').replace('Carga Segura ', 'C.S. ').replace('Fletes ', 'F. ').replace('Logistica ', 'Log. ').replace('Carga Express ', 'C.E. '),
  fiabilidad: t.fiabilidad,
}));

const weeklyTrend = [
  { semana: 'S1 Ene', convocados: 260, presentados: 224, noShows: 36 },
  { semana: 'S2 Ene', convocados: 275, presentados: 235, noShows: 40 },
  { semana: 'S3 Ene', convocados: 290, presentados: 252, noShows: 38 },
  { semana: 'S4 Ene', convocados: 280, presentados: 238, noShows: 42 },
  { semana: 'S1 Feb', convocados: 300, presentados: 258, noShows: 42 },
  { semana: 'S2 Feb', convocados: 310, presentados: 270, noShows: 40 },
  { semana: 'S3 Feb', convocados: 295, presentados: 250, noShows: 45 },
  { semana: 'S4 Feb', convocados: 305, presentados: 261, noShows: 44 },
];

const clasificacionBadge: Record<string, { label: string; bg: string; text: string }> = {
  fiable: { label: 'Fiable', bg: 'bg-green-100', text: 'text-green-700' },
  regular: { label: 'Regular', bg: 'bg-amber-100', text: 'text-amber-700' },
  riesgo: { label: 'Riesgo', bg: 'bg-red-100', text: 'text-red-700' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TransportistasPanel() {
  const [sortField, setSortField] = useState<'ranking' | 'fiabilidad'>('ranking');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...transportistas].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    return (a[sortField] - b[sortField]) * mul;
  });

  const toggleSort = (field: 'ranking' | 'fiabilidad') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'ranking');
    }
  };

  const SortIcon = ({ field }: { field: 'ranking' | 'fiabilidad' }) =>
    sortField === field
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : null;

  // Convocatoria data
  const convocatoriaTotal = 280;
  const convocatoriaConfirmados = 214;
  const convocatoriaPendientes = convocatoriaTotal - convocatoriaConfirmados;
  const convocatoriaPct = Math.round((convocatoriaConfirmados / convocatoriaTotal) * 100);

  // Alerts
  const riesgoEnLista = transportistas.filter(t => t.clasificacion === 'riesgo');
  const noShowsRepetitivos = transportistas.filter(t => t.noShows >= 5);

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total registrados</p>
          <p className="text-2xl font-bold text-gray-800">128</p>
          <p className="text-[10px] text-gray-400">Transportistas activos</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Activos hoy</p>
          <p className="text-2xl font-bold text-azul-medio">87</p>
          <p className="text-[10px] text-gray-400">68% de la flota</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Fiabilidad promedio</p>
          <p className="text-2xl font-bold text-verde">84.2%</p>
          <p className="text-[10px] text-gray-400">Ultimos 30 dias</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">No-shows este mes</p>
          <p className="text-2xl font-bold text-rojo">23</p>
          <p className="text-[10px] text-gray-400">vs 18 mes anterior</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Camiones disp. fin de semana</p>
          <p className="text-2xl font-bold text-naranja">245</p>
          <p className="text-[10px] text-gray-400">Objetivo: 300</p>
        </div>
      </div>

      {/* Prediction alert */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Brain size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-700">Prediccion de asistencia - Sabado</h4>
            <p className="text-xs text-blue-600 mt-1">
              De 280 confirmados para este sabado, se estima que ~42 fallaran (15% historico).
              Overbooking recomendado: <span className="font-bold">322 convocados</span> para asegurar 280 presentes.
            </p>
          </div>
        </div>
      </div>

      {/* Charts section: 2 cols (left wider) */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fiabilidad por transportista - bar chart */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Fiabilidad por transportista (Top 15)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={fiabilidadChart} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="empresa" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(value) => [`${value}%`, 'Fiabilidad']} />
              <Bar
                dataKey="fiabilidad"
                radius={[0, 3, 3, 0]}
                fill="#4682C8"
                label={{ position: 'right', fontSize: 9, formatter: (v) => `${v}%` }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tendencia semanal (8 fines de semana)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="convocados" stroke="#4682C8" strokeWidth={2} dot={{ r: 3 }} name="Convocados" />
              <Line type="monotone" dataKey="presentados" stroke="#28A050" strokeWidth={2} dot={{ r: 3 }} name="Presentados" />
              <Line type="monotone" dataKey="noShows" stroke="#E84545" strokeWidth={2} dot={{ r: 3 }} name="No-shows" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full-width table - Ranking */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-700">Ranking de Transportistas</h3>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              {transportistas.filter(t => t.clasificacion === 'fiable').length} fiables
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              {transportistas.filter(t => t.clasificacion === 'regular').length} regulares
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              {transportistas.filter(t => t.clasificacion === 'riesgo').length} riesgo
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-2.5 text-center text-gray-500 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort('ranking')}
                >
                  <span className="inline-flex items-center gap-0.5">Ranking <SortIcon field="ranking" /></span>
                </th>
                <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Empresa</th>
                <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Operador</th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Telefono</th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Viajes mes</th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Completados</th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">No-shows</th>
                <th
                  className="px-4 py-2.5 text-center text-gray-500 font-medium cursor-pointer select-none"
                  onClick={() => toggleSort('fiabilidad')}
                >
                  <span className="inline-flex items-center gap-0.5">Fiabilidad % <SortIcon field="fiabilidad" /></span>
                </th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Clasificacion</th>
                <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Ultima actividad</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => {
                const badge = clasificacionBadge[t.clasificacion];
                return (
                  <tr key={t.ranking} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-center font-bold text-gray-700">#{t.ranking}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{t.empresa}</td>
                    <td className="px-4 py-2.5 text-gray-600">{t.operador}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <Phone size={10} className="text-gray-400" />
                        {t.telefono}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-700 font-semibold">{t.viajesMes}</td>
                    <td className="px-4 py-2.5 text-center text-verde font-semibold">{t.completados}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`font-semibold ${t.noShows >= 5 ? 'text-rojo' : t.noShows >= 3 ? 'text-naranja' : 'text-gray-500'}`}>
                        {t.noShows}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`font-bold ${t.fiabilidad >= 90 ? 'text-verde' : t.fiabilidad >= 70 ? 'text-naranja' : 'text-rojo'}`}>
                        {t.fiabilidad}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-500">{t.ultimaActividad}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-2 border-t border-gray-100 text-[10px] text-gray-400">
          {transportistas.length} transportistas mostrados de 128 registrados
        </div>
      </div>

      {/* Bottom section: convocatoria + alerts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Convocatoria activa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={16} className="text-azul-medio" />
            <h3 className="text-sm font-bold text-gray-700">Convocatoria activa - Sabado 15 Mar</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Evacuacion programada: 1,200 contenedores. Se requieren ~300 camiones.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-[10px] text-gray-500">Convocados</p>
              <p className="text-lg font-bold text-gray-800">{convocatoriaTotal}</p>
            </div>
            <div className="bg-green-50 rounded p-2 text-center">
              <p className="text-[10px] text-gray-500">Confirmados</p>
              <p className="text-lg font-bold text-verde">{convocatoriaConfirmados}</p>
            </div>
            <div className="bg-amber-50 rounded p-2 text-center">
              <p className="text-[10px] text-gray-500">Pendientes</p>
              <p className="text-lg font-bold text-naranja">{convocatoriaPendientes}</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-azul-medio to-verde rounded-full flex items-center justify-center"
              style={{ width: `${convocatoriaPct}%` }}
            >
              <span className="text-white text-[10px] font-bold">{convocatoriaPct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Clock size={10} className="text-gray-400" />
            <p className="text-[10px] text-gray-400">Cierre de confirmacion: Viernes 14 Mar 18:00</p>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rojo" />
            <h3 className="text-sm font-bold text-gray-700">Alertas de transportistas</h3>
          </div>

          <div className="space-y-3">
            {/* Riesgo en convocatoria */}
            <div className="bg-red-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <UserX size={12} className="text-red-500" />
                <span className="text-xs font-semibold text-red-700">
                  {riesgoEnLista.length} transportistas de riesgo en la convocatoria
                </span>
              </div>
              <div className="space-y-0.5">
                {riesgoEnLista.map(t => (
                  <p key={t.ranking} className="text-[10px] text-red-600">
                    {t.empresa} - {t.fiabilidad}% fiabilidad, {t.noShows} no-shows
                  </p>
                ))}
              </div>
            </div>

            {/* No-shows repetitivos */}
            <div className="bg-amber-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  No-shows repetitivos ({noShowsRepetitivos.length} transportistas con 5+ faltas)
                </span>
              </div>
              <div className="space-y-0.5">
                {noShowsRepetitivos.map(t => (
                  <p key={t.ranking} className="text-[10px] text-amber-600">
                    {t.empresa} - {t.noShows} no-shows este mes ({t.operador})
                  </p>
                ))}
              </div>
            </div>

            {/* Riesgo de paro */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={12} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-700">Indicador de dependencia</span>
              </div>
              <p className="text-[10px] text-blue-600">
                Top 5 transportistas cubren el 37% de viajes. Riesgo moderado de paro encubierto si 2+ abandonan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
