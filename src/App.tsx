import { useState, useEffect } from 'react';
import Sidebar, { type PanelId } from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import { useAuth } from './context/AuthContext';
import { ROLES_META } from './data/mockData';
import HomePanel from './panels/HomePanel';
import PatioPanel from './panels/PatioPanel';
import GatePanel from './panels/GatePanel';
import EvacuacionesPanel from './panels/EvacuacionesPanel';
import TraficoPanel from './panels/TraficoPanel';
import PagosPanel from './panels/PagosPanel';
import KpisPanel from './panels/KpisPanel';
import OptimizadorPanel from './panels/OptimizadorPanel';
import MaquinariaPanel from './panels/MaquinariaPanel';
import ContenedoresPanel from './panels/ContenedoresPanel';
import EvacuadosPanel from './panels/EvacuadosPanel';
import EnPatioPanel from './panels/EnPatioPanel';
import IngresadosPanel from './panels/IngresadosPanel';
import AdminPanel from './panels/AdminPanel';

const panelTitles: Record<PanelId, string> = {
  home: 'Centro de Control',
  patio: 'Yard Management',
  contenedores: 'Inventario de Contenedores',
  evacuados: 'Contenedores Evacuados',
  en_patio: 'Contenedores en Patio',
  ingresados: 'Contenedores Ingresados',
  optimizador: 'Optimizador de Operaciones',
  gate: 'Gate Control',
  evacuaciones: 'Gestion de Evacuaciones',
  maquinaria: 'Control de Maquinaria',
  trafico: 'Control de Trafico',
  pagos: 'Facturacion y Pagos',
  kpis: 'KPIs y Reportes',
  admin: 'Administracion',
};

const panels: Record<PanelId, React.ReactNode> = {
  home: <HomePanel />,
  patio: <PatioPanel />,
  contenedores: <ContenedoresPanel />,
  evacuados: <EvacuadosPanel />,
  en_patio: <EnPatioPanel />,
  ingresados: <IngresadosPanel />,
  optimizador: <OptimizadorPanel />,
  gate: <GatePanel />,
  evacuaciones: <EvacuacionesPanel />,
  maquinaria: <MaquinariaPanel />,
  trafico: <TraficoPanel />,
  pagos: <PagosPanel />,
  kpis: <KpisPanel />,
  admin: <AdminPanel />,
};

function App() {
  const { user, hasAccess, allowedPanels } = useAuth();
  const [activePanel, setActivePanel] = useState<PanelId>('home');

  // Si el panel activo no es accesible, ir al primero permitido
  useEffect(() => {
    if (user && !hasAccess(activePanel) && allowedPanels.length > 0) {
      setActivePanel(allowedPanels[0]);
    }
  }, [user, activePanel, allowedPanels, hasAccess]);

  // Sin usuario -> login
  if (!user) return <LoginScreen />;

  const now = new Date();
  const fecha = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const rolMeta = ROLES_META[user.rol];

  return (
    <div className="flex min-h-screen bg-fondo">
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{panelTitles[activePanel]}</h2>
            <p className="text-xs text-gray-400">{fecha}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-verde animate-pulse" />
              <span className="text-xs text-gray-500">En linea</span>
            </div>
            <span className="text-sm font-medium text-gray-600">{hora}</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.avatar}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-700 leading-tight">{user.nombre}</p>
                <span className={`text-[10px] font-medium ${rolMeta.color}`}>{rolMeta.label}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          {panels[activePanel]}
        </div>
      </main>
    </div>
  );
}

export default App;
