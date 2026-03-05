import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, Filter, ChevronDown, ChevronUp, Package, Calendar, Ship } from 'lucide-react';
import {
  islasDetalladas, NAVIERAS, TIPOS_CONTENEDOR, initIslasIfNeeded,
  type Naviera, type TipoContenedor, type ContenedorStack,
} from '../data/mockData';

const navieraColor: Record<string, string> = {};
NAVIERAS.forEach(n => { navieraColor[n.nombre] = n.color; });

interface ContenedorRow {
  contenedor: ContenedorStack;
  islaId: string;
  islaNombre: string;
  fila: number;
  columna: number;
  nivel: number;
}

// Extraer todos los contenedores de todas las islas
function extraerContenedores(): ContenedorRow[] {
  const rows: ContenedorRow[] = [];
  for (const isla of islasDetalladas) {
    for (let f = 0; f < isla.grid.length; f++) {
      for (let c = 0; c < isla.grid[f].length; c++) {
        const celda = isla.grid[f][c];
        for (let n = 0; n < celda.nivelOcupado; n++) {
          const cont = celda.contenedores[n];
          if (!cont) continue;
          rows.push({
            contenedor: cont,
            islaId: isla.config.id,
            islaNombre: isla.config.nombre,
            fila: f + 1,
            columna: c + 1,
            nivel: n + 1,
          });
        }
      }
    }
  }
  return rows;
}

const todosContenedores = extraerContenedores();

type SortField = 'id' | 'naviera' | 'tipo' | 'fechaIngreso' | 'diasEnPatio' | 'isla' | 'estado';
type SortDir = 'asc' | 'desc';

