import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line,
} from 'recharts';
import {
  datosOperacionales, movimientosEnPatio, enPatioPorDia, enPatioPorMesIngreso,
  diasPromedioPatio, NAVIERAS, TIPOS_CONTENEDOR, capacidadTotalPlano,
  type Naviera, type TipoContenedor,
} from '../data/mockData';

const COLORS_ORANGE = ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

const data = datosOperacionales.contenedoresEnPatio;

export default function EnPatioPanel() {
  const [filtroNaviera, setFiltroNaviera] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('todos');

  const meses = [...new Set(enPatioPorDia.map(d => d.mes))];

  const movsFiltrados = useMemo(() => {
    let movs = movimientosEnPatio;
    if (filtroNaviera !== 'todas') movs = movs.filter(m => m.naviera === filtroNaviera);
    if (filtroTipo !== 'todos') movs = movs.filter(m => m.tipo === filtroTipo);
    if (filtroMes !== 'todos') movs = movs.filter(m => m.mes === filtroMes);
    return movs;
  }, [filtroNaviera, filtroTipo, filtroMes]);

  const totalFiltrado = movsFiltrados.reduce((s, m) => s + m.cantidad, 0);
  const ocupacionPct = Math.round((totalFiltrado / capacidadTotalPlano) * 100);

  // Agrupar por dia
  const serieDiaria = useMemo(() => {
    const map = new Map<string, number>();
    movsFiltrados.forEach(m => {
      const key = `${m.mes.substring(0, 3)} ${m.dia}`;
      map.set(key, (map.get(key) || 0) + m.cantidad);
    });
    return Array.from(map.entries()).map(([label, cantidad]) => ({ label, cantidad }));
  }, [movsFiltrados]);

  // Agrupar por naviera
  const porNaviera = useMemo(() => {
    const map = new Map<string, number>();
    movsFiltrados.forEach(m => map.set(m.naviera, (map.get(m.naviera) || 0) + m.cantidad));
    return Array.from(map.entries())
      .map(([naviera, cantidad]) => ({ naviera, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [movsFiltrados]);

  // Agrupar por tipo
  const porTipo = useMemo(() => {
    const map = new Map<string, number>();
    movsFiltrados.forEach(m => map.set(m.tipo, (map.get(m.tipo) || 0) + m.cantidad));
    return Array.from(map.entries())
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [movsFiltrados]);

  // Pie navieras
  const pieNavieras = porNaviera.map((n, i) => ({
    name: NAVIERAS.find(nav => nav.nombre === n.naviera)?.abrev || n.naviera.substring(0, 3),
    fullName: n.naviera,
    value: n.cantidad,
    fill: NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || COLORS_ORANGE[i],
  }));

  // Dias promedio combinado con cantidad
  const diasVsCant = diasPromedioPatio.map(d => ({
    naviera: NAVIERAS.find(n => n.nombre === d.naviera)?.abrev || d.naviera.substring(0, 4),
    dias: d.dias,
    cantidad: porNaviera.find(n => n.naviera === d.naviera)?.cantidad || 0,
  })).filter(d => d.cantidad > 0).sort((a, b) => b.dias - a.dias);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Naviera</label>
            <select value={filtroNaviera} onChange={e => setFiltroNaviera(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none">
              <option value="todas">Todas</option>
              {NAVIERAS.map(n => <option key={n.nombre} value={n.nombre}>{n.nombre}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none">
              <option value="todos">Todos</option>
              {TIPOS_CONTENEDOR.map(t => <option key={t.tipo} value={t.tipo}>{t.tipo} - {t.descripcion}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes entrada</label>
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none">
              <option value="todos">Todos</option>
              {meses.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs font-medium text-orange-100 uppercase">En Patio</p>
          <p className="text-3xl font-black mt-1">{totalFiltrado.toLocaleString()}</p>
          <p className="text-xs text-orange-200 mt-1">contenedores</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Capacidad total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{capacidadTotalPlano.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">ground slots</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Ocupacion</p>
          <p className={`text-2xl font-bold mt-1 ${ocupacionPct > 80 ? 'text-red-600' : ocupacionPct > 60 ? 'text-amber-600' : 'text-green-600'}`}>
            {ocupacionPct}%
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className={`h-full rounded-full ${ocupacionPct > 80 ? 'bg-red-500' : ocupacionPct > 60 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(ocupacionPct, 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Dias prom. estancia</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {(diasPromedioPatio.reduce((s, d) => s + d.dias, 0) / diasPromedioPatio.length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-400 mt-1">dias promedio</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Navieras</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{porNaviera.length}</p>
          <p className="text-xs text-gray-400 mt-1">con contenedores</p>
        </div>
      </div>

      {/* Grafico principal - Entradas por dia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Contenedores ingresados al patio por dia</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={serieDiaria}>
            <defs>
              <linearGradient id="gradPatio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Contenedores']} />
            <Area type="monotone" dataKey="cantidad" stroke="#f97316" strokeWidth={2.5}
              fill="url(#gradPatio)" dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#ea580c' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fila inferior: Pie + Naviera bar + Tipo + Dias promedio */}
      <div className="grid grid-cols-4 gap-4">
        {/* Pie navieras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Distribucion por naviera</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieNavieras} cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                dataKey="value" paddingAngle={2} strokeWidth={0}>
                {pieNavieras.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {pieNavieras.slice(0, 6).map(n => (
              <div key={n.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.fill }} />
                <span className="text-[10px] text-gray-500">{n.name} ({n.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingresados por mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Fecha de ingreso (por mes)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={enPatioPorMesIngreso}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="mes" tick={{ fontSize: 9, angle: -25 }} height={45} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
              <Bar dataKey="cantidad" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tipo contenedor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Por tipo de contenedor</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porTipo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10, fontWeight: 600 }} width={45} />
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
              <Bar dataKey="cantidad" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dias promedio estancia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Dias prom. estancia por naviera</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={diasVsCant} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 25]} />
              <YAxis dataKey="naviera" type="category" tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={(v: number) => [`${v} dias`, 'Estancia prom.']} />
              <Bar dataKey="dias" radius={[0, 4, 4, 0]}>
                {diasVsCant.map((d, i) => (
                  <Cell key={i} fill={d.dias > 18 ? '#ef4444' : d.dias > 12 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
