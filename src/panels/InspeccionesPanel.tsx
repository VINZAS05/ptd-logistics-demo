import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  ClipboardCheck, Camera, AlertTriangle, CheckCircle, XCircle, Eye, Clock,
} from 'lucide-react';

// --- Mock data ---

const kpis = {
  inspeccionesHoy: 47,
  aprobados: 41,
  rechazados: 6,
  tasaAprobacion: 87.2,
  tiempoPromedio: 4.2,
};

const inspeccionesPorHora = [
  { hora: '06:00', aprobados: 3, rechazados: 1 },
  { hora: '07:00', aprobados: 5, rechazados: 0 },
  { hora: '08:00', aprobados: 6, rechazados: 1 },
  { hora: '09:00', aprobados: 7, rechazados: 2 },
  { hora: '10:00', aprobados: 5, rechazados: 1 },
  { hora: '11:00', aprobados: 4, rechazados: 0 },
  { hora: '12:00', aprobados: 3, rechazados: 0 },
  { hora: '13:00', aprobados: 4, rechazados: 1 },
  { hora: '14:00', aprobados: 3, rechazados: 0 },
  { hora: '15:00', aprobados: 1, rechazados: 0 },
];

const motivosRechazo = [
  { motivo: 'Dano paredes', cantidad: 2, color: '#EF4444' },
  { motivo: 'Dano piso', cantidad: 1, color: '#F97316' },
  { motivo: 'Dano techo', cantidad: 1, color: '#EAB308' },
  { motivo: 'Dano puertas', cantidad: 1, color: '#8B5CF6' },
  { motivo: 'Suciedad', cantidad: 3, color: '#6B7280' },
  { motivo: 'Humedad', cantidad: 2, color: '#3B82F6' },
  { motivo: 'Oxidacion', cantidad: 1, color: '#A16207' },
];

type ResultadoInspeccion = 'aprobado' | 'rechazado' | 'en_revision';

interface InspeccionReciente {
  hora: string;
  contenedor: string;
  naviera: string;
  tipo: string;
  inspector: string;
  resultado: ResultadoInspeccion;
  motivoRechazo: string;
  fotos: number;
}

const inspeccionesRecientes: InspeccionReciente[] = [
  { hora: '15:12', contenedor: 'CMAU7834521', naviera: 'CMA CGM', tipo: '40HC', inspector: 'J. Perez', resultado: 'aprobado', motivoRechazo: '-', fotos: 4 },
  { hora: '15:04', contenedor: 'COSU6291048', naviera: 'Cosco Shipping', tipo: '20DC', inspector: 'M. Ruiz', resultado: 'rechazado', motivoRechazo: 'Dano paredes', fotos: 7 },
  { hora: '14:51', contenedor: 'HMMU4518273', naviera: 'HMM', tipo: '40HC', inspector: 'A. Dominguez', resultado: 'aprobado', motivoRechazo: '-', fotos: 3 },
  { hora: '14:38', contenedor: 'ONEU3927561', naviera: 'ONE', tipo: '40HR', inspector: 'R. Soto', resultado: 'en_revision', motivoRechazo: 'Humedad', fotos: 6 },
  { hora: '14:22', contenedor: 'CMAU5012847', naviera: 'CMA CGM', tipo: '40DC', inspector: 'J. Perez', resultado: 'aprobado', motivoRechazo: '-', fotos: 3 },
  { hora: '14:09', contenedor: 'PILU2938174', naviera: 'PIL', tipo: '20DC', inspector: 'M. Ruiz', resultado: 'aprobado', motivoRechazo: '-', fotos: 4 },
  { hora: '13:55', contenedor: 'EGHU8174392', naviera: 'Evergreen', tipo: '40HC', inspector: 'A. Dominguez', resultado: 'rechazado', motivoRechazo: 'Suciedad', fotos: 5 },
  { hora: '13:41', contenedor: 'COSU4829173', naviera: 'Cosco Shipping', tipo: '40HC', inspector: 'R. Soto', resultado: 'aprobado', motivoRechazo: '-', fotos: 3 },
  { hora: '13:28', contenedor: 'HMMU6183429', naviera: 'HMM', tipo: '40DC', inspector: 'J. Perez', resultado: 'aprobado', motivoRechazo: '-', fotos: 4 },
  { hora: '13:14', contenedor: 'ONEU7249381', naviera: 'ONE', tipo: '20DC', inspector: 'M. Ruiz', resultado: 'rechazado', motivoRechazo: 'Dano piso', fotos: 8 },
  { hora: '12:58', contenedor: 'CMAU3918274', naviera: 'CMA CGM', tipo: '40HR', inspector: 'A. Dominguez', resultado: 'aprobado', motivoRechazo: '-', fotos: 3 },
  { hora: '12:42', contenedor: 'EGHU5029184', naviera: 'Evergreen', tipo: '40HC', inspector: 'R. Soto', resultado: 'aprobado', motivoRechazo: '-', fotos: 4 },
];