export default function ContenedoresPanel() {
  initIslasIfNeeded();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNaviera, setFilterNaviera] = useState<Naviera | ''>('');
  const [filterTipo, setFilterTipo] = useState<TipoContenedor | ''>('');
  const [filterEstado, setFilterEstado] = useState<ContenedorStack['estado'] | ''>('');
  const [filterZona, setFilterZona] = useState<'norte' | 'sur' | ''>('');
  const [sortField, setSortField] = useState<SortField>('fechaIngreso');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Filtrar y ordenar
  const filtered = useMemo(() => {
    let rows = todosContenedores;

    if (searchTerm.length >= 3) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(r => r.contenedor.id.toLowerCase().includes(term));
    }
    if (filterNaviera) {
      rows = rows.filter(r => r.contenedor.naviera === filterNaviera);
    }
    if (filterTipo) {
      rows = rows.filter(r => r.contenedor.tipoContenedor === filterTipo);
    }
    if (filterEstado) {
      rows = rows.filter(r => r.contenedor.estado === filterEstado);
    }
    if (filterZona) {
      rows = rows.filter(r => filterZona === 'norte' ? r.islaId.startsWith('ISLA-') : r.islaId.startsWith('SUR-'));
    }

    // Ordenar
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'id': cmp = a.contenedor.id.localeCompare(b.contenedor.id); break;
        case 'naviera': cmp = a.contenedor.naviera.localeCompare(b.contenedor.naviera); break;
        case 'tipo': cmp = a.contenedor.tipoContenedor.localeCompare(b.contenedor.tipoContenedor); break;
        case 'fechaIngreso': cmp = a.contenedor.fechaIngreso.localeCompare(b.contenedor.fechaIngreso); break;
        case 'diasEnPatio': cmp = a.contenedor.diasEnPatio - b.contenedor.diasEnPatio; break;
        case 'isla': cmp = a.islaId.localeCompare(b.islaId); break;
        case 'estado': cmp = a.contenedor.estado.localeCompare(b.contenedor.estado); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [searchTerm, filterNaviera, filterTipo, filterEstado, filterZona, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice(page * pageSize, (page + 1) * pageSize);

  // Resumen por naviera
  const resumenNaviera = useMemo(() => {
    const counts: Record<string, number> = {};
    NAVIERAS.forEach(n => { counts[n.nombre] = 0; });
    for (const r of todosContenedores) {
      counts[r.contenedor.naviera] = (counts[r.contenedor.naviera] || 0) + 1;
    }
    return NAVIERAS.map(n => ({ naviera: n.nombre, count: counts[n.nombre], color: n.color }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // Resumen filtrado
  const filteredResumen = useMemo(() => {
    const counts: Record<string, number> = {};
    NAVIERAS.forEach(n => { counts[n.nombre] = 0; });
    for (const r of filtered) {
      counts[r.contenedor.naviera] = (counts[r.contenedor.naviera] || 0) + 1;
    }
    return NAVIERAS.map(n => ({ naviera: n.nombre, count: counts[n.nombre], color: n.color }))
      .filter(n => n.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown size={10} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-blue-500" />
      : <ChevronDown size={10} className="text-blue-500" />;
  };

  const estadoLabel: Record<string, { text: string; bg: string; fg: string }> = {
    almacenado: { text: 'Almacenado', bg: 'bg-gray-100', fg: 'text-gray-600' },
    listo_evacuar: { text: 'Listo evacuar', bg: 'bg-yellow-100', fg: 'text-yellow-700' },
    en_inspeccion: { text: 'Inspeccion', bg: 'bg-red-100', fg: 'text-red-600' },
    reefer: { text: 'Reefer', bg: 'bg-cyan-100', fg: 'text-cyan-700' },
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterNaviera('');
    setFilterTipo('');
    setFilterEstado('');
    setFilterZona('');
    setPage(0);
  };

  const hasFilters = searchTerm || filterNaviera || filterTipo || filterEstado || filterZona;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Total en patio</p>
          <p className="text-xl font-bold text-gray-800">{todosContenedores.length.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Navieras activas</p>
          <p className="text-xl font-bold text-blue-600">{resumenNaviera.filter(n => n.count > 0).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Listos p/ evacuar</p>
          <p className="text-xl font-bold text-yellow-600">
            {todosContenedores.filter(r => r.contenedor.estado === 'listo_evacuar').length.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">En inspeccion</p>
          <p className="text-xl font-bold text-red-600">
            {todosContenedores.filter(r => r.contenedor.estado === 'en_inspeccion').length.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <p className="text-xs text-gray-500">Reefers</p>
          <p className="text-xl font-bold text-cyan-600">
            {todosContenedores.filter(r => r.contenedor.estado === 'reefer').length.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar: resumen por naviera */}
        <div className="w-64 shrink-0 space-y-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Ship size={14} className="text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-700">Contenedores por naviera</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={resumenNaviera} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="naviera" tick={{ fontSize: 8 }} width={75} />
                <Tooltip formatter={(v) => Number(v).toLocaleString()} />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {resumenNaviera.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lista rapida por naviera */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Filtro rapido</h3>
            <div className="space-y-1">
              {resumenNaviera.map(n => (
                <button
                  key={n.naviera}
                  onClick={() => { setFilterNaviera(filterNaviera === n.naviera ? '' : n.naviera as Naviera); setPage(0); }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors cursor-pointer ${
                    filterNaviera === n.naviera ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: n.color }} />
                    <span className="text-gray-700">{n.naviera}</span>
                  </div>
                  <span className="font-semibold text-gray-500">{n.count.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg w-52 focus:outline-none focus:border-blue-400"
                />
              </div>

              <select
                value={filterNaviera}
                onChange={(e) => { setFilterNaviera(e.target.value as Naviera | ''); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
              >
                <option value="">Todas las navieras</option>
                {NAVIERAS.map(n => <option key={n.nombre} value={n.nombre}>{n.nombre}</option>)}
              </select>

              <select
                value={filterTipo}
                onChange={(e) => { setFilterTipo(e.target.value as TipoContenedor | ''); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_CONTENEDOR.map(t => <option key={t.tipo} value={t.tipo}>{t.tipo} - {t.descripcion}</option>)}
              </select>

              <select
                value={filterEstado}
                onChange={(e) => { setFilterEstado(e.target.value as ContenedorStack['estado'] | ''); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
              >
                <option value="">Todos los estados</option>
                <option value="almacenado">Almacenado</option>
                <option value="listo_evacuar">Listo evacuar</option>
                <option value="en_inspeccion">En inspeccion</option>
                <option value="reefer">Reefer</option>
              </select>

              <select
                value={filterZona}
                onChange={(e) => { setFilterZona(e.target.value as 'norte' | 'sur' | ''); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
              >
                <option value="">Todas las zonas</option>
                <option value="norte">Zona Norte</option>
                <option value="sur">Zona Sur</option>
              </select>

              {hasFilters && (
                <button onClick={resetFilters} className="text-[10px] text-blue-500 hover:text-blue-700 underline cursor-pointer">
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Filter size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {filtered.length.toLocaleString()} de {todosContenedores.length.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Resumen filtrado (si hay filtros) */}
          {hasFilters && (
            <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center gap-4 flex-wrap">
              <span className="text-[10px] text-blue-500 font-medium">Resultados filtrados:</span>
              {filteredResumen.map(n => (
                <div key={n.naviera} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded" style={{ backgroundColor: n.color }} />
                  <span className="text-[10px] text-gray-600">{n.naviera}: <strong>{n.count.toLocaleString()}</strong></span>
                </div>
              ))}
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('id')}>
                    <div className="flex items-center gap-1">ID Contenedor <SortIcon field="id" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('naviera')}>
                    <div className="flex items-center gap-1">Naviera <SortIcon field="naviera" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('tipo')}>
                    <div className="flex items-center gap-1">Tipo <SortIcon field="tipo" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('fechaIngreso')}>
                    <div className="flex items-center gap-1">Fecha ingreso <SortIcon field="fechaIngreso" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('diasEnPatio')}>
                    <div className="flex items-center gap-1">Dias <SortIcon field="diasEnPatio" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('isla')}>
                    <div className="flex items-center gap-1">Ubicacion <SortIcon field="isla" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600 cursor-pointer hover:text-blue-600" onClick={() => toggleSort('estado')}>
                    <div className="flex items-center gap-1">Estado <SortIcon field="estado" /></div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Tamano</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const est = estadoLabel[row.contenedor.estado] || estadoLabel.almacenado;
                  const diasColor = row.contenedor.diasEnPatio > 14 ? 'text-red-600 font-semibold' :
                    row.contenedor.diasEnPatio > 7 ? 'text-yellow-600' : 'text-gray-600';
                  return (
                    <tr key={`${row.contenedor.id}-${idx}`} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Package size={11} className="text-gray-400" />
                          <span className="font-mono font-semibold text-gray-800">{row.contenedor.id}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: navieraColor[row.contenedor.naviera] }} />
                          <span className="text-gray-700">{row.contenedor.naviera}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {row.contenedor.tipoContenedor}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-gray-400" />
                          <span className="text-gray-600">{row.contenedor.fechaIngreso}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={diasColor}>{row.contenedor.diasEnPatio}d</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-gray-600">
                          {row.islaId.replace('ISLA-', 'I').replace('SUR-', 'S-')} F{row.fila} C{row.columna} N{row.nivel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`${est.bg} ${est.fg} px-1.5 py-0.5 rounded text-[10px] font-medium`}>
                          {est.text}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-gray-500">{row.contenedor.tamano}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-[10px] text-gray-400">
              Mostrando {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filtered.length)} de {filtered.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-2 py-1 text-[10px] rounded border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
              >
                Primera
              </button>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2 py-1 text-[10px] rounded border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
              >
                Anterior
              </button>
              <span className="text-[10px] text-gray-500 px-2">
                Pag {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
              >
                Siguiente
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded border border-gray-200 bg-white disabled:opacity-30 hover:bg-gray-50 cursor-pointer disabled:cursor-default"
              >
                Ultima
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
