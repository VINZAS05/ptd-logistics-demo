import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  movimientosIngresados, ingresadosPorDia, ingresadosPorSemana,
  ingresadosPorMes, NAVIERAS, TIPOS_CONTENEDOR,
} from '../data/mockData';

export default function IngresadosPanel() {
  const [filtroNaviera, setFiltroNaviera] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroMes, setFiltroMes] = useState<string>('todos');
  const [vistaGrafico, setVistaGrafico] = useState<'dia' | 'semana' | 'mes'>('dia');

  const meses = [...new Set(ingresadosPorDia.map(d => d.mes))];

  const movsFiltrados = useMemo(() => {
    let movs = movimientosIngresados;
    if (filtroNaviera !== 'todas') movs = movs.filter(m => m.naviera === filtroNaviera);
    if (filtroTipo !== 'todos') movs = movs.filter(m => m.tipo === filtroTipo);
    if (filtroMes !== 'todos') movs = movs.filter(m => m.mes === filtroMes);
    return movs;
  }, [filtroNaviera, filtroTipo, filtroMes]);

  const totalFiltrado = movsFiltrados.reduce((s, m) => s + m.cantidad, 0);

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

  // KPIs
  const promedioDiario = serieDiaria.length > 0 ? Math.round(totalFiltrado / serieDiaria.length) : 0;
  const maxDia = serieDiaria.length > 0 ? Math.max(...serieDiaria.map(d => d.cantidad)) : 0;

  // Tendencia (ultimos 7 vs anteriores 7)
  const tendencia = useMemo(() => {
    if (serieDiaria.length < 14) return null;
    const ultimos7 = serieDiaria.slice(-7).reduce((s, d) => s + d.cantidad, 0);
    const anteriores7 = serieDiaria.slice(-14, -7).reduce((s, d) => s + d.cantidad, 0);
    if (anteriores7 === 0) return null;
    return Math.round(((ultimos7 - anteriores7) / anteriores7) * 100);
  }, [serieDiaria]);

  // Serie segun vista
  const serieActiva = vistaGrafico === 'dia' ? serieDiaria
    : vistaGrafico === 'semana' ? ingresadosPorSemana.map(s => ({ label: `S${s.semana}`, cantidad: s.cantidad }))
    : ingresadosPorMes.map(m => ({ label: m.mes, cantidad: m.cantidad }));

  // Pie navieras
  const pieNavieras = porNaviera.map((n) => ({
    name: NAVIERAS.find(nav => nav.nombre === n.naviera)?.abrev || n.naviera.substring(0, 3),
    value: n.cantidad,
    fill: NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || '#888',
  }));

  // Top tipo como pct para barras segmentadas
  const totalTipos = porTipo.reduce((s, t) => s + t.cantidad, 0);
  const tiposConPct = porTipo.map(t => ({ ...t, pct: totalTipos > 0 ? Math.round((t.cantidad / totalTipos) * 100) : 0 }));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Naviera</label>
              <select value={filtroNaviera} onChange={e => setFiltroNaviera(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none">
                <option value="todas">Todas</option>
                {NAVIERAS.map(n => <option key={n.nombre} value={n.nombre}>{n.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none">
                <option value="todos">Todos</option>
                {TIPOS_CONTENEDOR.map(t => <option key={t.tipo} value={t.tipo}>{t.tipo} - {t.descripcion}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mes</label>
              <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none">
                <option value="todos">Todos</option>
                {meses.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['dia', 'semana', 'mes'] as const).map(v => (
              <button key={v} onClick={() => setVistaGrafico(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${vistaGrafico === v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {v === 'dia' ? 'Diario' : v === 'semana' ? 'Semanal' : 'Mensual'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs font-medium text-blue-100 uppercase">Total Ingresados</p>
          <p className="text-3xl font-black mt-1">{totalFiltrado.toLocaleString()}</p>
          <p className="text-xs text-blue-200 mt-1">contenedores</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Promedio diario</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{promedioDiario.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">cont/dia</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Dia pico</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{maxDia.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">maximo registrado</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Tendencia 7d</p>
          {tendencia !== null ? (
            <>
              <p className={`text-2xl font-bold mt-1 ${tendencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tendencia >= 0 ? '+' : ''}{tendencia}%
              </p>
              <p className="text-xs text-gray-400 mt-1">vs semana anterior</p>
            </>
          ) : (
            <p className="text-lg font-bold text-gray-400 mt-1">--</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Top naviera</p>
          <p className="text-lg font-bold text-gray-800 mt-1">
            {porNaviera.length > 0 ? (NAVIERAS.find(n => n.nombre === porNaviera[0].naviera)?.abrev || porNaviera[0].naviera.substring(0, 6)) : '--'}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {porNaviera.length > 0 ? `${porNaviera[0].cantidad.toLocaleString()} cont.` : ''}
          </p>
        </div>
      </div>

      {/* Grafico principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-3">
          Ingresos {vistaGrafico === 'dia' ? 'por dia' : vistaGrafico === 'semana' ? 'por semana' : 'por mes'}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={serieActiva}>
            <defs>
              <linearGradient id="gradIng" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Ingresados']} />
            <Area type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={2.5}
              fill="url(#gradIng)" dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#2563eb' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Fila inferior */}
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
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
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

        {/* Bar navieras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Ingresados por naviera</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={porNaviera.map(n => ({
              naviera: NAVIERAS.find(nav => nav.nombre === n.naviera)?.abrev || n.naviera.substring(0, 6),
              cantidad: n.cantidad,
            }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="naviera" type="category" tick={{ fontSize: 10 }} width={40} />
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                {porNaviera.map((n, i) => (
                  <Cell key={i} fill={NAVIERAS.find(nav => nav.nombre === n.naviera)?.color || '#3b82f6'} />
                ))}
              </Bar>
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
              <Tooltip formatter={(v) => Number(v).toLocaleString()} />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribucion tipo (porcentaje visual) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3">Composicion por tipo (%)</h3>
          <div className="space-y-2.5 mt-4">
            {tiposConPct.slice(0, 7).map(t => (
              <div key={t.tipo}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-600">{t.tipo}</span>
                  <span className="text-xs text-gray-400">{t.pct}% ({t.cantidad.toLocaleString()})</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                    style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