interface Devolucion {
  contenedor: string;
  naviera: string;
  agenteAduanal: string;
  monto: number;
  status: 'pendiente' | 'en_proceso' | 'aprobada';
}

const devolucionesPendientes: Devolucion[] = [
  { contenedor: 'COSU6291048', naviera: 'Cosco Shipping', agenteAduanal: 'Ag. Rodriguez & Asoc.', monto: 18500, status: 'pendiente' },
  { contenedor: 'ONEU7249381', naviera: 'ONE', agenteAduanal: 'Ag. Manzanillo Int.', monto: 12300, status: 'en_proceso' },
  { contenedor: 'EGHU8174392', naviera: 'Evergreen', agenteAduanal: 'Ag. Pacific Trade', monto: 9800, status: 'pendiente' },
  { contenedor: 'HMMU3102947', naviera: 'HMM', agenteAduanal: 'Ag. Rodriguez & Asoc.', monto: 22100, status: 'aprobada' },
  { contenedor: 'CMAU9281734', naviera: 'CMA CGM', agenteAduanal: 'Ag. Colima Logistics', monto: 15600, status: 'en_proceso' },
];

interface InspectorPerformance {
  nombre: string;
  inspecciones: number;
  aprobados: number;
  rechazados: number;
  tiempoPromedio: number;
}

const inspectores: InspectorPerformance[] = [
  { nombre: 'J. Perez', inspecciones: 14, aprobados: 13, rechazados: 1, tiempoPromedio: 3.8 },
  { nombre: 'M. Ruiz', inspecciones: 12, aprobados: 10, rechazados: 2, tiempoPromedio: 4.5 },
  { nombre: 'A. Dominguez', inspecciones: 11, aprobados: 9, rechazados: 2, tiempoPromedio: 4.1 },
  { nombre: 'R. Soto', inspecciones: 10, aprobados: 9, rechazados: 1, tiempoPromedio: 4.6 },
];

// --- Result badge config ---

const resultadoBadge: Record<ResultadoInspeccion, { label: string; bg: string; text: string; Icon: typeof CheckCircle }> = {
  aprobado: { label: 'Aprobado', bg: 'bg-green-100', text: 'text-green-700', Icon: CheckCircle },
  rechazado: { label: 'Rechazado', bg: 'bg-red-100', text: 'text-red-700', Icon: XCircle },
  en_revision: { label: 'En revision', bg: 'bg-amber-100', text: 'text-amber-700', Icon: Clock },
};

const devolucionStatus: Record<string, { label: string; bg: string; text: string }> = {
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  en_proceso: { label: 'En proceso', bg: 'bg-blue-100', text: 'text-blue-700' },
  aprobada: { label: 'Aprobada', bg: 'bg-green-100', text: 'text-green-700' },
};

// --- Component ---

