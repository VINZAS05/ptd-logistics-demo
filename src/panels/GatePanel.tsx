import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { resumenGate, tendenciaGate } from '../data/mockData';

export default function GatePanel() {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Tiempo avg</p>
          <p className="text-xl font-bold text-azul-medio">{resumenGate.tiempoPromedioMin} min</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Procesados hoy</p>
          <p className="text-xl font-bold text-gray-800">{resumenGate.procesadosHoy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">En cola ahora</p>
          <p className="text-xl font-bold text-naranja">{resumenGate.enCola}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Lanes activas</p>
          <p className="text-xl font-bold text-verde">{resumenGate.lanesActivas}/{resumenGate.lanesTotales}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Pico hoy</p>
          <p className="text-xl font-bold text-gray-800">{resumenGate.picoHoy.cantidad}</p>
          <p className="text-[10px] text-gray-400">a las {resumenGate.picoHoy.hora}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Grafico de trafico por hora */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Trafico por hora</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tendenciaGate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="entradas" stroke="#4682C8" fill="#4682C8" fillOpacity={0.2} name="Entradas" />
              <Area type="monotone" dataKey="salidas" stroke="#28A050" fill="#28A050" fillOpacity={0.2} name="Salidas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de lanes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado de lanes</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((lane) => {
              const activa = lane <= resumenGate.lanesActivas;
              return (
                <div key={lane} className={`p-3 rounded-lg border ${activa ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Gate {lane}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${activa ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  {activa && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Ultimo: MSCU1234567 - 14:52</p>
                      <p>Procesados: {lane === 1 ? 98 : 89}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-700">Autorizaciones pendientes</p>
            <p className="text-lg font-bold text-amber-600">{resumenGate.autorizadosPendientes}</p>
            <p className="text-[10px] text-amber-500">contenedores autorizados sin llegar</p>
          </div>
        </div>
      </div>
    </div>
  );
}
