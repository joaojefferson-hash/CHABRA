
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Logo } from '../components/Logo.tsx';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Globe, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simular verificação de VPN/Internet
    const checkConn = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', checkConn);
    window.addEventListener('offline', checkConn);
    return () => {
      window.removeEventListener('online', checkConn);
      window.removeEventListener('offline', checkConn);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      setError('Você parece estar offline. Verifique sua conexão de internet.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('E-mail ou senha incorretos. Use a senha padrão: chabra2024');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de rede. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <h2 className="mt-8 text-3xl font-black text-gray-900 tracking-tight">
            Portal CHABRA
          </h2>
          <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {isOnline ? 'Servidor Online (Home Office)' : 'Sem Conexão'}
            </span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in zoom-in duration-200">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@chabra.com.br"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 focus:bg-white transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sua Senha</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 focus:bg-white transition-all font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isOnline}
              className="w-full flex items-center justify-center gap-3 py-5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-green-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <ShieldCheck size={14} className="text-gray-400" />
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Acesso Protegido por SSL Corporativo</span>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Dificuldades no acesso? Contate o Suporte TI Chabra.
          </p>
        </div>
      </div>
    </div>
  );
};
