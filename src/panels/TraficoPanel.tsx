import { resumenTrafico } from '../data/mockData';
import { MapPin, AlertTriangle, Clock, TrendingUp, Navigation, Zap, Radio } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const estadoColores = {
  verde: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Sin afectacion' },
  amarillo: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Trafico moderado' },
  rojo: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Congestion' },
};

// GPS Analytics - Tiempos por geocerca (datos de app VIA/Flybits)
const tiemposPorCheckpoint = [
  { checkpoint: 'Salida PTD', tiempoAvg: 0, camiones: 45 },
  { checkpoint: 'Pancho Villa', tiempoAvg: 8, camiones: 12 },
  { checkpoint: 'Jalipa', tiempoAvg: 18, camiones: 8 },
  { checkpoint: 'Carretera Colima', tiempoAvg: 28, camiones: 15 },
  { checkpoint: 'Entrada ConTeCon', tiempoAvg: 42, camiones: 10 },
];

// Tiempos de transito por hora del dia (historico GPS)
const transitoPorHora = [
  { hora: '06:00', tiempoMin: 35, camiones: 18, optimo: 32 },
  { hora: '07:00', tiempoMin: 38, camiones: 28, optimo: 32 },
  { hora: '08:00', tiempoMin: 48, camiones: 42, optimo: 32 },
  { hora: '09:00', tiempoMin: 55, camiones: 45, optimo: 32 },
  { hora: '10:00', tiempoMin: 52, camiones: 38, optimo: 32 },
  { hora: '11:00', tiempoMin: 45, camiones: 30, optimo: 32 },
  { hora: '12:00', tiempoMin: 42, camiones: 25, optimo: 32 },
  { hora: '13:00', tiempoMin: 40, camiones: 22, optimo: 32 },
  { hora: '14:00', tiempoMin: 44, camiones: 32, optimo: 32 },
  { hora: '15:00', tiempoMin: 50, camiones: 35, optimo: 32 },
  { hora: '16:00', tiempoMin: 46, camiones: 28, optimo: 32 },
  { hora: '17:00', tiempoMin: 38, camiones: 20, optimo: 32 },
  { hora: '18:00', tiempoMin: 34, camiones: 12, optimo: 32 },
];

// Camiones activos con GPS pasivo
const camionesGPS = [
  { id: 'GPS-01', placa: 'JN-847-KL', transportista: 'Transportes Gomez', segmento: 'Jalipa → ConTeCon', velocidad: 45, tiempoViaje: 22, estado: 'en_ruta' as const },
  { id: 'GPS-02', placa: 'MZ-123-AB', transportista: 'Fletes del Pacifico', segmento: 'ConTeCon (carga)', velocidad: 0, tiempoViaje: 48, estado: 'en_contecon' as const },
  { id: 'GPS-03', placa: 'CL-456-XY', transportista: 'Carga Express Col.', segmento: 'Pancho Villa → Jalipa', velocidad: 52, tiempoViaje: 12, estado: 'en_ruta' as const },
  { id: 'GPS-04', placa: 'MZ-789-CD', transportista: 'Trans. Hernandez', segmento: 'Regreso PTD', velocidad: 48, tiempoViaje: 35, estado: 'regreso' as const },
  { id: 'GPS-05', placa: 'JN-321-EF', transportista: 'Autotransportes Silva', segmento: 'Salida PTD', velocidad: 20, tiempoViaje: 3, estado: 'en_ruta' as const },
  { id: 'GPS-06', placa: 'CL-654-GH', transportista: 'Fletes Colima', segmento: 'Parada no autorizada', velocidad: 0, tiempoViaje: 67, estado: 'anomalia' as const },
];

