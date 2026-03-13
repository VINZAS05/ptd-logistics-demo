import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { Ship, Clock, AlertTriangle, Calendar, TrendingUp, Anchor, FileText } from 'lucide-react';

// --- Mock data ---

const evacuacionesPorHora = [
  { hora: '06:00', planificadas: 30, capacidad: 80 },
  { hora: '07:00', planificadas: 65, capacidad: 80 },
  { hora: '08:00', planificadas: 78, capacidad: 80 },
  { hora: '09:00', planificadas: 72, capacidad: 80 },
  { hora: '10:00', planificadas: 80, capacidad: 80 },
  { hora: '11:00', planificadas: 68, capacidad: 80 },
  { hora: '12:00', planificadas: 45, capacidad: 80 },
  { hora: '13:00', planificadas: 38, capacidad: 80 },
  { hora: '14:00', planificadas: 60, capacidad: 80 },
  { hora: '15:00', planificadas: 75, capacidad: 80 },
  { hora: '16:00', planificadas: 70, capacidad: 80 },
  { hora: '17:00', planificadas: 62, capacidad: 80 },
  { hora: '18:00', planificadas: 55, capacidad: 80 },
  { hora: '19:00', planificadas: 42, capacidad: 80 },
  { hora: '20:00', planificadas: 30, capacidad: 80 },
  { hora: '21:00', planificadas: 18, capacidad: 80 },
  { hora: '22:00', planificadas: 12, capacidad: 80 },
];

const contenedoresPorBuque = [
  { buque: 'MSC ANNA', MSC: 185, Hapag: 0, CMA: 0, Evergreen: 0, Maersk: 0, otros: 22 },
  { buque: 'EVER GOLDEN', MSC: 0, Hapag: 0, CMA: 0, Evergreen: 210, Maersk: 0, otros: 15 },
  { buque: 'CMA CGM MARCO POLO', MSC: 0, Hapag: 45, CMA: 168, Evergreen: 0, Maersk: 30, otros: 18 },
];

const agingData = [
  {
    rango: '+15 dias',
    total: 458,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    navieras: [
      { nombre: 'MSC', cantidad: 142 },
      { nombre: 'Hapag-Lloyd', cantidad: 98 },
      { nombre: 'CMA CGM', cantidad: 76 },
    ],
  },
  {
    rango: '+30 dias',
    total: 127,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800',
    navieras: [
      { nombre: 'MSC', cantidad: 45 },
      { nombre: 'Evergreen', cantidad: 32 },
      { nombre: 'CMA CGM', cantidad: 21 },
    ],
  },
  {
    rango: '+40 dias',
    total: 34,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
    navieras: [
      { nombre: 'MSC', cantidad: 14 },
      { nombre: 'Hapag-Lloyd', cantidad: 11 },
      { nombre: 'Evergreen', cantidad: 9 },
    ],
  },
];

const planificacionSemanal = [
  { dia: 'Lunes', navieras: 'MSC, Hapag-Lloyd, CMA CGM', contenedores: 850, camiones: 142, slots: '06:00 - 22:00 (16h)', estado: 'Confirmado' },
  { dia: 'Martes', navieras: 'Evergreen, Maersk, ONE', contenedores: 780, camiones: 130, slots: '06:00 - 22:00 (16h)', estado: 'Confirmado' },
  { dia: 'Miercoles', navieras: 'MSC, CMA CGM, ZIM', contenedores: 920, camiones: 154, slots: '06:00 - 22:00 (16h)', estado: 'En proceso' },
  { dia: 'Jueves', navieras: 'Hapag-Lloyd, Evergreen, MSC', contenedores: 810, camiones: 135, slots: '06:00 - 22:00 (16h)', estado: 'En proceso' },
  { dia: 'Viernes', navieras: 'CMA CGM, Maersk, ONE', contenedores: 760, camiones: 127, slots: '06:00 - 22:00 (16h)', estado: 'Pendiente' },
  { dia: 'Sabado', navieras: 'MSC, Hapag-Lloyd', contenedores: 540, camiones: 90, slots: '06:00 - 18:00 (12h)', estado: 'Pendiente' },
  { dia: 'Domingo', navieras: 'Evergreen, CMA CGM', contenedores: 320, camiones: 54, slots: '07:00 - 15:00 (8h)', estado: 'Pendiente' },
];

const prediccionSemanal = [
  { semana: 'Sem 12 (actual)', volumen: 4980, forecast: 4980 },
  { semana: 'Sem 13', volumen: null, forecast: 5240 },
  { semana: 'Sem 14', volumen: null, forecast: 4860 },
  { semana: 'Sem 15', volumen: null, forecast: 5510 },
  { semana: 'Sem 16', volumen: null, forecast: 5120 },
];

const estadoConfig: Record<string, { bg: string; text: string }> = {
  'Confirmado': { bg: 'bg-green-100', text: 'text-green-700' },
  'En proceso': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Pendiente': { bg: 'bg-amber-100', text: 'text-amber-700' },
};

// --- Component ---

