import { createContext, useContext, useState, type ReactNode } from 'react';
import { ROLE_PANELS, usuariosMock, type Usuario, type PanelId } from '../data/mockData';

interface AuthContextType {
  user: Usuario | null;
  allUsers: Usuario[];
  login: (userId: string) => void;
  logout: () => void;
  hasAccess: (panelId: PanelId) => boolean;
  allowedPanels: PanelId[];
  addUser: (user: Usuario) => void;
  updateUser: (id: string, data: Partial<Usuario>) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [allUsers, setAllUsers] = useState<Usuario[]>(usuariosMock);

  const login = (userId: string) => {
    const found = allUsers.find(u => u.id === userId && u.activo);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  const allowedPanels: PanelId[] = user ? ROLE_PANELS[user.rol] : [];
  const hasAccess = (panelId: PanelId) => allowedPanels.includes(panelId);

  const addUser = (u: Usuario) => setAllUsers(prev => [...prev, u]);
  const updateUser = (id: string, data: Partial<Usuario>) =>
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  const deleteUser = (id: string) =>
    setAllUsers(prev => prev.filter(u => u.id !== id));

  return (
    <AuthContext.Provider value={{ user, allUsers, login, logout, hasAccess, allowedPanels, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
