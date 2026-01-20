
import React, { useState } from 'react';
import { mockUsers as initialUsers } from '../store.ts';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  X, 
  Check, 
  AlertCircle,
  ChevronDown,
  // Added Clock and fixed Users import
  Users as LucideUsers,
  Clock
} from 'lucide-react';

// Subcomponente de Modal para Convite
const InviteUserModal: React.FC<{ 
  onClose: () => void, 
  onInvite: (user: Omit<User, 'id' | 'status' | 'permissions'>) => void 
}> = ({ onClose, onInvite }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('ANALISTA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onInvite({ name, email, role, avatar: `https://picsum.photos/seed/${email}/100` });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Convidar Membro</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Roberto Alcantara"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input 
              required
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="roberto@chabra.com.br"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Função do Usuário (Obrigatório)</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold appearance-none cursor-pointer"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="GERENTE">Gerente</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="TECNICO">Técnico em Seg. Trabalho</option>
                <option value="ANALISTA">Analista</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[9px] text-gray-400 font-medium italic mt-1">As permissões serão atribuídas automaticamente por hierarquia.</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              Enviar Convite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { can, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvite = (userData: Omit<User, 'id' | 'status' | 'permissions'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      status: 'PENDING',
      permissions: []
    };
    setUsers(prev => [...prev, newUser]);
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<UserRole, { label: string, color: string }> = {
      ADMINISTRADOR: { label: 'Administrador', color: 'bg-red-100 text-red-700 border-red-200' },
      GERENTE: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      SUPERVISOR: { label: 'Supervisor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      TECNICO: { label: 'Técnico em Seg. Trabalho', color: 'bg-green-100 text-green-700 border-green-200' },
      ANALISTA: { label: 'Analista', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${roles[role].color} uppercase tracking-tight`}>
        {roles[role].label}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Equipe Chabra</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie os acessos e permissões dos colaboradores.</p>
        </div>
        
        {can('MANAGE_USERS') ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Convidar Membro</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 bg-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200">
            <Shield size={14} />
            <span>Acesso restrito ao Admin</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: users.length, icon: <LucideUsers size={16} />, color: 'gray' },
          { label: 'Ativos', value: users.filter(u => u.status === 'ACTIVE').length, icon: <Check size={16} />, color: 'green' },
          { label: 'Pendentes', value: users.filter(u => u.status === 'PENDING').length, icon: <Clock size={16} />, color: 'orange' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMINISTRADOR').length, icon: <Shield size={16} />, color: 'red' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cargo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt={user.name} />
                        {user.status === 'ACTIVE' && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-none">{user.name} {user.id === currentUser?.id && <span className="text-[10px] text-green-600 ml-1">(Você)</span>}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`} />
                      {user.status === 'ACTIVE' ? 'ATIVO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <InviteUserModal 
          onClose={() => setIsModalOpen(false)} 
          onInvite={handleInvite} 
        />
      )}
    </div>
  );
};