export default function ConteconPanel() {
  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Ship size={24} className="text-blue-600" />
        <div>
          <h2 className="text-sm font-bold text-blue-800">Vista ConTeCon - Planificacion Compartida</h2>
          <p className="text-[11px] text-blue-600">Informacion de evacuaciones, slots y aging de contenedores para coordinacion con terminal</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Anchor size={14} className="text-blue-400" />
          <span className="text-[10px] text-blue-500 font-medium">Puerto de Manzanillo</span>
        </div>
      </div>

      {/* KPI Grid - 5 cols */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Contenedores en patio</p>
          <p className="text-2xl font-bold text-gray-800">3,842</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Evacuaciones prog. hoy</p>
          <p className="text-2xl font-bold text-blue-600">850</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Slots disp. manana</p>
          <p className="text-2xl font-bold text-green-600">320</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Contenedores +30 dias</p>
          <p className="text-2xl font-bold text-amber-600">127</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Contenedores +40 dias</p>
          <p className="text-2xl font-bold text-red-600">34</p>
        </div>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Evacuaciones por hora - col-span-2 */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Evacuaciones planificadas por hora</h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-blue-400 inline-block" /> Planificadas
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-red-400 inline-block" /> Capacidad max
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={evacuacionesPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="6 3" label={{ value: 'Capacidad: 80', fontSize: 10, fill: '#ef4444', position: 'right' }} />
              <Area
                type="monotone"
                dataKey="planificadas"
                stroke="#3b82f6"
                fill="#93c5fd"
                fillOpacity={0.5}
                strokeWidth={2}
                name="Planificadas"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={10} /> Horario operativo: 06:00 - 22:00 | Pico: 08:00-10:00 y 14:00-16:00
          </div>
        </div>

        {/* Right: Contenedores por buque */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ship size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Carga por buque (prox. 3)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contenedoresPorBuque} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="buque" tick={{ fontSize: 8 }} width={95} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="MSC" stackId="a" fill="#4682C8" name="MSC" />
              <Bar dataKey="Hapag" stackId="a" fill="#E68C1E" name="Hapag-Lloyd" />
              <Bar dataKey="CMA" stackId="a" fill="#28508C" name="CMA CGM" />
              <Bar dataKey="Evergreen" stackId="a" fill="#28A050" name="Evergreen" />
              <Bar dataKey="Maersk" stackId="a" fill="#00A3E0" name="Maersk" />
              <Bar dataKey="otros" stackId="a" fill="#9ca3af" name="Otros" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-gray-400">
            Proximas salidas: MSC ANNA (Mar), EVER GOLDEN (Jue), CMA CGM MARCO POLO (Sab)
          </div>
        </div>
      </div>

      {/* Aging alerts - 3 cols */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-700">Alertas de Aging - Contenedores con estancia prolongada</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {agingData.map((item) => (
            <div key={item.rango} className={`${item.bgColor} rounded-lg border ${item.borderColor} p-4`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-bold ${item.textColor}`}>{item.rango}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.badgeColor}`}>
                  {item.total.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">Navieras mas afectadas:</p>
              <div className="space-y-1.5">
                {item.navieras.map((nav) => (
                  <div key={nav.nombre} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{nav.nombre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.rango === '+40 dias' ? 'bg-red-400' :
                            item.rango === '+30 dias' ? 'bg-amber-400' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${(nav.cantidad / item.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-600 w-8 text-right">{nav.cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla - Planificacion semanal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Planificacion de Evacuaciones Semanal</h3>
          </div>
          <span className="text-[10px] text-gray-400">Semana 12, Marzo 2026</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Dia</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Navieras</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">Contenedores planificados</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">Camiones asignados</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">Slots horarios</th>
                <th className="text-center py-2 px-3 text-gray-500 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {planificacionSemanal.map((row) => {
                const est = estadoConfig[row.estado];
                return (
                  <tr key={row.dia} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-semibold text-gray-700">{row.dia}</td>
                    <td className="py-2 px-3 text-gray-600">{row.navieras}</td>
                    <td className="py-2 px-3 text-center font-semibold text-gray-800">{row.contenedores.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center text-gray-600">{row.camiones}</td>
                    <td className="py-2 px-3 text-center text-gray-500">{row.slots}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${est.bg} ${est.text}`}>
                        {row.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            Total semanal: {planificacionSemanal.reduce((s, r) => s + r.contenedores, 0).toLocaleString()} contenedores |{' '}
            {planificacionSemanal.reduce((s, r) => s + r.camiones, 0)} camiones
          </span>
          <span className="text-[10px] text-gray-400">
            Confirmados: {planificacionSemanal.filter(r => r.estado === 'Confirmado').length} dias |
            Pendientes: {planificacionSemanal.filter(r => r.estado === 'Pendiente').length} dias
          </span>
        </div>
      </div>

      {/* Bottom section: prediction + auto-report */}
      <div className="grid grid-cols-3 gap-4">
        {/* Prediccion semanal - col-span-2 */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Prediccion de volumen semanal</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={prediccionSemanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[4000, 6000]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="volumen"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Real"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 4, strokeDasharray: '' }}
                name="Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 text-[10px] text-gray-400">
            Modelo de prediccion basado en historico de 12 semanas + programacion de navieras
          </div>
        </div>

        {/* Auto-report info card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">Reportes automaticos</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reporte diario</p>
                <p className="text-xs text-gray-700 font-medium">Lun-Vie 06:00 hrs</p>
                <p className="text-[10px] text-gray-500">Evacuaciones del dia, slots, aging</p>
              </div>
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Reporte semanal</p>
                <p className="text-xs text-gray-700 font-medium">Lunes 07:00 hrs</p>
                <p className="text-[10px] text-gray-500">Resumen, KPIs, prediccion, alertas</p>
              </div>
              <div className="bg-gray-50 rounded p-2.5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Alerta critica</p>
                <p className="text-xs text-gray-700 font-medium">Tiempo real</p>
                <p className="text-[10px] text-gray-500">Saturacion &gt;90%, aging &gt;40 dias</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">Destinatarios: coordinacion@contecon.mx, logistica@woodward.mx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
