import { useState } from 'react';
import { Users, Shield, Settings, Ship, Truck, Plus, Pencil, X, Check, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  ROLES_META, ROLE_PANELS, PANEL_LABELS, NAVIERAS,
  type RolId, type PanelId, type Usuario,
} from '../data/mockData';

const TABS = [
  { id: 'usuarios', label: 'Usuarios', icon: <Users size={16} /> },
  { id: 'roles', label: 'Roles y Permisos', icon: <Shield size={16} /> },
  { id: 'navieras', label: 'Navieras', icon: <Ship size={16} /> },
  { id: 'config', label: 'Configuracion', icon: <Settings size={16} /> },
  { id: 'seguridad', label: 'Seguridad', icon: <Shield size={16} /> },
] as const;

type TabId = typeof TABS[number]['id'];

const allRoles = Object.keys(ROLES_META) as RolId[];
const allPanels = Object.keys(PANEL_LABELS) as PanelId[];

const navierasAdmin = [
  { nombre: 'Cosco', contenedores: 1820, bloques: 'A1, A2, A3, D1', contacto: 'ops@cosco.mx' },
  { nombre: 'Maersk', contenedores: 1650, bloques: 'B1, B2, B3', contacto: 'ops@maersk.mx' },
  { nombre: 'MSC', contenedores: 1480, bloques: 'A4, A5, D2, D3', contacto: 'ops@msc.mx' },
  { nombre: 'CMA-CGM', contenedores: 1120, bloques: 'B4, B5, C5', contacto: 'ops@cma-cgm.mx' },
  { nombre: 'Hapag-Lloyd', contenedores: 980, bloques: 'C1, C2, D4', contacto: 'ops@hapag.mx' },
  { nombre: 'Evergreen', contenedores: 792, bloques: 'C3, C4, D5', contacto: 'ops@evergreen.mx' },
];

const logsSeguridad = [
  { hora: '14:52', usuario: 'Memo Woodward', accion: 'Acceso panel Admin', ip: '192.168.1.10' },
  { hora: '14:48', usuario: 'Gerente Ops.', accion: 'Consulta KPIs', ip: '192.168.1.15' },
  { hora: '14:30', usuario: 'Esmeralda', accion: 'Edicion slot evacuacion', ip: '192.168.1.22' },
  { hora: '14:15', usuario: 'Checador Gate 1', accion: 'Registro entrada', ip: '10.0.0.5' },
  { hora: '13:58', usuario: 'Operador Grua 1', accion: 'Maniobra completada', ip: '10.0.0.12' },
  { hora: '13:42', usuario: 'Administracion', accion: 'Generacion CFDI', ip: '192.168.1.30' },
  { hora: '13:20', usuario: 'Checador Gate 2', accion: 'Registro salida', ip: '10.0.0.6' },
  { hora: '12:55', usuario: 'Memo Woodward', accion: 'Consulta patio 3D', ip: '192.168.1.10' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('usuarios');
  const { allUsers, addUser, updateUser, deleteUser } = useAuth();
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-azul-oscuro text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'usuarios' && (
        <TabUsuarios
          users={allUsers}
          editingUser={editingUser}
          showAddModal={showAddModal}
          onEdit={setEditingUser}
          onShowAdd={setShowAddModal}
          onAdd={addUser}
          onUpdate={updateUser}
          onDelete={deleteUser}
          onCloseEdit={() => setEditingUser(null)}
          onCloseAdd={() => setShowAddModal(false)}
        />
      )}
      {activeTab === 'roles' && <TabRoles />}
      {activeTab === 'navieras' && <TabNavieras />}
      {activeTab === 'config' && <TabConfig />}
      {activeTab === 'seguridad' && <TabSeguridad />}
    </div>
  );
}

