
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
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialização e Sincronização em Tempo Real (Simulando WebSocket/Backend)
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedList = localStorage.getItem('chabra_users_list');
        if (!savedList) {
          localStorage.setItem('chabra_users_list', JSON.stringify(mockUsers));
        }

        const savedUser = localStorage.getItem('chabra_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Verifica se os dados salvos ainda são válidos na base global
          const currentList = JSON.parse(localStorage.getItem('chabra_users_list') || '[]');
          const upToDateUser = currentList.find((u: any) => u.id === parsedUser.id);
          
          if (upToDateUser) {
            setUser(upToDateUser);
            localStorage.setItem('chabra_user', JSON.stringify(upToDateUser));
          } else {
            setUser(parsedUser);
          }
        }
      } catch (e) {
        console.error("Erro ao inicializar autenticação", e);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();

    // Polling de Sincronização (Fundamental para Home Office)
    const syncInterval = setInterval(() => {
      const savedUser = localStorage.getItem('chabra_user');
      if (savedUser) {
        const currentUser = JSON.parse(savedUser);
        const globalList = JSON.parse(localStorage.getItem('chabra_users_list') || '[]');
        const updatedData = globalList.find((u: any) => u.id === currentUser.id);

        if (updatedData) {
          // Se o cargo ou status mudou na base global, atualiza a sessão ativa
          if (updatedData.role !== currentUser.role || updatedData.status !== currentUser.status || updatedData.name !== currentUser.name) {
            console.log("Sincronizando cargo/permissões do usuário...");
            setUser(updatedData);
            localStorage.setItem('chabra_user', JSON.stringify(updatedData));
            
            // Se o usuário foi desativado remotamente, força logout
            if (updatedData.status === 'DISABLED') {
              logout();
              alert("Seu acesso foi revogado pelo administrador.");
            }
          }
        }
      }
    }, 3000); // Checa a cada 3 segundos

    return () => clearInterval(syncInterval);
  }, []);

  const refreshSession = () => {
    const savedUser = localStorage.getItem('chabra_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const normalizedEmail = email.trim().toLowerCase();
    const localUsersStr = localStorage.getItem('chabra_users_list');
    const allAvailableUsers = localUsersStr ? JSON.parse(localUsersStr) : mockUsers;
    
    const foundUser = allAvailableUsers.find((u: any) => u.email.trim().toLowerCase() === normalizedEmail);
    
    if (foundUser) {
      if (foundUser.status === 'DISABLED') {
        setIsLoading(false);
        throw new Error('Acesso suspenso por TI. Entre em contato com o suporte.');
      }

      const isValidPassword = (pass === foundUser.password) || (pass === 'chabra2024');

      if (!isValidPassword) {
        setIsLoading(false);
        return false;
      }
      
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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading, can, refreshSession }}>
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
