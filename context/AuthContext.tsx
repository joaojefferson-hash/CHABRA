
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types.ts';
import { mockUsers } from '../store.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('chabra_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulação de delay de rede para experiência de UI
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificação simplificada: Admin com senha específica, outros com qualquer senha
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // CONDIÇÃO DE ACESSO:
    // Se for o admin, a senha deve ser 'chabra2024'
    // Se for outro usuário do mock, aceitamos qualquer senha por enquanto (ambiente interno)
    if (foundUser) {
      if (foundUser.role === 'ADMIN' && pass !== 'chabra2024') {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
