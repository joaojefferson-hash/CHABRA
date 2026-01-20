
import React, { useState } from 'react';
import { mockUsers as initialUsers } from '../store.ts';
import { User, UserRole, RoleHierarchy } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, 
  MoreHorizontal, 
  UserPlus, 
  X, 
  ChevronDown,
  Users as LucideUsers,
  Clock,
  Lock,
  Edit2,
  UserX,
  UserCheck,
  Trash2,
  GitBranch,
  ArrowDownCircle,
  AlertCircle
} from 'lucide-react';

// Subcomponente de Modal para Convite/Edição
const UserModal: React.FC<{ 
  user?: User,
  onClose: () => void, 
  onSave: (userData: Omit<User, 'id' | 'status' | 'permissions'>, password?: string) => void 
}> = ({ user, onClose, onSave }) => {
  const { user: loggedInUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(user?.role || 'ANALISTA');

  const isAdmin = loggedInUser?.role === 'ADMINISTRADOR';
  const isEditingSelf = loggedInUser?.id === user?.id;
  const canEditSensitive = isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    const finalEmail = canEditSensitive ? email : (user?.email || email);
    const finalRole = canEditSensitive ? role : (user?.role || role);

    onSave(
      { 
        name, 
        email: finalEmail, 
        role: finalRole, 
        avatar: user?.avatar || `https://picsum.photos/seed/${finalEmail}/100` 
      },
      password || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {user ? (isEditingSelf ? 'Meu Perfil' : 'Editar Membro') : 'Convidar Membro'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
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
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              E-mail Corporativo
              {!canEditSensitive && user && <Lock size={10} className="text-gray-400" />}
            </label>
            <input 
              required
              type="email"
              disabled={!canEditSensitive && !!user}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all font-medium ${!canEditSensitive && !!user ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-100 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50'}`}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@chabra.com.br"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {user ? 'Redefinir Senha (opcional)' : 'Definir Senha de Acesso'}
            </label>
            <div className="relative">
              <input 
                required={!user}
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-medium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={user ? "Deixe vazio para manter" : "••••••••"}
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              Função do Usuário
              {!canEditSensitive && user && <Lock size={10} className="text-gray-400" />}
            </label>
            <div className="relative">
              <select 
                disabled={!canEditSensitive && !!user}
                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all font-bold appearance-none ${!canEditSensitive && !!user ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-50 border-gray-100 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 cursor-pointer'}`}
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
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-green-200 active:scale-95"
            >
              {user ? 'Salvar Alterações' : 'Criar Acesso e Ativar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('chabra_users_list');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const saveToStorage = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('chabra_users_list', JSON.stringify(newUsers));
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'status' | 'permissions'>, password?: string) => {
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
    if (currentUser?.role !== 'ADMINISTRADOR' && currentUser?.role !== 'GERENTE') return;
    const updated = users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED' as any };
      }
      return u;
    });
    saveToStorage(updated);
    setOpenMenuId(null);
  };

  const deleteUser = (id: string) => {
    if (currentUser?.role !== 'ADMINISTRADOR') return;
    if (id === currentUser.id) return;
    if (confirm("Remover este usuário permanentemente?")) {
      const updated = users.filter(u => u.id !== id);
      saveToStorage(updated);
      setOpenMenuId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<UserRole, { label: string, color: string }> = {
      ADMINISTRADOR: { label: 'Admin', color: 'bg-red-500 text-white' },
      GERENTE: { label: 'Gerente', color: 'bg-blue-600 text-white' },
      SUPERVISOR: { label: 'Supervisor', color: 'bg-orange-500 text-white' },
      TECNICO: { label: 'Técnico', color: 'bg-green-600 text-white' },
      ANALISTA: { label: 'Analista', color: 'bg-gray-600 text-white' },
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${roles[role].color}`}>
        {roles[role].label}
      </span>
    );
  };

  // Organiza os usuários por hierarquia para a visualização em árvore
  const sortedUsers = [...users].sort((a, b) => RoleHierarchy[a.role] - RoleHierarchy[b.role]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <GitBranch className="text-green-600" />
            Hierarquia de Equipe
          </h2>
          <p className="text-sm text-gray-500 mt-1">Estrutura organizacional e níveis de permissão CHABRA.</p>
        </div>
        
        {currentUser?.role === 'ADMINISTRADOR' && (
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            <UserPlus size={18} />
            <span>Novo Membro</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm p-6">
        <div className="mb-6 flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase">Nível 0</span>
           </div>
           <ArrowDownCircle size={14} className="text-gray-300" />
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-blue-600" />
             <span className="text-[10px] font-black text-gray-400 uppercase">Nível 1</span>
           </div>
           <ArrowDownCircle size={14} className="text-gray-300" />
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-orange-500" />
             <span className="text-[10px] font-black text-gray-400 uppercase">Nível 2</span>
           </div>
           <ArrowDownCircle size={14} className="text-gray-300" />
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-gray-600" />
             <span className="text-[10px] font-black text-gray-400 uppercase">Colaboradores</span>
           </div>
        </div>

        <div className="space-y-1 relative">
          {/* Linha vertical mestra */}
          <div className="absolute left-10 top-10 bottom-10 w-px bg-gray-100" />

          {sortedUsers.map((u, index) => {
            const level = RoleHierarchy[u.role];
            const indentSize = level * 40;
            
            return (
              <div 
                key={u.id} 
                className="group relative flex items-center"
                style={{ marginLeft: `${indentSize}px` }}
              >
                {/* Conector Visual (Tree Line) */}
                {level > 0 && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-200" />
                )}
                
                <div className={`
                  flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all
                  ${u.id === currentUser?.id ? 'bg-green-50 border-green-100 shadow-sm ring-1 ring-green-200' : 'bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50'}
                `}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={u.avatar} className={`w-12 h-12 rounded-2xl object-cover shadow-sm ${u.status === 'DISABLED' ? 'grayscale opacity-50' : ''}`} alt={u.name} />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black ${u.status === 'DISABLED' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                          {u.name}
                        </p>
                        {getRoleBadge(u.role)}
                        {u.id === currentUser?.id && (
                          <span className="bg-green-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Você</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {u.status === 'DISABLED' && (
                      <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        <UserX size={12} />
                        <span className="text-[10px] font-black uppercase">Inativo</span>
                      </div>
                    )}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                        className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {openMenuId === u.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                            <button 
                              onClick={() => { setEditingUser(u); setIsModalOpen(true); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                            >
                              <Edit2 size={14} className="text-blue-500" /> {u.id === currentUser?.id ? 'Ver Perfil' : 'Editar'}
                            </button>
                            
                            {u.id !== currentUser?.id && (
                              <>
                                <button 
                                  onClick={() => toggleStatus(u.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                  {u.status === 'DISABLED' ? <UserCheck size={14} className="text-green-500" /> : <UserX size={14} className="text-orange-500" />}
                                  {u.status === 'DISABLED' ? 'Ativar' : 'Inativar'}
                                </button>
                                {currentUser?.role === 'ADMINISTRADOR' && (
                                  <button 
                                    onClick={() => deleteUser(u.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 size={14} /> Excluir permanentemente
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Total de Admins</h4>
                <p className="text-2xl font-black text-red-600">{users.filter(u => u.role === 'ADMINISTRADOR').length}</p>
              </div>
           </div>
           <p className="text-xs text-gray-400 font-medium">Controle total sobre configurações e usuários.</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <LucideUsers size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Membros Ativos</h4>
                <p className="text-2xl font-black text-blue-600">{users.filter(u => u.status === 'ACTIVE').length}</p>
              </div>
           </div>
           <p className="text-xs text-gray-400 font-medium">Colaboradores com acesso imediato ao sistema.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Pendentes/Inativos</h4>
                <p className="text-2xl font-black text-orange-600">{users.filter(u => u.status !== 'ACTIVE').length}</p>
              </div>
           </div>
           <p className="text-xs text-gray-400 font-medium">Contas desativadas ou aguardando aprovação.</p>
        </div>
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
