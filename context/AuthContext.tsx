
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { mockUsers } from '../store.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  can: (action: 'MANAGE_USERS' | 'DELETE_PROJECT' | 'APPROVE_TASK' | 'EDIT_OTHERS_TASKS' | 'CREATE_TASK' | 'CREATE_PROJECT') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('chabra_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (email: string, pass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Busca na lista de usuários (incluindo os que possam ter sido criados na sessão)
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      if (foundUser.role === 'ADMINISTRADOR' && pass !== 'chabra2024') {
        return false;
      }
      
      setUser(foundUser);
      localStorage.setItem('chabra_user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    // 1. Limpa o estado local do React
    setUser(null);
    
    // 2. Limpa persistência física
    localStorage.removeItem('chabra_user');
    localStorage.removeItem('chabra_users_list'); // Opcional: limpa lista de usuários se quiser reset total
    sessionStorage.clear();
    
    // 3. Força o redirecionamento bruto para garantir que o Router resete
    window.location.href = '/';
  };

  const can = (action: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMINISTRADOR') return true;

    const level = RoleHierarchy[user.role];

    switch (action) {
      case 'MANAGE_USERS':
        return user.role === 'ADMINISTRADOR';
      case 'DELETE_PROJECT':
        return level <= 1;
      case 'CREATE_PROJECT':
        return level <= 1;
      case 'APPROVE_TASK':
        return level <= 1;
      case 'EDIT_OTHERS_TASKS':
        return level <= 2;
      case 'CREATE_TASK':
        return level <= 4;
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
