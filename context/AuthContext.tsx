
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { mockUsers } from '../store.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  can: (action: 'MANAGE_USERS' | 'DELETE_PROJECT' | 'APPROVE_TASK' | 'EDIT_OTHERS_TASKS' | 'CREATE_TASK') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('chabra_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (foundUser) {
      // Regra de senha: admin tem senha específica, outros livre para ambiente teste
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
    setUser(null);
    localStorage.removeItem('chabra_user');
  };

  // Helper de permissões baseado na hierarquia automática
  const can = (action: string): boolean => {
    if (!user) return false;
    
    // REGRA DE OURO: Administrador sempre tem permissão total
    if (user.role === 'ADMINISTRADOR') return true;

    const level = RoleHierarchy[user.role];

    switch (action) {
      case 'MANAGE_USERS':
        return false; // Apenas Admin (já tratado acima)
      case 'DELETE_PROJECT':
        return level <= 1; // Administrador e Gerente
      case 'APPROVE_TASK':
        return level <= 1; // Administrador e Gerente
      case 'EDIT_OTHERS_TASKS':
        return level <= 2; // Até Supervisor
      case 'CREATE_TASK':
        return level <= 4; // Todos os níveis autenticados
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
