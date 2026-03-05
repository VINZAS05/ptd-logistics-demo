import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { resumenPagos, pagosTransportistas } from '../data/mockData';

const estadoPago = {
  pendiente: { label: 'Pendiente', bg: 'bg-amber-100', text: 'text-amber-700' },
  procesado: { label: 'Procesado', bg: 'bg-blue-100', text: 'text-blue-700' },
  completado: { label: 'Pagado', bg: 'bg-green-100', text: 'text-green-700' },
};

export default function PagosPanel() {
  const chartData = pagosTransportistas
    .filter(p => p.monto > 0)
    .map(p => ({
      nombre: p.transportista.split(' ').slice(-1)[0],
      monto: p.monto,
      viajes: p.viajes,
    }));

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Pagos procesados</p>
          <p className="text-xl font-bold text-verde">${(resumenPagos.procesadosHoy / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Pendientes</p>
          <p className="text-xl font-bold text-naranja">${(resumenPagos.pendientes / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Transportistas pagados</p>
          <p className="text-xl font-bold text-gray-800">{resumenPagos.transportistasPagados}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Facturas CFDI</p>
          <p className="text-xl font-bold text-gray-800">{resumenPagos.facturasTimbradas}/{resumenPagos.facturasEmitidas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Tiempo avg pago</p>
          <p className="text-xl font-bold text-azul-medio">{resumenPagos.tiempoPromedioPago}h</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Grafico de pagos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pagos por transportista</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v: number | undefined) => `$${(v ?? 0).toLocaleString()}`} />
              <Bar dataKey="monto" fill="#28A050" name="Monto" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de pagos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Detalle de pagos</h3>
          <div className="overflow-y-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Transportista</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Monto</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Viajes</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">CFDI</th>
                  <th className="text-center py-1.5 text-gray-500 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagosTransportistas.map((pago) => {
                  const est = estadoPago[pago.estado];
                  return (
                    <tr key={pago.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{pago.transportista}</td>
                      <td className="py-2 text-right font-semibold text-gray-800">
                        {pago.monto > 0 ? `$${pago.monto.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-2 text-center text-gray-500">{pago.viajes}</td>
                      <td className="py-2 text-center text-gray-400 text-[10px]">{pago.cfdi || '-'}</td>
                      <td className="py-2 text-center">
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
        </div>
      </div>

      {/* Flujo de pago */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Flujo automatizado de pago</h3>
        <div className="flex items-center justify-between">
          {[
            { paso: 'ConTeCon confirma\nrecepcion', color: 'bg-azul-oscuro' },
            { paso: 'Validacion auto.\ndel viaje (GPS)', color: 'bg-azul-medio' },
            { paso: 'CFDI 4.0 + Carta\nPorte 3.1 auto.', color: 'bg-azul-claro' },
            { paso: 'Pago SPEI\ndia siguiente', color: 'bg-verde' },
            { paso: 'Notificacion\nal transportista', color: 'bg-verde' },
          ].map((item, i) => (
            <div key={i} className="flex items-center">
              <div className={`${item.color} text-white text-[10px] text-center px-3 py-3 rounded-lg whitespace-pre-line leading-tight min-w-[100px]`}>
                {item.paso}
              </div>
              {i < 4 && <span className="text-gray-300 mx-1 text-lg font-bold">&gt;</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
