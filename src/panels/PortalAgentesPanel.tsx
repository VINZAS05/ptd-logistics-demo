import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building2, FileText, DollarSign, TrendingUp, Package, Search, Ship } from 'lucide-react';
import KpiCard from '../components/KpiCard';

/* ── Mock data ─────────────────────────────────────────── */

const topImportadores = [
  { nombre: 'Google', contenedores: 342 },
  { nombre: 'Costco', contenedores: 298 },
  { nombre: 'Ford Motor', contenedores: 276 },
  { nombre: 'Nissan', contenedores: 251 },
  { nombre: 'Samsung', contenedores: 224 },
  { nombre: 'Toyota', contenedores: 198 },
  { nombre: 'LG Electronics', contenedores: 172 },
  { nombre: 'HP Inc', contenedores: 155 },
  { nombre: 'Sony', contenedores: 138 },
  { nombre: 'Amazon', contenedores: 121 },
];

const solicitudesPorAgente = [
  { agente: 'Lic. Gonzalez', solicitudes: 48 },
  { agente: 'Lic. Mendoza', solicitudes: 42 },
  { agente: 'Lic. Vargas', solicitudes: 38 },
  { agente: 'Lic. Castillo', solicitudes: 35 },
  { agente: 'Lic. Rios', solicitudes: 31 },
  { agente: 'Lic. Navarro', solicitudes: 27 },
  { agente: 'Lic. Herrera', solicitudes: 22 },
  { agente: 'Lic. Delgado', solicitudes: 18 },
];

const solicitudesRecientes = [
  { id: 'SOL-4521', agente: 'Lic. Gonzalez', cliente: 'Google', contenedor: 'MSCU7234561', naviera: 'MSC', tipo: '40HC', estado: 'Programado', fecha: '13/03/2026 08:15', monto: 18500 },
  { id: 'SOL-4520', agente: 'Lic. Mendoza', cliente: 'Ford Motor', contenedor: 'MAEU9182734', naviera: 'Maersk', tipo: '40ST', estado: 'En patio', fecha: '13/03/2026 07:52', monto: 15200 },
  { id: 'SOL-4519', agente: 'Lic. Vargas', cliente: 'Costco', contenedor: 'CMAU4567823', naviera: 'CMA CGM', tipo: '20ST', estado: 'Evacuado', fecha: '12/03/2026 17:30', monto: 12800 },
  { id: 'SOL-4518', agente: 'Lic. Castillo', cliente: 'Nissan', contenedor: 'HLBU3456789', naviera: 'Hapag-Lloyd', tipo: '40HC', estado: 'Pendiente pago', fecha: '12/03/2026 16:45', monto: 22100 },
  { id: 'SOL-4517', agente: 'Lic. Rios', cliente: 'Samsung', contenedor: 'EISU8765432', naviera: 'Evergreen', tipo: '40RF', estado: 'Programado', fecha: '12/03/2026 15:20', monto: 28900 },
  { id: 'SOL-4516', agente: 'Lic. Gonzalez', cliente: 'Toyota', contenedor: 'OOLU2345678', naviera: 'OOCL', tipo: '40ST', estado: 'En patio', fecha: '12/03/2026 14:10', monto: 16400 },
  { id: 'SOL-4515', agente: 'Lic. Navarro', cliente: 'LG Electronics', contenedor: 'MSCU1928374', naviera: 'MSC', tipo: '40HC', estado: 'Evacuado', fecha: '12/03/2026 12:55', monto: 19700 },
  { id: 'SOL-4514', agente: 'Lic. Herrera', cliente: 'HP Inc', contenedor: 'CMAU7654321', naviera: 'CMA CGM', tipo: '20ST', estado: 'Programado', fecha: '12/03/2026 11:40', monto: 11300 },
  { id: 'SOL-4513', agente: 'Lic. Mendoza', cliente: 'Amazon', contenedor: 'MAEU5647382', naviera: 'Maersk', tipo: '40HC', estado: 'Pendiente pago', fecha: '12/03/2026 10:25', monto: 24600 },
  { id: 'SOL-4512', agente: 'Lic. Delgado', cliente: 'Sony', contenedor: 'HLBU9876543', naviera: 'Hapag-Lloyd', tipo: '40RF', estado: 'En patio', fecha: '12/03/2026 09:15', monto: 31200 },
  { id: 'SOL-4511', agente: 'Lic. Vargas', cliente: 'Procter & Gamble', contenedor: 'EISU3456712', naviera: 'Evergreen', tipo: '20ST', estado: 'Evacuado', fecha: '11/03/2026 18:00', monto: 9800 },
  { id: 'SOL-4510', agente: 'Lic. Castillo', cliente: 'Whirlpool', contenedor: 'OOLU8765439', naviera: 'OOCL', tipo: '40ST', estado: 'Programado', fecha: '11/03/2026 16:30', monto: 17600 },
];

