import { resumenTrafico } from '../data/mockData';
import { MapPin, AlertTriangle } from 'lucide-react';

const estadoColores = {
  verde: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Sin afectacion' },
  amarillo: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Trafico moderado' },
  rojo: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Congestion' },
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
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Camiones en ruta</p>
          <p className="text-xl font-bold text-azul-medio">{resumenTrafico.camionesEnRuta}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Tiempo transito avg</p>
          <p className="text-xl font-bold text-gray-800">{resumenTrafico.tiempoTransitoPromedio} min</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Incidentes hoy</p>
          <p className="text-xl font-bold text-verde">{resumenTrafico.incidentesHoy}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Desviaciones ruta</p>
          <p className="text-xl font-bold text-verde">{resumenTrafico.desviacionesRuta}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Mapa esquematico de ruta */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ruta PTD - ConTeCon</h3>
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

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Integracion App VIA</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-verde animate-pulse" />
              <span className="text-xs text-gray-500">Conectada - 45 camiones rastreados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
