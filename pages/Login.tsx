
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Logo } from '../components/Logo.tsx';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } catch (err) {
      setError('Ocorreu um erro técnico ao tentar entrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative">
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" />
          <h2 className="mt-8 text-3xl font-black text-gray-900 tracking-tight">
            Acesso Restrito
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Entre com suas credenciais corporativas CHABRA
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                E-mail Corporativo
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail corporativo"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
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
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400 font-medium">
            Chabra Gestão Interna &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};
