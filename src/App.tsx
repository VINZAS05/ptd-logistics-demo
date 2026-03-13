import { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar, { type PanelId } from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import { useAuth } from './context/AuthContext';
import { ROLES_META } from './data/mockData';

const HomePanel = lazy(() => import('./panels/HomePanel'));
const PatioPanel = lazy(() => import('./panels/PatioPanel'));
const GatePanel = lazy(() => import('./panels/GatePanel'));
const EvacuacionesPanel = lazy(() => import('./panels/EvacuacionesPanel'));
const TraficoPanel = lazy(() => import('./panels/TraficoPanel'));
const PagosPanel = lazy(() => import('./panels/PagosPanel'));
const KpisPanel = lazy(() => import('./panels/KpisPanel'));
const OptimizadorPanel = lazy(() => import('./panels/OptimizadorPanel'));
const MaquinariaPanel = lazy(() => import('./panels/MaquinariaPanel'));
const ContenedoresPanel = lazy(() => import('./panels/ContenedoresPanel'));
const EvacuadosPanel = lazy(() => import('./panels/EvacuadosPanel'));
const EnPatioPanel = lazy(() => import('./panels/EnPatioPanel'));
const IngresadosPanel = lazy(() => import('./panels/IngresadosPanel'));
const AdminPanel = lazy(() => import('./panels/AdminPanel'));
const TransportistasPanel = lazy(() => import('./panels/TransportistasPanel'));
const InspeccionesPanel = lazy(() => import('./panels/InspeccionesPanel'));
const PortalAgentesPanel = lazy(() => import('./panels/PortalAgentesPanel'));
const ConteconPanel = lazy(() => import('./panels/ConteconPanel'));
const PTDTrucksPanel = lazy(() => import('./panels/PTDTrucksPanel'));

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
  transportistas: 'Gestion de Transportistas',
  inspecciones: 'Inspecciones de Contenedores',
  portal_agentes: 'Portal de Agentes Aduanales',
  contecon: 'Vista ConTeCon',
  ptd_trucks: 'PTD Trucks',
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
  transportistas: <TransportistasPanel />,
  inspecciones: <InspeccionesPanel />,
  portal_agentes: <PortalAgentesPanel />,
  contecon: <ConteconPanel />,
  ptd_trucks: <PTDTrucksPanel />,
};

const ACCESS_KEY = 'ptd-woodward-2026';
const DEMO_DEADLINE = new Date('2026-03-14T23:59:00-07:00'); // Sab 14 mar 23:59 PDT California

function isDemoExpired(): boolean {
  return new Date() >= DEMO_DEADLINE;
}
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby75BwUA0euK8ZTNNJ-Zjdr4Wa1r_FUapwFHvk0bLkvNZVn3gP29n2AgNnKJCkzx9bi/exec';

let _geoCache: { ip: string; ubicacion: string } | null = null;

async function getGeoInfo(): Promise<{ ip: string; ubicacion: string }> {
  if (_geoCache) return _geoCache;
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    _geoCache = {
      ip: data.ip || '',
      ubicacion: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`,
    };
  } catch {
    _geoCache = { ip: '', ubicacion: '' };
  }
  return _geoCache;
}

function trackEvent(evento: string, usuario?: string, rol?: string, clave?: string) {
  try {
    const now = new Date();
    const nav = navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
    const browser = navigator.userAgent.includes('Chrome') ? 'Chrome' :
      navigator.userAgent.includes('Firefox') ? 'Firefox' :
      navigator.userAgent.includes('Safari') ? 'Safari' : 'Otro';

    getGeoInfo().then(geo => {
      const payload = JSON.stringify({
        fecha: now.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        evento,
        usuario: usuario || '',
        rol: rol || '',
        clave: clave || '',
        ip: geo.ip,
        ubicacion: geo.ubicacion,
        navegador: `${browser} (${nav})`,
      });
      fetch(WEBHOOK_URL, {
        method: 'POST',
        body: payload,
        redirect: 'follow',
      }).catch(() => {
        // Fallback: enviar via GET con query params (imagen beacon)
        const img = new Image();
        img.src = `${WEBHOOK_URL}?data=${encodeURIComponent(payload)}`;
      });
    });
  } catch { /* silenciar errores de tracking */ }
}

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [expired, setExpired] = useState(false);
  const [visited, setVisited] = useState(false);

  // Trackear visita a la pagina (una sola vez)
  useEffect(() => {
    if (!visited) {
      setVisited(true);
      if (isDemoExpired()) {
        trackEvent('Visita - demo expirada');
      } else {
        trackEvent('Visita - demo activa');
      }
    }
  }, [visited]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key !== ACCESS_KEY) {
      trackEvent('Intento fallido', '', '', key);
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    if (isDemoExpired()) {
      trackEvent('Demo expirada - clave correcta', '', '', 'correcta');
      setExpired(true);
      return;
    }
    sessionStorage.setItem('ptd_access', '1');
    trackEvent('Acceso con clave', '', '', 'correcta');
    onUnlock();
  };

  return (
    <div className="min-h-screen bg-[#0F1E3D] flex flex-col items-center justify-center p-8 relative">
      {/* Vinzas AI - esquina superior izquierda */}
      <div className="absolute top-6 left-8 flex items-center gap-4">
        <img src="/logo-vinzas.svg" alt="Vinzas AI" className="w-24 h-24" />
        <div>
          <p className="text-3xl font-bold bg-gradient-to-r from-[#00C6FF] to-[#9D00FF] bg-clip-text text-transparent">VINZAS AI</p>
          <p className="text-white/50 text-sm font-bold tracking-wider">IA aplicada al negocio real</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <img src="/woodward-logo-white.svg" alt="Logistica Woodward" className="w-12 h-12" />
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">PTD LOGISTICS</h1>
          <p className="text-white/40 text-xs">Acceso restringido</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="Clave de acceso"
          className={`w-full px-4 py-3 rounded-lg bg-white/[0.08] border ${error ? 'border-red-500' : expired ? 'border-amber-500' : 'border-white/20'} text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400 transition-colors`}
          autoFocus
        />
        {error && <p className="text-red-400 text-xs mt-2">Clave incorrecta</p>}
        {expired && <p className="text-amber-400 text-xs mt-2">Esta demo ha finalizado. Contacta al equipo Vinzas AI.</p>}
        <button type="submit" className="w-full mt-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          Acceder
        </button>
      </form>
    </div>
  );
}

function App() {
  const { user, hasAccess, allowedPanels } = useAuth();
  const [activePanel, setActivePanel] = useState<PanelId>('home');
  const [unlocked, setUnlocked] = useState(() => {
    if (isDemoExpired()) {
      sessionStorage.removeItem('ptd_access');
      return false;
    }
    return sessionStorage.getItem('ptd_access') === '1';
  });

  // Tracking de login de perfil
  useEffect(() => {
    if (user) {
      const rolMeta = ROLES_META[user.rol];
      trackEvent('Login perfil', user.nombre, rolMeta?.label || user.rol);
    }
  }, [user]);

  // Si el panel activo no es accesible, ir al primero permitido
  useEffect(() => {
    if (user && !hasAccess(activePanel) && allowedPanels.length > 0) {
      setActivePanel(allowedPanels[0]);
    }
  }, [user, activePanel, allowedPanels, hasAccess]);

  // Gate de acceso
  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;

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
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
            {panels[activePanel]}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
