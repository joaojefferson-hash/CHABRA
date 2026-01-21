
import React, { useState, useMemo } from 'react';
import { mockUsers as initialUsers } from '../store.ts';
import { User, UserRole } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { 
  Shield, UserPlus, X, Users as LucideUsers, Edit2, UserX, UserCheck, Trash2, 
  AlertCircle, Mail, MoreVertical, Search, Filter, Check, UserCircle, Lock, Eye, EyeOff
} from 'lucide-react';

const authChannel = new BroadcastChannel('chabra_auth_sync');

const UserModal: React.FC<{ 
  user?: User, 
  onClose: () => void, 
  onSave: (userData: Omit<User, 'id' | 'status' | 'permissions'>) => void 
}> = ({ user, onClose, onSave }) => {
  const { can } = useAuth();
  
  const getStoredPassword = () => {
    const localUsersStr = localStorage.getItem('chabra_users_list');
    if (localUsersStr) {
      const allUsers = JSON.parse(localUsersStr);
      const found = allUsers.find((u: any) => u.id === user?.id);
      return found?.password || 'chabra2024';
    }
    return 'chabra2024';
  };

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState(getStoredPassword());
  const [role, setRole] = useState<UserRole>(user?.role || 'ANALISTA');
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = can('MANAGE_USERS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      email,
      password,
      role, 
      avatar: user?.avatar || `https://picsum.photos/seed/${email}/100` 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-900">{user ? 'Editar Membro' : 'Novo Membro'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome</label>
            <input required className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
            <input required type="email" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo</label>
            <select disabled={!isAdmin} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer" value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="ADMINISTRADOR">Administrador</option>
              <option value="GERENTE">Gerente</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="TECNICO">Técnico em Seg. Trabalho</option>
              <option value="ANALISTA">Analista</option>
            </select>
          </div>
          <button type="submit" className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-green-200 transition-all">
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { user: currentUser, can, refreshSession } = useAuth();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('chabra_users_list');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const saveToStorage = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('chabra_users_list', JSON.stringify(newUsers));
    
    // Dispara sinal de atualização para todos os computadores na rede
    authChannel.postMessage({ type: 'ROLE_UPDATED' });
    
    const updatedSelf = newUsers.find(u => u.id === currentUser?.id);
    if (updatedSelf) {
      localStorage.setItem('chabra_user', JSON.stringify(updatedSelf));
      refreshSession();
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  const handleSaveUser = (userData: Omit<User, 'id' | 'status' | 'permissions'>) => {
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u);
      saveToStorage(updated);
      addNotification({ title: 'Equipe Atualizada', message: `${userData.name} agora é ${userData.role}`, type: 'SUCCESS' });
    } else {
      const newUser: User = { ...userData, id: `u-${Date.now()}`, status: 'ACTIVE', permissions: [] };
      saveToStorage([newUser, ...users]);
    }
    setEditingUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-gray-900">Membros da Equipe</h2>
        {can('MANAGE_USERS') && (
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-green-200"><UserPlus size={18} /></button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u) => (
          <div key={u.id} className="bg-white p-6 rounded-[2rem] border hover:shadow-xl transition-all group relative">
             <div className="flex items-center gap-4">
                <img src={u.avatar} className="w-16 h-16 rounded-2xl object-cover" alt={u.name} />
                <div>
                   <h3 className="font-black text-gray-900">{u.name}</h3>
                   <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${u.role === 'ADMINISTRADOR' ? 'bg-red-500' : 'bg-blue-600'} text-white`}>{u.role}</span>
                </div>
                {can('MANAGE_USERS') && (
                  <button onClick={() => {setEditingUser(u); setIsModalOpen(true);}} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-green-600"><Edit2 size={16}/></button>
                )}
             </div>
          </div>
        ))}
      </div>

      {(isModalOpen || editingUser) && (
        <UserModal user={editingUser || undefined} onClose={() => {setIsModalOpen(false); setEditingUser(null);}} onSave={handleSaveUser} />
      )}
    </div>
  );
};
