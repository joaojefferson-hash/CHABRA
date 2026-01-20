
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { NAVIGATION_ITEMS } from '../constants';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, ChevronDown, Star, Settings, Trash2, Edit2, LogOut } from 'lucide-react';

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
  const { logout, user } = useAuth();

  const handleProjectClick = (id: string) => {
    onSelectProject(id);
    navigate('/tasks');
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente sair do sistema?")) {
      logout();
    }
  };

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
            {NAVIGATION_ITEMS.map((item) => (
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
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              Espaços
            </h3>
            <button 
              onClick={onAddProject}
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {projects.map((project) => (
              <div key={project.id} className="group relative">
                <button
                  onClick={() => handleProjectClick(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all
                    ${activeProjectId === project.id 
                      ? 'bg-gray-100 text-gray-900 shadow-inner' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-sm" 
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 text-left truncate">{project.name}</span>
                </button>
                
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
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200">
          <div className="relative">
            <img 
              src={user?.avatar || "https://picsum.photos/seed/admin/100"} 
              alt="User" 
              className="w-8 h-8 rounded-full ring-2 ring-white"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-extrabold text-gray-900 truncate">{user?.name || "Usuário"}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{user?.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}</p>
          </div>
          <Settings size={14} className="text-gray-300" />
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-md transition-all group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};
