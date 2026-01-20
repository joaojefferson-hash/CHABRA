
import React, { useState, useMemo } from 'react';
import { mockUsers as initialUsers } from '../store.ts';
import { User, UserRole } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, UserPlus, X, Users as LucideUsers, Edit2, UserX, UserCheck, Trash2, 
  AlertCircle, Mail, MoreVertical, Search, Filter, Check, UserCircle, Lock
} from 'lucide-react';

const UserModal: React.FC<{ 
  user?: User, 
  onClose: () => void, 
  onSave: (userData: Omit<User, 'id' | 'status' | 'permissions'>) => void 
}> = ({ user, onClose, onSave }) => {
  const { can } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'ANALISTA');

  const isAdmin = can('MANAGE_USERS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onSave({ 
      name, 
      email, 
      role, 
      avatar: user?.avatar || `https://picsum.photos/seed/${email}/100` 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-xl">
              <UserPlus size={20} />
            </div>
            <h3 className="text-xl font-black text-gray-900">{user ? 'Editar Membro' : 'Novo Membro'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {!isAdmin && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-start gap-2 mb-2">
              <Lock size={14} className="text-amber-600 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 leading-tight uppercase">
                Apenas Administradores podem alterar cargos e status do sistema.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              required 
              autoFocus
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all" 
              placeholder="Ex: João Silva"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
            <input 
              required 
              type="email" 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all" 
              placeholder="exemplo@chabra.com.br"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo no Sistema</label>
              {!isAdmin && <Shield size={12} className="text-gray-300" />}
            </div>
            <div className="relative">
              <select 
                disabled={!isAdmin}
                className={`w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black outline-none transition-all appearance-none
                  ${!isAdmin ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : 'focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 cursor-pointer'}
                `} 
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="ADMINISTRADOR">Administrador (Total)</option>
                <option value="GERENTE">Gerente (Gestão)</option>
                <option value="SUPERVISOR">Supervisor (Equipe)</option>
                <option value="TECNICO">Técnico em Seg. Trabalho</option>
                <option value="ANALISTA">Analista (Operacional)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-green-200 mt-4 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {user ? <Check size={20} /> : <UserPlus size={20} />}
            {user ? 'Atualizar Membro' : 'Cadastrar Membro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { user: currentUser, can } = useAuth();
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('chabra_users_list');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');

  const saveToStorage = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('chabra_users_list', JSON.stringify(newUsers));
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           u.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const handleSaveUser = (userData: Omit<User, 'id' | 'status' | 'permissions'>) => {
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u);
      saveToStorage(updated);
      setEditingUser(null);
    } else {
      const newUser: User = { 
        ...userData, 
        id: `u-${Date.now()}`, 
        status: 'ACTIVE', 
        permissions: [] 
      };
      saveToStorage([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    if (!can('MANAGE_USERS')) {
      alert("Ação negada: Você não tem permissão para alterar o status de membros.");
      return;
    }
    if (id === currentUser?.id) {
      alert("Você não pode desativar seu próprio acesso.");
      return;
    }
    const updated = users.map(u => u.id === id ? { 
      ...u, 
      status: (u.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED') as any 
    } : u);
    saveToStorage(updated);
    setOpenMenuId(null);
  };

  const deleteUser = (id: string) => {
    if (!can('MANAGE_USERS')) {
      alert("Ação negada: Apenas administradores podem remover membros.");
      return;
    }
    if (id === currentUser?.id) {
      alert("Ação negada: Você não pode excluir sua própria conta.");
      return;
    }
    if (confirm("ATENÇÃO: Deseja realmente remover permanentemente este membro? Esta ação não pode ser desfeita.")) {
      saveToStorage(users.filter(u => u.id !== id));
      setOpenMenuId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<UserRole, { bg: string, label: string }> = {
      ADMINISTRADOR: { bg: 'bg-red-500', label: 'Admin' },
      GERENTE: { bg: 'bg-blue-600', label: 'Gerente' },
      SUPERVISOR: { bg: 'bg-orange-500', label: 'Supervisor' },
      TECNICO: { bg: 'bg-green-600', label: 'Técnico' },
      ANALISTA: { bg: 'bg-gray-600', label: 'Analista' },
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase text-white shadow-sm ${roles[role].bg}`}>
        {roles[role].label}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Gestão de Membros <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{users.length}</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Controle de acesso, cargos e permissões da equipe CHABRA.</p>
        </div>
        
        {can('MANAGE_USERS') && (
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }} 
            className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-green-200 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Novo Colaborador
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, e-mail ou cargo..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'DISABLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                statusFilter === status 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
              }`}
            >
              {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div key={u.id} className={`bg-white p-6 rounded-[2rem] border transition-all group relative ${u.status === 'DISABLED' ? 'opacity-75 grayscale-[0.5]' : 'hover:shadow-2xl hover:shadow-green-500/5 hover:border-green-100'}`}>
            <div className="flex items-start justify-between mb-5">
              <div className="relative">
                <img 
                  src={u.avatar} 
                  className={`w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-lg ${u.status === 'DISABLED' ? 'grayscale opacity-60' : ''}`} 
                  alt={u.name} 
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} 
                  className={`p-2 rounded-xl transition-colors ${openMenuId === u.id ? 'bg-gray-100 text-gray-900' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}
                >
                  <MoreVertical size={20} />
                </button>
                
                {openMenuId === u.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-3 animate-in fade-in slide-in-from-top-2">
                      <button 
                        onClick={() => { setEditingUser(u); setIsModalOpen(true); setOpenMenuId(null); }} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-gray-600 hover:bg-gray-50"
                      >
                        <Edit2 size={16} className="text-blue-500" /> Editar Detalhes
                      </button>
                      
                      {can('MANAGE_USERS') && (
                        <>
                          <button 
                            onClick={() => toggleStatus(u.id)} 
                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black hover:bg-gray-50 ${u.status === 'DISABLED' ? 'text-green-600' : 'text-orange-600'}`}
                          >
                            {u.status === 'DISABLED' ? <UserCheck size={16} /> : <UserX size={16} />}
                            {u.status === 'DISABLED' ? 'Ativar Acesso' : 'Suspender Acesso'}
                          </button>
                          {u.id !== currentUser?.id && (
                            <button 
                              onClick={() => deleteUser(u.id)} 
                              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} /> Remover Membro
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 text-base truncate">{u.name}</h3>
                {u.id === currentUser?.id && (
                  <span className="bg-green-100 text-green-700 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">VOCÊ</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} />
                <span className="text-xs truncate font-bold">{u.email}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-5 border-t border-gray-50">
              <div className="flex items-center gap-2">
                {getRoleBadge(u.role)}
                {u.status === 'DISABLED' && (
                  <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase">Suspenso</span>
                )}
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">ID: {u.id.slice(-4)}</span>
            </div>
          </div>
        ))}
      </div>

      {(isModalOpen || editingUser) && (
        <UserModal 
          user={editingUser || undefined} 
          onClose={() => { setIsModalOpen(false); setEditingUser(null); }} 
          onSave={handleSaveUser} 
        />
      )}
    </div>
  );
};
