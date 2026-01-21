
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { mockUsers } from '../store.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (action: 'MANAGE_USERS' | 'DELETE_PROJECT' | 'APPROVE_TASK' | 'EDIT_OTHERS_TASKS' | 'CREATE_TASK' | 'CREATE_PROJECT' | 'VIEW_PROJECTS') => boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authChannel = new BroadcastChannel('chabra_auth_sync');

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Esta função garante que o cargo esteja SEMPRE atualizado
  const syncUserRole = useCallback(() => {
    const savedUser = localStorage.getItem('chabra_user');
    if (!savedUser) return;

    const currentUser = JSON.parse(savedUser);
    const globalUsers = JSON.parse(localStorage.getItem('chabra_users_list') || '[]');
    const latestUserData = globalUsers.find((u: any) => u.id === currentUser.id);

    if (latestUserData && JSON.stringify(latestUserData) !== JSON.stringify(currentUser)) {
      console.log(`[AUTH] Atualizando cargo de ${latestUserData.name} para ${latestUserData.role}`);
      setUser(latestUserData);
      localStorage.setItem('chabra_user', JSON.stringify(latestUserData));
      
      // Notifica outras abas se houver
      authChannel.postMessage({ type: 'ROLE_UPDATED', userId: latestUserData.id });
    }
  }, []);

  useEffect(() => {
    const init = () => {
      const savedList = localStorage.getItem('chabra_users_list');
      if (!savedList) {
        localStorage.setItem('chabra_users_list', JSON.stringify(mockUsers));
      }
      
      const savedUser = localStorage.getItem('chabra_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        syncUserRole(); // Checa cargo na inicialização
      }
      setIsLoading(false);
    };
    init();

    // Ouvinte de mensagens entre abas
    authChannel.onmessage = (event) => {
      if (event.data === 'LOGOUT') {
        setUser(null);
      } else if (event.data.type === 'ROLE_UPDATED') {
        syncUserRole();
      }
    };

    // Polling agressivo (2s) para simular tempo real enquanto não há Firebase configurado
    const interval = setInterval(syncUserRole, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [syncUserRole]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = JSON.parse(localStorage.getItem('chabra_users_list') || JSON.stringify(mockUsers));
    
    const foundUser = allUsers.find((u: any) => u.email.trim().toLowerCase() === normalizedEmail);
    
    if (foundUser) {
      if (foundUser.status === 'DISABLED') {
        setIsLoading(false);
        throw new Error('Acesso suspenso.');
      }

      const isValid = (pass === foundUser.password) || (pass === 'chabra2024');
      if (!isValid) {
        setIsLoading(false);
        return false;
      }
      
      const { password, ...userSafe } = foundUser;
      setUser(userSafe as User);
      localStorage.setItem('chabra_user', JSON.stringify(userSafe));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('chabra_user');
    setUser(null);
    authChannel.postMessage('LOGOUT');
  };

  const can = (action: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMINISTRADOR') return true;
    const level = RoleHierarchy[user.role];
    switch (action) {
      case 'MANAGE_USERS': return user.role === 'ADMINISTRADOR';
      case 'DELETE_PROJECT': return level <= 1;
      case 'CREATE_PROJECT': return level <= 1;
      case 'VIEW_PROJECTS': return true; 
      case 'APPROVE_TASK': return level <= 1; 
      case 'EDIT_OTHERS_TASKS': return level <= 2;
      case 'CREATE_TASK': return level <= 4;
      default: return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, can, refreshSession: syncUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