const estadoCamionConfig = {
  en_ruta: { label: 'En ruta', bg: 'bg-green-100', text: 'text-green-700' },
  en_contecon: { label: 'En ConTeCon', bg: 'bg-blue-100', text: 'text-blue-700' },
  regreso: { label: 'Regreso', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  anomalia: { label: 'Anomalia', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function TraficoPanel() {
  const estado = estadoColores[resumenTrafico.estado];

  return (
    <div className="space-y-5">
      {/* Estado global */}
      <div className={`${estado.bg} rounded-lg p-4 flex items-center justify-between`}>
        <div>
          <h3 className={`text-lg font-bold ${estado.text}`}>Estado del trafico: {resumenTrafico.estado.toUpperCase()}</h3>
          <p className={`text-sm ${estado.text} opacity-70`}>{estado.label}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${estado.dot} flex items-center justify-center`}>
          <span className="text-white text-xl font-bold">{resumenTrafico.camionesEnRuta}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Camiones en ruta</p>
          <p className="text-xl font-bold text-azul-medio">{resumenTrafico.camionesEnRuta}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Tiempo transito avg</p>
          <p className="text-xl font-bold text-gray-800">{resumenTrafico.tiempoTransitoPromedio} min</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">GPS activos</p>
          <p className="text-xl font-bold text-verde">{camionesGPS.length}</p>
          <p className="text-[10px] text-gray-400">tracking pasivo</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Incidentes hoy</p>
          <p className="text-xl font-bold text-verde">{resumenTrafico.incidentesHoy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Anomalias GPS</p>
          <p className="text-xl font-bold text-rojo">{camionesGPS.filter(c => c.estado === 'anomalia').length}</p>
          <p className="text-[10px] text-gray-400">paradas no autorizadas</p>
        </div>
      </div>

      {/* Prediccion de tiempo */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Zap size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-700">Prediccion de transito en tiempo real</p>
            <p className="text-xs text-blue-600 mt-1">
              Si un camion sale ahora del patio, llegara a ConTeCon en <strong>~44 min</strong> (trafico actual en carretera Colima-Mzllo).
              Horario optimo recomendado: <strong>06:00-07:00</strong> o <strong>17:00-18:00</strong> (35 min promedio).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Grafico tiempos de transito por hora */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Tiempo de transito por hora (GPS real)</h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4682C8]" /> Tiempo real</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#28A050]" /> Optimo</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={transitoPorHora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'min', position: 'insideTopLeft', style: { fontSize: 10 } }} />
              <Tooltip formatter={(v, n) => [n === 'optimo' ? `${v} min` : `${v} min`, n === 'optimo' ? 'Optimo' : n === 'tiempoMin' ? 'Tiempo real' : 'Camiones']} />
              <Area type="monotone" dataKey="tiempoMin" stroke="#4682C8" fill="#4682C8" fillOpacity={0.15} strokeWidth={2} name="Tiempo real" />
              <Area type="monotone" dataKey="optimo" stroke="#28A050" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Optimo" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Camiones por checkpoint (geocercas) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Camiones por geocerca</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tiemposPorCheckpoint} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="checkpoint" type="category" tick={{ fontSize: 9 }} width={90} />
              <Tooltip />
              <Bar dataKey="camiones" fill="#4682C8" radius={[0, 4, 4, 0]} name="Camiones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Mapa esquematico de ruta */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ruta PTD - ConTeCon (geocercas VIA)</h3>
          <div className="relative">
            {/* Ruta visual */}
            <div className="flex items-center justify-between px-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-azul-oscuro rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">PATIO<br/>PTD</span>
                </div>
              </div>

              <div className="flex-1 mx-4 relative">
                <div className="h-2 bg-verde rounded-full" />
                {/* Checkpoints */}
                <div className="absolute -top-6 left-[20%] text-center">
                  <MapPin size={14} className="text-azul-claro mx-auto" />
                  <span className="text-[9px] text-gray-500">Km 3</span>
                  <br />
                  <span className="text-[9px] text-verde font-medium">12 cam.</span>
                </div>
                <div className="absolute -top-6 left-[50%] text-center">
                  <MapPin size={14} className="text-azul-claro mx-auto" />
                  <span className="text-[9px] text-gray-500">Km 8</span>
                  <br />
                  <span className="text-[9px] text-verde font-medium">8 cam.</span>
                </div>
                <div className="absolute -top-6 left-[80%] text-center">
                  <MapPin size={14} className="text-azul-claro mx-auto" />
                  <span className="text-[9px] text-gray-500">Km 12</span>
                  <br />
                  <span className="text-[9px] text-verde font-medium">5 cam.</span>
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-verde rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">CONT<br/>ECON</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            Distancia total: 14 km | Tiempo promedio: {resumenTrafico.tiempoTransitoPromedio} min
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Radio size={12} className="text-verde" />
              <h4 className="text-xs font-semibold text-gray-600">GPS Pasivo VIA/Flybits</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-verde animate-pulse" />
              <span className="text-xs text-gray-500">Conectada - {camionesGPS.length} camiones rastreados automaticamente</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Deteccion automatica inicio/fin viaje por geocerca. Sin interaccion del operador.</p>
          </div>
        </div>

        {/* Zonas y estado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado por zona</h3>
          <div className="space-y-3">
            {resumenTrafico.zonas.map((zona) => {
              const zEstado = estadoColores[zona.estado];
              return (
                <div key={zona.nombre} className={`p-3 rounded-lg border ${zEstado.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${zEstado.dot}`} />
                      <span className="text-sm font-medium text-gray-700">{zona.nombre}</span>
                    </div>
                    <span className={`text-xs font-medium ${zEstado.text}`}>{zEstado.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700">Obras carretera Colima-Manzanillo</p>
                <p className="text-[10px] text-blue-500">Paros parciales de 10-15 min cada hora. Camiones se acumulan al reabrirse.</p>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-amber-500 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Horarios optimos de evacuacion</p>
                <p className="text-[10px] text-amber-600">
                  06:00-07:00 (35 min avg) | 17:00-18:00 (36 min avg)
                </p>
                <p className="text-[10px] text-amber-500 mt-0.5">Evitar 08:00-10:00 (48-55 min por congestion)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de camiones con GPS activo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-gray-500" />
            <h3 className="text-sm font-bold text-gray-700">Camiones con GPS activo (tracking pasivo)</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-verde animate-pulse" />
            <span className="text-[10px] text-gray-500">{camionesGPS.length} rastreados en tiempo real</span>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Placa</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Transportista</th>
              <th className="px-4 py-2.5 text-left text-gray-500 font-medium">Segmento</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Velocidad</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Tiempo viaje</th>
              <th className="px-4 py-2.5 text-center text-gray-500 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {camionesGPS.map(c => {
              const est = estadoCamionConfig[c.estado];
              return (
                <tr key={c.id} className={`border-t border-gray-50 hover:bg-gray-50/50 ${c.estado === 'anomalia' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-2.5 font-bold text-gray-800">{c.placa}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.transportista}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.segmento}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={c.velocidad === 0 ? 'text-red-500 font-bold' : 'text-gray-700'}>{c.velocidad} km/h</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={c.tiempoViaje > 60 ? 'text-red-600 font-bold' : 'text-gray-700'}>{c.tiempoViaje} min</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${est.bg} ${est.text}`}>
                      {est.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-700">Anomalias detectadas (GPS)</h4>
              <p className="text-xs text-red-600 mt-1">
                <strong>Fletes Colima (CL-654-GH)</strong>: Parada no autorizada de 67 min en zona no permitida. Sin movimiento desde las 13:43.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-start gap-2">
            <TrendingUp size={16} className="text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-700">Analytics de ruta</h4>
              <p className="text-xs text-green-600 mt-1">
                Hoy el tiempo promedio es 42 min (5% mejor que ayer).
                Mejor hora: 06:00-07:00 con 35 min promedio.
                Viajes completados hoy: 187.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
