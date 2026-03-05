import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  movimientosEvacuados, evacuadosPorDia, evacuadosPorSemana,
  evacuadosPorMes, tiempoEvacuacion, NAVIERAS, TIPOS_CONTENEDOR,
} from '../data/mockData';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export default function EvacuadosPanel() {
  const [filtroNaviera, setFiltroNaviera] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [vistaGrafico, setVistaGrafico] = useState<'dia' | 'semana' | 'mes'>('dia');

  const meses = [...new Set(evacuadosPorDia.map(d => d.mes))];

  // Filtrar movimientos detallados
  const movsFiltrados = useMemo(() => {
    let movs = movimientosEvacuados;
    if (filtroNaviera !== 'todas') movs = movs.filter(m => m.naviera === filtroNaviera);
    if (filtroTipo !== 'todos') movs = movs.filter(m => m.tipo === filtroTipo);
    if (filtroMes !== 'todos') movs = movs.filter(m => m.mes === filtroMes);
    return movs;
  }, [filtroNaviera, filtroTipo, filtroMes]);

  const totalFiltrado = movsFiltrados.reduce((s, m) => s + m.cantidad, 0);

  // Agrupar por dia para serie temporal
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

  // KPIs
  const promedioDiario = serieDiaria.length > 0 ? Math.round(totalFiltrado / serieDiaria.length) : 0;
  const maxDia = serieDiaria.length > 0 ? Math.max(...serieDiaria.map(d => d.cantidad)) : 0;
  const minDia = serieDiaria.length > 0 ? Math.min(...serieDiaria.map(d => d.cantidad)) : 0;

  // Datos para serie segun vista
  const serieActiva = vistaGrafico === 'dia' ? serieDiaria
    : vistaGrafico === 'semana' ? evacuadosPorSemana.map(s => ({ label: `S${s.semana}`, cantidad: s.cantidad }))
    : evacuadosPorMes.map(m => ({ label: m.mes, cantidad: m.cantidad }));

  // Pie data de navieras
  const pieNavieras = porNaviera.map((n, i) => ({
    name: NAVIERAS.find(nav => nav.nombre === n.naviera)?.abrev || n.naviera.substring(0, 3),
    value: n.cantidad,
    fill: NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Naviera</label>
              <select value={filtroNaviera} onChange={e => setFiltroNaviera(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none">
                <option value="todas">Todas</option>
                {NAVIERAS.map(n => <option key={n.nombre} value={n.nombre}>{n.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none">
                <option value="todos">Todos</option>
                {TIPOS_CONTENEDOR.map(t => <option key={t.tipo} value={t.tipo}>{t.tipo} - {t.descripcion}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</label>
              <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none">
                <option value="todos">Todos</option>
                {meses.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['dia', 'semana', 'mes'] as const).map(v => (
              <button key={v} onClick={() => setVistaGrafico(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${vistaGrafico === v ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'dia' ? 'Diario' : v === 'semana' ? 'Semanal' : 'Mensual'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs font-medium text-green-100 uppercase">Total Evacuados</p>
          <p className="text-3xl font-black mt-1">{totalFiltrado.toLocaleString()}</p>
          <p className="text-xs text-green-200 mt-1">contenedores</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Promedio diario</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{promedioDiario.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-green-500 text-xs">cont/dia</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Dia pico</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{maxDia.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">maximo registrado</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Dia minimo</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{minDia.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">minimo registrado</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Navieras activas</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{porNaviera.length}</p>
          <p className="text-xs text-gray-400 mt-1">con movimientos</p>
        </div>
      </div>

      {/* Grafico principal - Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Evacuaciones {vistaGrafico === 'dia' ? 'por dia' : vistaGrafico === 'semana' ? 'por semana' : 'por mes'}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={serieActiva}>
            <defs>
              <linearGradient id="gradEvac" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Evacuados']} />
            <Area type="monotone" dataKey="cantidad" stroke="#10b981" strokeWidth={2.5}
              fill="url(#gradEvac)" dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#059669' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fila inferior: Naviera pie + Naviera bar + Tipo bar + Tiempo evacuacion */}
      <div className="grid grid-cols-4 gap-4">
        {/* Pie navieras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Distribucion por naviera</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieNavieras} cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                dataKey="value" paddingAngle={2} strokeWidth={0}>
                {pieNavieras.map((_, i) => <Cell key={i} fill={pieNavieras[i].fill} />)}
              </Pie>
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-1">
            {pieNavieras.slice(0, 6).map(n => (
              <div key={n.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.fill }} />
                <span className="text-[10px] text-gray-500">{n.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar navieras horizontal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Evacuados por naviera</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porNaviera.map(n => ({
              naviera: NAVIERAS.find(nav => nav.nombre === n.naviera)?.abrev || n.naviera.substring(0, 6),
              cantidad: n.cantidad,
              fill: NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || '#888',
            }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="naviera" type="category" tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {porNaviera.map((n, i) => (
                  <Cell key={i} fill={NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar tipos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Evacuados por tipo</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porTipo} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10, fontWeight: 600 }} width={45} />
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
              <Bar dataKey="cantidad" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tiempo promedio evacuacion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Tiempo prom. evacuacion (hrs)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={tiempoEvacuacion.map(t => ({
              naviera: NAVIERAS.find(n => n.nombre === t.naviera)?.abrev || t.naviera.substring(0, 4),
              horas: t.horas,
              fill: t.horas > 5 ? '#ef4444' : t.horas > 4 ? '#f59e0b' : '#10b981',
            }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 7]} />
              <YAxis dataKey="naviera" type="category" tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={(v) => [`${v}h`, 'Tiempo prom.']} />
              <Bar dataKey="horas" radius={[0, 4, 4, 0]}>
                {tiempoEvacuacion.map((t, i) => (
                  <Cell key={i} fill={t.horas > 5 ? '#ef4444' : t.horas > 4 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
