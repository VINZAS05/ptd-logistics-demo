import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Wrench, Fuel, Activity, AlertTriangle, CheckCircle, Pause, XCircle } from 'lucide-react';
import { maquinaria, resumenMaquinaria, maniobrasHorarias, type EstadoMaquina } from '../data/mockData';

const estadoConfig: Record<EstadoMaquina, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  operando: { label: 'Operando', bg: 'bg-green-100', text: 'text-green-700', icon: <Activity size={12} className="text-green-600" /> },
  standby: { label: 'Stand-by', bg: 'bg-amber-100', text: 'text-amber-700', icon: <Pause size={12} className="text-amber-600" /> },
  mantenimiento: { label: 'Mantenimiento', bg: 'bg-blue-100', text: 'text-blue-700', icon: <Wrench size={12} className="text-blue-600" /> },
  fuera_servicio: { label: 'Fuera de servicio', bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle size={12} className="text-red-600" /> },
};

function CombustibleBar({ pct }: { pct: number }) {
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <Fuel size={10} className="text-gray-400" />
      <div className="w-16 bg-gray-100 rounded-full h-2">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-gray-500 w-7">{pct}%</span>
    </div>
  );
}

export default function MaquinariaPanel() {
  const barData = maquinaria.filter(m => m.estado !== 'mantenimiento').map(m => ({
    maquina: m.id,
    maniobras: m.maniobrasHoy,
    objetivo: m.maniobrasObjetivo,
  }));

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Maquinas totales</p>
          <p className="text-2xl font-bold text-gray-800">{resumenMaquinaria.totalMaquinas}</p>
          <p className="text-[10px] text-gray-400">8 Reach Stackers + 1 Grua</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Operando</p>
          <p className="text-2xl font-bold text-verde">{resumenMaquinaria.operando}</p>
          <p className="text-[10px] text-gray-400">{resumenMaquinaria.standby} stand-by | {resumenMaquinaria.mantenimiento} mant.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Maniobras hoy</p>
          <p className="text-2xl font-bold text-azul-medio">{resumenMaquinaria.maniobrasHoyTotal}</p>
          <p className="text-[10px] text-gray-400">de {resumenMaquinaria.maniobrasObjetivoTotal} objetivo</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Horas operacion avg</p>
          <p className="text-2xl font-bold text-gray-800">{resumenMaquinaria.horasOperacionPromedio}h</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Combustible avg</p>
          <p className={`text-2xl font-bold ${resumenMaquinaria.combustiblePromedio > 50 ? 'text-verde' : resumenMaquinaria.combustiblePromedio > 25 ? 'text-naranja' : 'text-rojo'}`}>
            {resumenMaquinaria.combustiblePromedio}%
          </p>
        </div>
      </div>

      {/* Progreso global maniobras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Progreso de maniobras diarias</h3>
          <span className="text-xs text-gray-500">
            {resumenMaquinaria.maniobrasHoyTotal}/{resumenMaquinaria.maniobrasObjetivoTotal} ({Math.round(resumenMaquinaria.maniobrasHoyTotal / resumenMaquinaria.maniobrasObjetivoTotal * 100)}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-azul-medio to-verde rounded-full flex items-center justify-center"
            style={{ width: `${Math.min(100, resumenMaquinaria.maniobrasHoyTotal / resumenMaquinaria.maniobrasObjetivoTotal * 100)}%` }}
          >
            <span className="text-white text-[10px] font-bold">
              {Math.round(resumenMaquinaria.maniobrasHoyTotal / resumenMaquinaria.maniobrasObjetivoTotal * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Grafico de maniobras por maquina */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Maniobras por maquina</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="maquina" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="objetivo" fill="#e5e7eb" name="Objetivo" radius={[2, 2, 0, 0]} />
              <Bar dataKey="maniobras" fill="#4682C8" name="Realizadas" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grafico de maniobras por hora */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Actividad por hora</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={maniobrasHorarias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="maniobras" stroke="#4682C8" strokeWidth={2} dot={{ r: 3 }} name="Maniobras" />
              <Line type="monotone" dataKey="maquinasActivas" stroke="#28A050" strokeWidth={2} dot={{ r: 3 }} name="Maquinas activas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla detalle de maquinaria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-700">Estado de maquinaria</h3>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              {resumenMaquinaria.operando} operando
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              {resumenMaquinaria.standby} stand-by
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              {resumenMaquinaria.mantenimiento} mantenimiento
            </span>
          </div>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Maquina</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Tipo</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Estado</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Operador</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Maniobras</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Horas op.</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Combustible</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Isla</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Ult. maniobra</th>
            </tr>
          </thead>
          <tbody>
            {maquinaria.map((maq) => {
              const est = estadoConfig[maq.estado];
              const pctManiobras = Math.round(maq.maniobrasHoy / maq.maniobrasObjetivo * 100);
              return (
                <tr key={maq.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <div>
                      <span className="font-bold text-gray-800">{maq.id}</span>
                      <span className="text-gray-400 ml-1.5">{maq.nombre.replace('Reach Stacker ', 'RS').replace('Grua de Patio ', 'GP')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">
                    {maq.tipo === 'reach_stacker' ? 'Reach Stacker' : 'Grua de Patio'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${est.bg} ${est.text}`}>
                      {est.icon}
                      {est.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{maq.operador}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className={`font-bold ${pctManiobras >= 90 ? 'text-green-600' : pctManiobras >= 70 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {maq.maniobrasHoy}
                      </span>
                      <span className="text-gray-400">/ {maq.maniobrasObjetivo}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1 mt-0.5">
                      <div
                        className={`h-full rounded-full ${pctManiobras >= 90 ? 'bg-green-400' : pctManiobras >= 70 ? 'bg-amber-400' : 'bg-gray-300'}`}
                        style={{ width: `${Math.min(100, pctManiobras)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{maq.horasOperacion}h</td>
                  <td className="px-4 py-2.5">
                    <CombustibleBar pct={maq.combustiblePct} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {maq.islaAsignada ? (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                        {maq.islaAsignada.replace('ISLA-', 'I').replace('SUR-', 'S-')}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-500">{maq.ultimaManiobraHora}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alertas de maquinaria */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-700">Mantenimiento preventivo</h4>
              <p className="text-xs text-amber-600 mt-1">
                RS-07 en mantenimiento preventivo programado. Estimado de retorno: manana 06:00.
                RS-04 programado para mantenimiento el viernes.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-700">Rendimiento del dia</h4>
              <p className="text-xs text-blue-600 mt-1">
                Mejor maquina: RS-02 con 94 maniobras (94% objetivo).
                Promedio por maquina activa: {Math.round(resumenMaquinaria.maniobrasHoyTotal / resumenMaquinaria.operando)} maniobras.
                Combustible promedio: {resumenMaquinaria.combustiblePromedio}%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
