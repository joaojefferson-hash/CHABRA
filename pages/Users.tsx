
import React, { useState } from 'react';
import { mockUsers } from '../store.ts';
import { User, UserRole } from '../types.ts';
import { Shield, MoreHorizontal, UserPlus, Mail, Check, X, Clock, Users as LucideUsers } from 'lucide-react';

export const Users: React.FC = () => {
  const [users] = useState<User[]>(mockUsers);

  const getRoleBadge = (role: UserRole) => {
    const roles = {
      ADMIN: { label: 'Administrador', color: 'bg-red-100 text-red-700 border-red-200' },
      MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      MEMBER: { label: 'Membro', color: 'bg-green-100 text-green-700 border-green-200' },
      VIEWER: { label: 'Observador', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roles[role].color}`}>
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
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 active:scale-95">
          <UserPlus size={18} />
          <span>Convidar Membro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: users.length, icon: <LucideUsers size={20} />, color: 'blue' },
          { label: 'Ativos', value: users.filter(u => u.status === 'ACTIVE').length, icon: <Check size={20} />, color: 'green' },
          { label: 'Pendentes', value: users.filter(u => u.status === 'PENDING').length, icon: <Clock size={20} />, color: 'yellow' },
          { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: <Shield size={20} />, color: 'red' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}>
              {s.icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={user.name} />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {user.status === 'ACTIVE' ? 'ATIVO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-400 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
