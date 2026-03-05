import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { kpisHistoricos } from '../data/mockData';

const kpiDefs = [
  { key: 'truckTurnTime', label: 'Truck Turn Time', unidad: 'min', objetivo: 60, color: '#4682C8' },
  { key: 'gateWait', label: 'Gate Wait Time', unidad: 'min', objetivo: 15, color: '#28A050' },
  { key: 'tiempoContecon', label: 'Tiempo en ConTeCon', unidad: 'min', objetivo: 90, color: '#E68C1E' },
  { key: 'evacuationRate', label: 'Evacuation Rate', unidad: '%', objetivo: 95, color: '#28508C' },
  { key: 'rehandles', label: 'Rehandles por pickup', unidad: '', objetivo: 1.5, color: '#C83C3C' },
];

export default function KpisPanel() {
  const ultimaSemana = kpisHistoricos[kpisHistoricos.length - 1];

  return (
    <div className="space-y-5">
      {/* KPI cards con tendencia */}
      <div className="grid grid-cols-5 gap-3">
        {kpiDefs.map((kpi) => {
          const valor = ultimaSemana[kpi.key as keyof typeof ultimaSemana] as number;
          const previo = kpisHistoricos[kpisHistoricos.length - 2][kpi.key as keyof typeof ultimaSemana] as number;
          const mejora = kpi.key === 'evacuationRate'
            ? valor > previo
            : valor < previo;
          const delta = kpi.key === 'evacuationRate'
            ? valor - previo
            : previo - valor;

          return (
            <div key={kpi.key} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-xl font-bold mt-1" style={{ color: kpi.color }}>
                {valor}{kpi.unidad}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">Obj: {kpi.objetivo}{kpi.unidad}</span>
                <span className={`text-[10px] font-medium ${mejora ? 'text-green-600' : 'text-red-500'}`}>
                  {mejora ? '+' : ''}{delta > 0 ? '+' : ''}{delta.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graficos de tendencia */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tiempos operativos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={kpisHistoricos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="truckTurnTime" stroke="#4682C8" name="Truck Turn Time (min)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="gateWait" stroke="#28A050" name="Gate Wait (min)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Evacuacion y eficiencia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={kpisHistoricos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="evacuationRate" stroke="#28508C" name="Evacuation Rate (%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="rehandles" stroke="#C83C3C" name="Rehandles" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Historico semanal</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Semana</th>
              {kpiDefs.map(k => (
                <th key={k.key} className="text-center py-2 text-gray-500 font-medium">{k.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kpisHistoricos.map((sem) => (
              <tr key={sem.semana} className="border-b border-gray-50">
                <td className="py-2 font-medium text-gray-700">{sem.semana}</td>
                {kpiDefs.map(k => {
                  const val = sem[k.key as keyof typeof sem] as number;
                  const cumple = k.key === 'evacuationRate'
                    ? val >= k.objetivo
                    : val <= k.objetivo;
                  return (
                    <td key={k.key} className={`py-2 text-center font-semibold ${cumple ? 'text-green-600' : 'text-red-500'}`}>
                      {val}{k.unidad}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dato para ConTeCon */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
        <h3 className="text-sm font-semibold text-amber-700 mb-1">Dato para negociacion con ConTeCon:</h3>
        <p className="text-xs text-amber-600">
          "Este fin de semana, nuestros camiones estuvieron en promedio 3.0h dentro de ConTeCon.
          Si el promedio fuera 1.5h, habriamos completado 800 contenedores mas."
        </p>
      </div>
    </div>
  );
}
