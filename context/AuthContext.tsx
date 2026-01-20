
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { mockUsers } from '../store.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (action: 'MANAGE_USERS' | 'DELETE_PROJECT' | 'APPROVE_TASK' | 'EDIT_OTHERS_TASKS' | 'CREATE_TASK' | 'CREATE_PROJECT' | 'VIEW_PROJECTS') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const saved = localStorage.getItem('chabra_user');
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Erro ao carregar sessão", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const normalizedEmail = email.trim().toLowerCase();
    
    // Busca na lista de usuários (Prioriza localStorage onde estão os novos)
    const localUsersStr = localStorage.getItem('chabra_users_list');
    const allAvailableUsers = localUsersStr ? JSON.parse(localUsersStr) : mockUsers;
    
    const foundUser = allAvailableUsers.find((u: any) => u.email.trim().toLowerCase() === normalizedEmail);
    
    if (foundUser) {
      if (foundUser.status === 'DISABLED') {
        setIsLoading(false);
        throw new Error('Conta suspensa. Entre em contato com o administrador.');
      }

      // Lógica de Senha:
      // 1. Verifica se a senha digitada coincide com a cadastrada no usuário
      // 2. Mantém master passwords apenas para o admin@chabra.com.br original
      const userStoredPassword = foundUser.password;
      const isMasterAdmin = normalizedEmail === 'admin@chabra.com.br';
      const masterPasswords = ['chabra2024', '123456'];

      const isValidPassword = 
        (userStoredPassword && pass === userStoredPassword) || 
        (isMasterAdmin && masterPasswords.includes(pass));

      if (!isValidPassword) {
        setIsLoading(false);
        return false;
      }
      
      // Remove a senha do objeto de usuário da sessão por segurança
      const { password, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword as User);
      localStorage.setItem('chabra_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('chabra_user');
    sessionStorage.clear();
    setUser(null);
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, can }}>
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
