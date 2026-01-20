
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { NAVIGATION_ITEMS } from '../constants';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, Star, Trash2, Edit2, LogOut, Shield, Lock, Info } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onAddProject,
  onDeleteProject,
  onEditProject 
}) => {
  const navigate = useNavigate();
  const { logout, user, can } = useAuth();

  const handleProjectClick = (id: string) => {
    onSelectProject(id);
    navigate('/tasks');
  };

  const handleLogoutClick = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      logout();
    }
  };

  const visibleNavigationItems = NAVIGATION_ITEMS.filter(item => {
    if (item.id === 'users') {
      return user?.role === 'ADMINISTRADOR';
    }
    return true;
  });

  const canManageProjects = can('CREATE_PROJECT');

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0 z-20 shadow-sm">
      <div className="p-5 border-b border-gray-50">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide">
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              Favoritos
            </h3>
            <Star size={12} className="text-gray-300" />
          </div>
          <div className="space-y-0.5">
            {visibleNavigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => item.id === 'tasks' ? onSelectProject(null) : null}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all
                  ${isActive && (item.id !== 'tasks' || !activeProjectId)
                    ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-1">
              Espaços
              {!canManageProjects && <Lock size={10} className="text-gray-300 ml-1" />}
            </h3>
            {canManageProjects && (
              <button 
                onClick={onAddProject}
                className="text-gray-400 hover:text-green-600 transition-colors"
                title="Novo Espaço"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="space-y-0.5">
            {projects.map((project) => (
              <div key={project.id} className="group relative">
                <button
                  onClick={() => handleProjectClick(project.id)}
                  title={project.observations ? `Obs: ${project.observations}` : undefined}
                  className={`w-full flex flex-col px-3 py-2 rounded-md transition-all
                    ${activeProjectId === project.id 
                      ? 'bg-gray-100 text-gray-900 shadow-inner' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 text-left truncate text-xs font-bold">{project.name}</span>
                    {project.observations && (
                      <Info size={10} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                    )}
                  </div>
                </button>
                
                {canManageProjects && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded px-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditProject(project.id); }}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && (
              <p className="px-3 py-4 text-[10px] text-gray-400 italic font-medium">Nenhum espaço disponível</p>
            )}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100 shadow-sm">
          <div className="relative">
            <img 
              src={user?.avatar || "https://picsum.photos/seed/admin/100"} 
              alt="User" 
              className="w-8 h-8 rounded-full ring-2 ring-white"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-extrabold text-gray-900 truncate">{user?.name || "Usuário"}</p>
            <div className="flex items-center gap-1">
              <Shield size={8} className="text-green-600" />
              <p className="text-[8px] text-green-600 font-black uppercase tracking-widest truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-md transition-all group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};
