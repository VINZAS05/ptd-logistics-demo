import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { resumenEvacuacion, slotsEvacuacion } from '../data/mockData';

const estadoSlot: Record<string, { label: string; bg: string; text: string }> = {
  confirmado: { label: 'Confirmado', bg: 'bg-blue-100', text: 'text-blue-700' },
  en_ruta: { label: 'En ruta', bg: 'bg-amber-100', text: 'text-amber-700' },
  en_patio: { label: 'En patio', bg: 'bg-purple-100', text: 'text-purple-700' },
  completado: { label: 'Completado', bg: 'bg-green-100', text: 'text-green-700' },
  no_show: { label: 'No show', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function EvacuacionesPanel() {
  const barData = resumenEvacuacion.porNaviera.map(n => ({
    naviera: n.naviera.split('-')[0],
    solicitados: n.solicitados,
    completados: n.completados,
  }));

  const totalSlots = slotsEvacuacion.length;
  const completados = slotsEvacuacion.filter(s => s.estado === 'completado').length;
  const enCurso = slotsEvacuacion.filter(s => s.estado === 'en_ruta' || s.estado === 'en_patio').length;
  const noShows = slotsEvacuacion.filter(s => s.estado === 'no_show').length;

  return (
    <div className="space-y-5">
      {/* KPIs evacuacion */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Objetivo</p>
          <p className="text-xl font-bold text-gray-800">{resumenEvacuacion.objetivo.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Completados</p>
          <p className="text-xl font-bold text-verde">{resumenEvacuacion.completados.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Progreso</p>
          <p className="text-xl font-bold text-azul-medio">{resumenEvacuacion.porcentaje}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">En ruta</p>
          <p className="text-xl font-bold text-naranja">{resumenEvacuacion.enRuta}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Hora fin est.</p>
          <p className="text-xl font-bold text-gray-800">{resumenEvacuacion.horaEstimadaFin}</p>
        </div>
      </div>

      {/* Barra de progreso global */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Progreso global</h3>
          <span className="text-xs text-gray-500">
            {resumenEvacuacion.completados}/{resumenEvacuacion.objetivo} contenedores
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-azul-medio to-verde rounded-full flex items-center justify-center"
            style={{ width: `${resumenEvacuacion.porcentaje}%` }}
          >
            <span className="text-white text-xs font-bold">{resumenEvacuacion.porcentaje}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Grafico por naviera */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Por naviera</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="naviera" type="category" tick={{ fontSize: 10 }} width={60} />
              <Tooltip />
              <Bar dataKey="solicitados" fill="#e5e7eb" name="Solicitados" radius={[0, 2, 2, 0]} />
              <Bar dataKey="completados" fill="#28A050" name="Completados" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de slots */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Slots de hoy</h3>
            <div className="flex gap-2 text-[10px]">
              <span className="text-green-600">{completados} ok</span>
              <span className="text-amber-600">{enCurso} activos</span>
              <span className="text-red-600">{noShows} no-show</span>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[260px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Transportista</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Horario</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Gate</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Vueltas</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {slotsEvacuacion.map((slot) => {
                  const est = estadoSlot[slot.estado];
                  return (
                    <tr key={slot.id} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-700">{slot.transportista}</td>
                      <td className="py-1.5 text-center text-gray-500">{slot.horario}</td>
                      <td className="py-1.5 text-center text-gray-500">{slot.gate}</td>
                      <td className="py-1.5 text-center text-gray-700 font-semibold">
                        {slot.vueltasCompletadas}/{slot.vueltasObjetivo}
                      </td>
                      <td className="py-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${est.bg} ${est.text}`}>
                          {est.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
            {totalSlots} slots programados | Overbooking 15%
          </div>
        </div>
      </div>
    </div>
  );
}
