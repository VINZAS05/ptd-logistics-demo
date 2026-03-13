import { useState } from 'react';
import {
  LayoutDashboard, Map, DoorOpen, Truck, Route,
  CreditCard, BarChart3, Settings, Brain, Wrench, List,
  ArrowDownToLine, PackageCheck, ArrowUpFromLine, ChevronDown, LogOut,
  Users, ClipboardCheck, Building2, Ship, Navigation,
} from 'lucide-react';
import { type PanelId, ROLES_META } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export type { PanelId };

type MenuItem = { id: PanelId; label: string; icon: React.ReactNode; children?: MenuItem[] };

const allMenuItems: MenuItem[] = [
  { id: 'home', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { id: 'patio', label: 'Patio', icon: <Map size={20} /> },
  {
    id: 'contenedores', label: 'Contenedores', icon: <List size={20} />,
    children: [
      { id: 'contenedores', label: 'Inventario', icon: <List size={16} /> },
      { id: 'evacuados', label: 'Evacuados', icon: <ArrowUpFromLine size={16} /> },
      { id: 'en_patio', label: 'En Patio', icon: <PackageCheck size={16} /> },
      { id: 'ingresados', label: 'Ingresados', icon: <ArrowDownToLine size={16} /> },
    ],
  },
  { id: 'optimizador', label: 'Optimizador', icon: <Brain size={20} /> },
  { id: 'gate', label: 'Gate', icon: <DoorOpen size={20} /> },
  { id: 'evacuaciones', label: 'Evacuaciones', icon: <Truck size={20} /> },
  { id: 'transportistas', label: 'Transportistas', icon: <Users size={20} /> },
  { id: 'maquinaria', label: 'Maquinaria', icon: <Wrench size={20} /> },
  { id: 'trafico', label: 'Trafico', icon: <Route size={20} /> },
  { id: 'inspecciones', label: 'Inspecciones', icon: <ClipboardCheck size={20} /> },
  { id: 'portal_agentes', label: 'Portal Agentes', icon: <Building2 size={20} /> },
  { id: 'pagos', label: 'Pagos', icon: <CreditCard size={20} /> },
  { id: 'kpis', label: 'KPIs', icon: <BarChart3 size={20} /> },
  { id: 'ptd_trucks', label: 'PTD Trucks', icon: <Navigation size={20} /> },
  { id: 'contecon', label: 'ConTeCon', icon: <Ship size={20} /> },
  { id: 'admin', label: 'Admin', icon: <Settings size={20} /> },
];

const contenedoresIds: PanelId[] = ['contenedores', 'evacuados', 'en_patio', 'ingresados'];

interface SidebarProps {
  activePanel: PanelId;
  onPanelChange: (panel: PanelId) => void;
}

export default function Sidebar({ activePanel, onPanelChange }: SidebarProps) {
  const { user, logout, allowedPanels } = useAuth();
  const [contOpen, setContOpen] = useState(contenedoresIds.includes(activePanel));

  // Filtrar menu items segun permisos del usuario
  const menuItems = allMenuItems
    .map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(c => allowedPanels.includes(c.id));
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return allowedPanels.includes(item.id) ? item : null;
    })
    .filter(Boolean) as MenuItem[];

  const rolMeta = user ? ROLES_META[user.rol] : null;

  return (
    <aside className="w-56 bg-sidebar min-h-screen flex flex-col">
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/woodward-logo-white.svg" alt="Logistica Woodward" className="w-9 h-9" />
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">PTD LOGISTICS</h1>
            <p className="text-white/40 text-[10px]">Centro de Control</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3">
        {menuItems.map((item) => {
          if (item.children) {
            const isChildActive = item.children.some(c => c.id === activePanel);
            return (
              <div key={`group-${item.id}`}>
                <button
                  onClick={() => setContOpen(!contOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    isChildActive
                      ? 'bg-azul-medio/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${contOpen ? 'rotate-180' : ''} ${isChildActive ? 'text-azul-claro' : 'text-white/40'}`} />
                </button>
                {contOpen && (
                  <div className="bg-white/[0.03]">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onPanelChange(child.id)}
                        className={`w-full flex items-center gap-2.5 pl-10 pr-4 py-2 text-[13px] transition-colors cursor-pointer ${
                          activePanel === child.id
                            ? 'bg-azul-medio/30 text-white border-r-2 border-azul-claro'
                            : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                        }`}
                      >
                        {child.icon}
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                activePanel === item.id
                  ? 'bg-azul-medio/30 text-white border-r-2 border-azul-claro'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Usuario actual */}
      {user && rolMeta && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.nombre}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${rolMeta.bgColor} ${rolMeta.color}`}>
                {rolMeta.label}
              </span>
            </div>
            <button onClick={logout} className="text-white/30 hover:text-white/70 transition-colors cursor-pointer" title="Cerrar sesion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Footer - Vinzas AI branding */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo-vinzas.svg" alt="Vinzas AI" className="w-8 h-8" />
          <p className="text-sm font-bold bg-gradient-to-r from-[#00C6FF] to-[#9D00FF] bg-clip-text text-transparent">VINZAS AI</p>
        </div>
      </div>
    </aside>
  );
}
