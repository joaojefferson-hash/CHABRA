
import React, { useState } from 'react';
import { mockUsers } from '../store';
import { User, UserRole } from '../types';
// Fixed collision: imported Users as UsersIcon to distinguish from the page component
import { Shield, MoreHorizontal, UserPlus, Mail, Check, X, Clock, Users as UsersIcon } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const getRoleBadge = (role: UserRole) => {
    const roles = {
      ADMIN: { label: 'Administrador', color: 'bg-red-100 text-red-700 border-red-200' },
      MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      MEMBER: { label: 'Membro', color: 'bg-green-100 text-green-700 border-green-200' },
      VIEWER: { label: 'Observador', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${roles[role].color}`}>
        {roles[role].label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestão de Equipe</h2>
          <p className="text-sm text-gray-500">Controle permissões, convites e acessos do CHABRA-Gestão.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <UserPlus size={18} />
          <span>Convidar Usuário</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              {/* Fixed: using UsersIcon instead of Users to avoid recursion and property error */}
              <UsersIcon size={18} />
            </div>
            <span className="text-sm font-medium text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <Check size={18} />
            </div>
            <span className="text-sm font-medium text-gray-500">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock size={18} />
            </div>
            <span className="text-sm font-medium text-gray-500">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'PENDING').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Shield size={18} />
            </div>
            <span className="text-sm font-medium text-gray-500">Admins</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Usuário</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Acesso</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Permissões</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {user.status === 'ACTIVE' ? 'Ativo' : 'Aguardando Liberação'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.map(p => (
                      <span key={p} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.status === 'PENDING' && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Aprovar Cadastro">
                        <Check size={18} />
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
