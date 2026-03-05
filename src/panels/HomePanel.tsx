import { AlertTriangle, AlertCircle, Info, Container, Truck, DoorOpen, Route, Wrench } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KpiCard from '../components/KpiCard';
import {
  resumenPatio, resumenEvacuacion, resumenTrafico,
  alertas, operacionesRecientes, tendenciaSemanal,
  datosOperacionales, NAVIERAS, resumenMaquinaria,
} from '../data/mockData';

const navieraColor: Record<string, string> = {};
NAVIERAS.forEach(n => { navieraColor[n.nombre] = n.color; });

const estadoColor = { verde: 'bg-verde', amarillo: 'bg-naranja', rojo: 'bg-rojo' };
const alertaIcono = {
  critica: <AlertTriangle size={14} className="text-red-500" />,
  warning: <AlertCircle size={14} className="text-amber-500" />,
  info: <Info size={14} className="text-blue-500" />,
};
const alertaBg = {
  critica: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-blue-200',
};
const opIconColor = {
  ingreso: 'text-blue-500',
  salida: 'text-green-500',
  pago: 'text-amber-500',
  evacuacion: 'text-purple-500',
  alerta: 'text-red-500',
};

export default function HomePanel() {
  const pieNavieraData = datosOperacionales.contenedoresEnPatio.porNaviera.map(n => ({
    name: n.naviera,
    value: n.cantidad,
    color: navieraColor[n.naviera] || '#888',
  }));

  const tipoBarData = datosOperacionales.contenedoresEnPatio.porTipo.map(t => ({
    tipo: t.tipo,
    cantidad: t.cantidad,
  }));

  return (
    <div className="space-y-5">
      {/* KPIs principales */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          titulo="Contenedores en patio"
          valor={datosOperacionales.contenedoresEnPatio.total.toLocaleString()}
          subtitulo={`+${resumenPatio.deltaHoy} hoy | ${resumenPatio.ocupacion}% ocupacion`}
          color="bg-azul-medio"
          icono={<Container size={18} />}
        />
        <KpiCard
          titulo="Ingresados (acum)"
          valor={datosOperacionales.contenedoresIngresados.total.toLocaleString()}
          subtitulo="Total historico"
          color="bg-verde"
          icono={<Truck size={18} />}
        />
        <KpiCard
          titulo="Evacuados (acum)"
          valor={datosOperacionales.contenedoresEvacuados.total.toLocaleString()}
          subtitulo="Total historico"
          color="bg-azul-claro"
          icono={<DoorOpen size={18} />}
        />
        <KpiCard
          titulo="Maquinaria activa"
          valor={`${resumenMaquinaria.operando}/${resumenMaquinaria.totalMaquinas}`}
          subtitulo={`${resumenMaquinaria.maniobrasHoyTotal} maniobras hoy`}
          color="bg-naranja"
          icono={<Wrench size={18} />}
        />
        <KpiCard
          titulo="Estado trafico"
          valor={resumenTrafico.estado.toUpperCase()}
          subtitulo={`${resumenTrafico.camionesEnRuta} camiones en ruta`}
          color={estadoColor[resumenTrafico.estado]}
          icono={<Route size={18} />}
        />
      </div>

      {/* Contenedores por naviera + por tipo + alertas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Contenedores en patio por naviera</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieNavieraData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value" paddingAngle={1}>
                {pieNavieraData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number | undefined) => (v ?? 0).toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
            {datosOperacionales.contenedoresEnPatio.porNaviera.map(n => (
              <div key={n.naviera} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded" style={{ backgroundColor: navieraColor[n.naviera] }} />
                  <span className="text-gray-600 truncate">{n.naviera}</span>
                </div>
                <span className="font-semibold text-gray-800">{n.cantidad.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Contenedores por tipo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tipoBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10 }} width={40} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#4682C8" name="Cantidad" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Alertas
            <span className="ml-2 text-xs font-normal text-red-500">
              {alertas.filter(a => a.tipo === 'critica').length} criticas
            </span>
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {alertas.map((alerta) => (
              <div key={alerta.id} className={`flex items-start gap-2 p-2 rounded border text-xs ${alertaBg[alerta.tipo]}`}>
                {alertaIcono[alerta.tipo]}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 leading-tight">{alerta.mensaje}</p>
                  <p className="text-gray-400 mt-0.5">{alerta.hora} - {alerta.modulo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grafico semanal + historico acumulado */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Movimientos semanal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tendenciaSemanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#4682C8" name="Ingresos" radius={[2, 2, 0, 0]} />
              <Bar dataKey="evacuados" fill="#28A050" name="Evacuados" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Historico acumulado</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Total ingresados</p>
              <p className="text-2xl font-bold text-blue-800">{datosOperacionales.contenedoresIngresados.total.toLocaleString()}</p>
              <div className="mt-2 space-y-0.5">
                {datosOperacionales.contenedoresIngresados.porNaviera.slice(0, 4).map(n => (
                  <div key={n.naviera} className="flex justify-between text-[10px]">
                    <span className="text-blue-600">{n.naviera}</span>
                    <span className="font-semibold text-blue-800">{n.cantidad.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">Total evacuados</p>
              <p className="text-2xl font-bold text-green-800">{datosOperacionales.contenedoresEvacuados.total.toLocaleString()}</p>
              <div className="mt-2 space-y-0.5">
                {datosOperacionales.contenedoresEvacuados.porNaviera.slice(0, 4).map(n => (
                  <div key={n.naviera} className="flex justify-between text-[10px]">
                    <span className="text-green-600">{n.naviera}</span>
                    <span className="font-semibold text-green-800">{n.cantidad.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evacuacion por naviera + Feed */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Evacuacion en vivo</h3>
          <div className="space-y-2.5">
            {resumenEvacuacion.porNaviera.map((nav) => (
              <div key={nav.naviera} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-28 shrink-0">
                  <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: navieraColor[nav.naviera] }} />
                  <span className="text-xs text-gray-500 truncate">{nav.naviera}</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${nav.porcentaje >= 95 ? 'bg-verde' : nav.porcentaje >= 80 ? 'bg-azul-medio' : nav.porcentaje >= 50 ? 'bg-naranja' : 'bg-rojo'}`}
                    style={{ width: `${nav.porcentaje}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-24 text-right">
                  {nav.completados}/{nav.solicitados} ({nav.porcentaje}%)
                </span>
                {nav.porcentaje >= 95 && <span className="text-green-500 text-xs">OK</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Hora estimada fin: {resumenEvacuacion.horaEstimadaFin}</span>
            <span>{resumenEvacuacion.enRuta} camiones en ruta</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ultimas operaciones</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {operacionesRecientes.map((op) => (
              <div key={op.id} className="flex items-start gap-2 text-xs">
                <span className="text-gray-400 shrink-0 w-10">{op.hora}</span>
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${opIconColor[op.tipo].replace('text-', 'bg-')}`} />
                <span className="text-gray-600">{op.descripcion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