export default function InspeccionesPanel() {
  const [_tab] = useState(0);

  return (
    <div className="space-y-5">
      {/* KPI Grid - 5 cols */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ClipboardCheck size={14} className="text-azul-medio" />
            <p className="text-xs text-gray-500">Inspecciones hoy</p>
          </div>
          <p className="text-2xl font-bold text-azul-medio">{kpis.inspeccionesHoy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle size={14} className="text-verde" />
            <p className="text-xs text-gray-500">Aprobados</p>
          </div>
          <p className="text-2xl font-bold text-verde">{kpis.aprobados}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <XCircle size={14} className="text-red-500" />
            <p className="text-xs text-gray-500">Rechazados</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{kpis.rechazados}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Eye size={14} className="text-azul-medio" />
            <p className="text-xs text-gray-500">Tasa aprobacion</p>
          </div>
          <p className="text-2xl font-bold text-azul-medio">{kpis.tasaAprobacion}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Clock size={14} className="text-naranja" />
            <p className="text-xs text-gray-500">Tiempo prom. inspeccion</p>
          </div>
          <p className="text-2xl font-bold text-naranja">{kpis.tiempoPromedio} min</p>
        </div>
      </div>

      {/* Charts row: stacked bar + donut */}
      <div className="grid grid-cols-3 gap-4">
        {/* Stacked bar chart - inspecciones por hora */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Inspecciones por hora</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inspeccionesPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="aprobados" stackId="a" fill="#28A050" name="Aprobados" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rechazados" stackId="a" fill="#EF4444" name="Rechazados" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart - motivos de rechazo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-700">Motivos de rechazo</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={motivosRechazo}
                dataKey="cantidad"
                nameKey="motivo"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {motivosRechazo.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value} />
              <Legend
                layout="vertical"
                verticalAlign="bottom"
                align="center"
                iconSize={8}
                formatter={(value) => <span className="text-[10px] text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full-width table - Inspecciones recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck size={14} className="text-azul-medio" />
          <h3 className="text-sm font-semibold text-gray-700">Inspecciones recientes</h3>
        </div>
        <div className="overflow-y-auto max-h-[380px]">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Hora</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Contenedor</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Naviera</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Tipo</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Inspector</th>
                <th className="text-center px-3 py-2 text-gray-500 font-medium">Resultado</th>
                <th className="text-left px-3 py-2 text-gray-500 font-medium">Motivo rechazo</th>
                <th className="text-center px-3 py-2 text-gray-500 font-medium">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {inspeccionesRecientes.map((insp, idx) => {
                const badge = resultadoBadge[insp.resultado];
                const BadgeIcon = badge.Icon;
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2 text-gray-600 font-mono">{insp.hora}</td>
                    <td className="px-3 py-2 font-mono font-semibold text-gray-800">{insp.contenedor}</td>
                    <td className="px-3 py-2 text-gray-700">{insp.naviera}</td>
                    <td className="px-3 py-2">
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {insp.tipo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{insp.inspector}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                        <BadgeIcon size={10} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {insp.motivoRechazo !== '-' ? (
                        <span className="text-red-600 font-medium">{insp.motivoRechazo}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-500">
                        <Camera size={10} />
                        <span>{insp.fotos}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom section: devoluciones + inspector performance */}
      <div className="grid grid-cols-2 gap-4">
        {/* Devoluciones pendientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-naranja" />
            <h3 className="text-sm font-semibold text-gray-700">Devoluciones pendientes</h3>
            <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              {devolucionesPendientes.length} registros
            </span>
          </div>
          <div className="overflow-y-auto max-h-[240px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Contenedor</th>
                  <th className="text-left py-1.5 text-gray-500 font-medium">Naviera</th>
                  <th className="text-left py-1.5 text-gray-500 font-medium">Agente aduanal</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Monto</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {devolucionesPendientes.map((dev, idx) => {
                  const st = devolucionStatus[dev.status];
                  return (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 font-mono font-semibold text-gray-800">{dev.contenedor}</td>
                      <td className="py-2 text-gray-700">{dev.naviera}</td>
                      <td className="py-2 text-gray-600 text-[10px]">{dev.agenteAduanal}</td>
                      <td className="py-2 text-right font-semibold text-gray-800">${dev.monto.toLocaleString()}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Total pendiente de reembolso</span>
            <span className="text-sm font-bold text-red-600">
              ${devolucionesPendientes.reduce((sum, d) => sum + d.monto, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Inspector performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={14} className="text-azul-medio" />
            <h3 className="text-sm font-semibold text-gray-700">Rendimiento de inspectores</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-1.5 text-gray-500 font-medium">Inspector</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Inspecciones</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Aprobados</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Rechazados</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Tiempo prom.</th>
              </tr>
            </thead>
            <tbody>
              {inspectores.map((insp, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2.5 font-semibold text-gray-800">{insp.nombre}</td>
                  <td className="py-2.5 text-center text-gray-700">{insp.inspecciones}</td>
                  <td className="py-2.5 text-center">
                    <span className="text-verde font-semibold">{insp.aprobados}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="text-red-500 font-semibold">{insp.rechazados}</span>
                  </td>
                  <td className="py-2.5 text-center text-gray-600">{insp.tiempoPromedio} min</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>Promedio general del equipo</span>
              <span className="font-semibold text-gray-600">
                {(inspectores.reduce((s, i) => s + i.tiempoPromedio, 0) / inspectores.length).toFixed(1)} min/inspeccion
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