const rankingClientes = [
  { nombre: 'Google', contenedores: 342, porcentaje: 15.2, tendencia: 'up' as const },
  { nombre: 'Costco', contenedores: 298, porcentaje: 13.2, tendencia: 'up' as const },
  { nombre: 'Ford Motor', contenedores: 276, porcentaje: 12.3, tendencia: 'down' as const },
  { nombre: 'Nissan', contenedores: 251, porcentaje: 11.2, tendencia: 'up' as const },
  { nombre: 'Samsung', contenedores: 224, porcentaje: 10.0, tendencia: 'up' as const },
  { nombre: 'Toyota', contenedores: 198, porcentaje: 8.8, tendencia: 'down' as const },
  { nombre: 'LG Electronics', contenedores: 172, porcentaje: 7.6, tendencia: 'up' as const },
  { nombre: 'HP Inc', contenedores: 155, porcentaje: 6.9, tendencia: 'down' as const },
  { nombre: 'Sony', contenedores: 138, porcentaje: 6.1, tendencia: 'up' as const },
  { nombre: 'Amazon', contenedores: 121, porcentaje: 5.4, tendencia: 'up' as const },
  { nombre: 'Procter & Gamble', contenedores: 89, porcentaje: 3.9, tendencia: 'down' as const },
  { nombre: 'Whirlpool', contenedores: 64, porcentaje: 2.8, tendencia: 'down' as const },
];

const performanceAgentes = [
  { agente: 'Lic. Gonzalez', solicitudesMes: 48, contenedores: 142, facturado: 685000, tiempoResp: 1.2 },
  { agente: 'Lic. Mendoza', solicitudesMes: 42, contenedores: 128, facturado: 612000, tiempoResp: 1.5 },
  { agente: 'Lic. Vargas', solicitudesMes: 38, contenedores: 115, facturado: 548000, tiempoResp: 1.8 },
  { agente: 'Lic. Castillo', solicitudesMes: 35, contenedores: 98, facturado: 492000, tiempoResp: 2.1 },
  { agente: 'Lic. Rios', solicitudesMes: 31, contenedores: 87, facturado: 421000, tiempoResp: 1.4 },
  { agente: 'Lic. Navarro', solicitudesMes: 27, contenedores: 76, facturado: 358000, tiempoResp: 2.3 },
  { agente: 'Lic. Herrera', solicitudesMes: 22, contenedores: 64, facturado: 298000, tiempoResp: 1.9 },
  { agente: 'Lic. Delgado', solicitudesMes: 18, contenedores: 52, facturado: 234000, tiempoResp: 2.6 },
];

/* ── Status badge config ───────────────────────────────── */

const estadoBadge: Record<string, { bg: string; text: string }> = {
  'Programado': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'En patio': { bg: 'bg-green-100', text: 'text-green-700' },
  'Evacuado': { bg: 'bg-gray-100', text: 'text-gray-600' },
  'Pendiente pago': { bg: 'bg-amber-100', text: 'text-amber-700' },
};

/* ── Component ─────────────────────────────────────────── */

