import { useAuth } from '../context/AuthContext';
import { ROLES_META } from '../data/mockData';

export default function LoginScreen() {
  const { allUsers, login } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F1E3D] flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <img src="/woodward-logo-white.svg" alt="Logistica Woodward" className="w-12 h-12" />
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">PTD LOGISTICS</h1>
          <p className="text-white/40 text-xs">Centro de Control</p>
        </div>
      </div>
      <p className="text-white/50 text-sm mb-10">Selecciona tu perfil para acceder</p>

      {/* Grid de usuarios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl w-full">
        {allUsers.filter(u => u.activo).map(u => {
          const rolMeta = ROLES_META[u.rol];
          return (
            <button key={u.id} onClick={() => login(u.id)}
              className="bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-xl p-5 text-center transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-white text-lg font-bold">{u.avatar}</span>
              </div>
              <p className="text-white font-medium text-sm">{u.nombre}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${rolMeta.bgColor} ${rolMeta.color}`}>
                {rolMeta.label}
              </span>
              <p className="text-white/30 text-[10px] mt-1">{u.dispositivo}</p>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-16 flex items-center gap-3">
        <img src="/logo-vinzas.svg" alt="Vinzas AI" className="w-6 h-6" />
        <p className="text-xs font-bold bg-gradient-to-r from-[#00C6FF] to-[#9D00FF] bg-clip-text text-transparent">VINZAS AI</p>
      </div>
    </div>
  );
}