// ─── TAB USUARIOS ──────────────────────────────────────
function TabUsuarios({ users, editingUser, showAddModal, onEdit, onShowAdd, onAdd, onUpdate, onDelete, onCloseEdit, onCloseAdd }: {
  users: Usuario[]; editingUser: Usuario | null; showAddModal: boolean;
  onEdit: (u: Usuario) => void; onShowAdd: (v: boolean) => void;
  onAdd: (u: Usuario) => void; onUpdate: (id: string, d: Partial<Usuario>) => void;
  onDelete: (id: string) => void; onCloseEdit: () => void; onCloseAdd: () => void;
}) {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-700">Usuarios del sistema</h3>
            <p className="text-xs text-gray-400 mt-0.5">{users.length} usuarios registrados</p>
          </div>
          <button onClick={() => onShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-azul-medio text-white text-xs font-medium rounded-lg hover:bg-azul-oscuro transition-colors cursor-pointer">
            <Plus size={14} /> Agregar usuario
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 text-gray-500 font-medium text-xs">Usuario</th>
              <th className="text-center py-2.5 text-gray-500 font-medium text-xs">Rol</th>
              <th className="text-left py-2.5 text-gray-500 font-medium text-xs">Paneles</th>
              <th className="text-center py-2.5 text-gray-500 font-medium text-xs">Dispositivo</th>
              <th className="text-center py-2.5 text-gray-500 font-medium text-xs">Estado</th>
              <th className="text-center py-2.5 text-gray-500 font-medium text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const rolMeta = ROLES_META[u.rol];
              const paneles = ROLE_PANELS[u.rol];
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.avatar}
                      </div>
                      <span className="text-gray-800 font-medium text-sm">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${rolMeta.bgColor} ${rolMeta.color}`}>
                      {rolMeta.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {paneles.slice(0, 4).map(p => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">
                          {PANEL_LABELS[p]}
                        </span>
                      ))}
                      {paneles.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px]">
                          +{paneles.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-center text-xs text-gray-500">{u.dispositivo}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <button onClick={() => onEdit(u)} className="text-gray-400 hover:text-azul-medio transition-colors cursor-pointer p-1">
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {editingUser && (
        <UserModal
          user={editingUser}
          title="Editar usuario"
          onSave={(data) => { onUpdate(editingUser.id, data); onCloseEdit(); }}
          onClose={onCloseEdit}
        />
      )}

      {/* Modal agregar */}
      {showAddModal && (
        <UserModal
          title="Agregar usuario"
          onSave={(data) => {
            onAdd({ id: `u${Date.now()}`, avatar: (data.nombre || 'NN').substring(0, 2).toUpperCase(), ...data } as Usuario);
            onCloseAdd();
          }}
          onClose={onCloseAdd}
        />
      )}
    </>
  );
}

// ─── MODAL USUARIO ─────────────────────────────────────
function UserModal({ user, title, onSave, onClose }: {
  user?: Usuario; title: string;
  onSave: (data: Partial<Usuario>) => void; onClose: () => void;
}) {
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [rol, setRol] = useState<RolId>(user?.rol || 'operador');
  const [dispositivo, setDispositivo] = useState(user?.dispositivo || 'Web');
  const [activo, setActivo] = useState(user?.activo ?? true);

  const paneles = ROLE_PANELS[rol];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[480px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-azul-claro focus:border-azul-claro outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as RolId)}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-azul-claro outline-none">
              {allRoles.map(r => (
                <option key={r} value={r}>{ROLES_META[r].label} (Nivel {ROLES_META[r].nivel})</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">{ROLES_META[rol].descripcion}</p>
          </div>

          {/* Preview de paneles que tendra */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Paneles con acceso</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {paneles.map(p => (
                <span key={p} className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-medium">
                  {PANEL_LABELS[p]}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Dispositivo</label>
            <select value={dispositivo} onChange={e => setDispositivo(e.target.value as Usuario['dispositivo'])}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
              <option value="Web">Web</option>
              <option value="Tablet">Tablet</option>
              <option value="Web + movil">Web + movil</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-500 uppercase">Activo</label>
            <button onClick={() => setActivo(!activo)}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${activo ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${activo ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancelar</button>
          <button onClick={() => onSave({ nombre, rol, dispositivo, activo })}
            className="px-4 py-2 bg-azul-medio text-white text-sm font-medium rounded-lg hover:bg-azul-oscuro cursor-pointer flex items-center gap-1.5">
            <Check size={14} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB ROLES Y PERMISOS ──────────────────────────────
function TabRoles() {
  return (
    <div className="space-y-4">
      {/* Jerarquia visual */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Jerarquia de roles</h3>
        <div className="space-y-2">
          {allRoles.map((rol, i) => {
            const meta = ROLES_META[rol];
            const paneles = ROLE_PANELS[rol];
            return (
              <div key={rol} className="flex items-center gap-3">
                <div className="w-16 text-right">
                  <span className="text-xs font-mono font-bold text-gray-400">N{meta.nivel}</span>
                </div>
                <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${meta.bgColor} ${meta.color} w-28 text-center`}>
                  {meta.label}
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-gray-400 mr-1">{paneles.length} paneles:</span>
                  {paneles.map(p => (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px]">
                      {PANEL_LABELS[p]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matriz rol vs panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Matriz de permisos</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium w-28">Rol</th>
              {allPanels.map(p => (
                <th key={p} className="text-center py-2 text-gray-500 font-medium px-1 min-w-[50px]">
                  <span className="writing-mode-vertical text-[10px]">{PANEL_LABELS[p]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRoles.map(rol => {
              const meta = ROLES_META[rol];
              const paneles = ROLE_PANELS[rol];
              return (
                <tr key={rol} className="border-b border-gray-50">
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${meta.bgColor} ${meta.color}`}>
                      {meta.label}
                    </span>
                  </td>
                  {allPanels.map(p => (
                    <td key={p} className="text-center py-2.5">
                      {paneles.includes(p) ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                          <Check size={12} className="text-green-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                          <X size={10} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TAB NAVIERAS ──────────────────────────────────────
function TabNavieras() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ship size={16} className="text-azul-medio" />
        <h3 className="text-sm font-bold text-gray-700">Navieras configuradas</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2.5 text-gray-500 font-medium text-xs">Naviera</th>
            <th className="text-center py-2.5 text-gray-500 font-medium text-xs">Contenedores</th>
            <th className="text-left py-2.5 text-gray-500 font-medium text-xs">Bloques asignados</th>
            <th className="text-left py-2.5 text-gray-500 font-medium text-xs">Contacto</th>
          </tr>
        </thead>
        <tbody>
          {navierasAdmin.map(n => (
            <tr key={n.nombre} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="py-2.5 font-medium text-gray-700">{n.nombre}</td>
              <td className="py-2.5 text-center text-gray-600">{n.contenedores.toLocaleString()}</td>
              <td className="py-2.5 text-gray-500">{n.bloques}</td>
              <td className="py-2.5 text-gray-400">{n.contacto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TAB CONFIGURACION ─────────────────────────────────
function TabConfig() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-azul-medio" />
          <h3 className="text-sm font-bold text-gray-700">Parametros operativos</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['Overbooking slots', '15%'],
            ['Objetivo evacuacion', '>95%'],
            ['Max nivel estiva', '5'],
            ['Pago transportista', 'D+1 (SPEI)'],
            ['CFDI version', '4.0 + CP 3.1'],
            ['Horario operacion', '06:00 - 22:00'],
            ['Slots por hora', '12'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800">{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Truck size={16} className="text-azul-medio" />
          <h3 className="text-sm font-bold text-gray-700">Transportistas</h3>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ['Registrados', '148'],
            ['Activos este mes', '92'],
            ['Con app instalada', '67'],
            ['Canal WhatsApp', '405 seguidores'],
            ['Promedio vueltas/dia', '4.2'],
            ['Tiempo prom. vuelta', '45 min'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB SEGURIDAD ─────────────────────────────────────
function TabSeguridad() {
  return (
    <div className="space-y-4">
      {/* KPIs seguridad */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sesiones activas', valor: '4', color: 'text-azul-medio' },
          { label: '2FA activado', valor: '100%', color: 'text-verde' },
          { label: 'Intentos fallidos', valor: '0', color: 'text-verde' },
          { label: 'Logs auditoria hoy', valor: '1,247', color: 'text-gray-800' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Log de accesos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Log de accesos recientes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium text-xs">Hora</th>
              <th className="text-left py-2 text-gray-500 font-medium text-xs">Usuario</th>
              <th className="text-left py-2 text-gray-500 font-medium text-xs">Accion</th>
              <th className="text-left py-2 text-gray-500 font-medium text-xs">IP</th>
            </tr>
          </thead>
          <tbody>
            {logsSeguridad.map((log, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2 text-gray-400 font-mono text-xs">{log.hora}</td>
                <td className="py-2 text-gray-700">{log.usuario}</td>
                <td className="py-2 text-gray-500">{log.accion}</td>
                <td className="py-2 text-gray-400 font-mono text-xs">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