export default function PortalAgentesPanel() {
  const [busqueda, setBusqueda] = useState('');

  const solicitudesFiltradas = busqueda
    ? solicitudesRecientes.filter(s =>
        s.agente.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.contenedor.toLowerCase().includes(busqueda.toLowerCase()) ||
        s.id.toLowerCase().includes(busqueda.toLowerCase())
      )
    : solicitudesRecientes;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          titulo="Agentes registrados"
          valor="34"
          subtitulo="8 activos hoy"
          color="bg-azul-medio"
          icono={<Users size={18} />}
        />
        <KpiCard
          titulo="Solicitudes hoy"
          valor="28"
          subtitulo="+12% vs ayer"
          color="bg-verde"
          icono={<FileText size={18} />}
        />
        <KpiCard
          titulo="Contenedores programados"
          valor="156"
          subtitulo="43 en transito"
          color="bg-azul-claro"
          icono={<Package size={18} />}
        />
        <KpiCard
          titulo="Facturado este mes"
          valor="$2.4M"
          subtitulo="MXN | +8% vs mes ant."
          color="bg-naranja"
          icono={<DollarSign size={18} />}
        />
        <KpiCard
          titulo="Clientes finales activos"
          valor="89"
          subtitulo="12 importadores top"
          color="bg-azul-oscuro"
          icono={<Building2 size={18} />}
        />
      </div>

      {/* Charts: Top importadores + Solicitudes por agente */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top 10 Importadores por volumen (9 meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topImportadores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
              <Bar dataKey="contenedores" fill="#4682C8" name="Contenedores" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Solicitudes por agente aduanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={solicitudesPorAgente}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="agente" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="solicitudes" fill="#28A050" name="Solicitudes" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla solicitudes recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Solicitudes Recientes</h3>
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar agente, cliente, contenedor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 w-72"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-1.5 text-gray-500 font-medium">ID</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Agente Aduanal</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Cliente Final</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Contenedor</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Naviera</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Tipo</th>
                <th className="text-center py-1.5 text-gray-500 font-medium">Estado</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Fecha</th>
                <th className="text-right py-1.5 text-gray-500 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesFiltradas.map((s) => {
                const badge = estadoBadge[s.estado] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2 text-blue-600 font-medium">{s.id}</td>
                    <td className="py-2 text-gray-700">{s.agente}</td>
                    <td className="py-2 text-gray-700 font-medium">{s.cliente}</td>
                    <td className="py-2 text-gray-500 font-mono text-[10px]">{s.contenedor}</td>
                    <td className="py-2 text-gray-500">{s.naviera}</td>
                    <td className="py-2 text-center text-gray-500">{s.tipo}</td>
                    <td className="py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">{s.fecha}</td>
                    <td className="py-2 text-right font-semibold text-gray-800">${s.monto.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom section: Ranking clientes + Performance agentes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ranking de Clientes Finales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Ranking de Clientes Finales</h3>
          </div>
          <div className="space-y-1.5">
            {rankingClientes.map((c, i) => (
              <div key={c.nombre} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-xs text-gray-700 font-medium truncate">{c.nombre}</span>
                <span className="text-xs text-gray-800 font-semibold w-12 text-right">{c.contenedores}</span>
                <span className={`text-[10px] ${c.tendencia === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {c.tendencia === 'up' ? '▲' : '▼'}
                </span>
                <span className="text-[10px] text-gray-400 w-10 text-right">{c.porcentaje}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Agentes Aduanales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Ship size={16} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Agentes Aduanales Performance</h3>
          </div>
          <div className="overflow-y-auto max-h-[340px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Agente</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Sol/mes</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Cont.</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Facturado</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Avg resp.</th>
                </tr>
              </thead>
              <tbody>
                {performanceAgentes.map((a) => (
                  <tr key={a.agente} className="border-b border-gray-50">
                    <td className="py-2 text-gray-700 font-medium">{a.agente}</td>
                    <td className="py-2 text-center text-gray-600">{a.solicitudesMes}</td>
                    <td className="py-2 text-center text-gray-600">{a.contenedores}</td>
                    <td className="py-2 text-right font-semibold text-gray-800">${(a.facturado / 1000).toFixed(0)}K</td>
                    <td className="py-2 text-center">
                      <span className={`text-[10px] font-medium ${a.tiempoResp <= 1.5 ? 'text-green-600' : a.tiempoResp <= 2.0 ? 'text-amber-600' : 'text-red-500'}`}>
                        {a.tiempoResp}h
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
