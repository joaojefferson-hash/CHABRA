
import React, { useState } from 'react';
import { mockUsers as initialUsers } from '../store.ts';
import { User, UserRole } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Shield, UserPlus, X, Users as LucideUsers, Edit2, UserX, UserCheck, Trash2, AlertCircle, Mail, MoreVertical
} from 'lucide-react';

const UserModal: React.FC<{ 
  user?: User, onClose: () => void, onSave: (userData: Omit<User, 'id' | 'status' | 'permissions'>) => void 
}> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'ANALISTA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onSave({ name, email, role, avatar: user?.avatar || `https://picsum.photos/seed/${email}/100` });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">{user ? 'Editar Membro' : 'Convidar Membro'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome Completo</label>
            <input required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail Corporativo</label>
            <input required type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo / Função</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none" value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="GERENTE">Gerente</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="TECNICO">Técnico em Seg. Trabalho</option>
              <option value="ANALISTA">Analista</option>
            </select>
          </div>
          <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-green-200 mt-4 transition-all active:scale-95">
            {user ? 'Salvar Alterações' : 'Confirmar Acesso'}
          </button>
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

  const handleSaveUser = (userData: Omit<User, 'id' | 'status' | 'permissions'>) => {
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u);
      saveToStorage(updated);
      setEditingUser(null);
    } else {
      const newUser: User = { ...userData, id: `u-${Date.now()}`, status: 'ACTIVE', permissions: [] };
      saveToStorage([newUser, ...users]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED' as any } : u);
    saveToStorage(updated);
    setOpenMenuId(null);
  };

  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return;
    if (confirm("Remover permanentemente este usuário?")) {
      saveToStorage(users.filter(u => u.id !== id));
      setOpenMenuId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roles: Record<UserRole, string> = {
      ADMINISTRADOR: 'bg-red-500', GERENTE: 'bg-blue-600', SUPERVISOR: 'bg-orange-500', TECNICO: 'bg-green-600', ANALISTA: 'bg-gray-600',
    };
    return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${roles[role]}`}>{role}</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Equipe CHABRA</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Gestão centralizada de colaboradores e permissões.</p>
        </div>
        {currentUser?.role === 'ADMINISTRADOR' && (
          <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-green-200 transition-all active:scale-95">
            <UserPlus size={18} /> Novo Membro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><Shield size={24} /></div>
          <div><h4 className="text-[10px] font-black text-gray-400 uppercase">Privilegiados</h4><p className="text-2xl font-black text-gray-900">{users.filter(u => u.role === 'ADMINISTRADOR').length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><LucideUsers size={24} /></div>
          <div><h4 className="text-[10px] font-black text-gray-400 uppercase">Ativos</h4><p className="text-2xl font-black text-gray-900">{users.filter(u => u.status === 'ACTIVE').length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><AlertCircle size={24} /></div>
          <div><h4 className="text-[10px] font-black text-gray-400 uppercase">Desativados</h4><p className="text-2xl font-black text-gray-900">{users.filter(u => u.status === 'DISABLED').length}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1 bg-gray-50/50">
          {users.map((u) => (
            <div key={u.id} className="bg-white p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-all group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img src={u.avatar} className={`w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ${u.status === 'DISABLED' ? 'grayscale opacity-50' : ''}`} alt={u.name} />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${u.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)} className="p-2 text-gray-300 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"><MoreVertical size={20} /></button>
                  {openMenuId === u.id && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2">
                      <button onClick={() => { setEditingUser(u); setIsModalOpen(true); setOpenMenuId(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"><Edit2 size={16} /> Editar Perfil</button>
                      <button onClick={() => toggleStatus(u.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50">
                        {u.status === 'DISABLED' ? <UserCheck size={16} className="text-green-500" /> : <UserX size={16} className="text-orange-500" />}
                        {u.status === 'DISABLED' ? 'Ativar Acesso' : 'Bloquear Acesso'}
                      </button>
                      {currentUser?.role === 'ADMINISTRADOR' && u.id !== currentUser.id && (
                        <button onClick={() => deleteUser(u.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50"><Trash2 size={16} /> Excluir Membro</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-900 text-sm truncate">{u.name}</h3>
                  {u.id === currentUser?.id && <span className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">EU</span>}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail size={12} />
                  <span className="text-xs truncate font-medium">{u.email}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                {getRoleBadge(u.role)}
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{u.id.slice(-4)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {(isModalOpen || editingUser) && ( <UserModal user={editingUser || undefined} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} onSave={handleSaveUser} /> )}
    </div>
  );
};
