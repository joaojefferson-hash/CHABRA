
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { NAVIGATION_ITEMS } from '../constants';
import { Project, Workspace } from '../types';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Plus, Star, Trash2, Edit2, LogOut, Shield, Lock, Info, 
  ChevronDown, Settings, Building2, Globe, ChevronRight
} from 'lucide-react';
import { mockWorkspaces } from '../store';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onSelectProject: (id: string | null) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
  onEditProject: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  activeWorkspaceId,
  onSelectWorkspace,
  onSelectProject, 
  onAddProject,
  onDeleteProject,
  onEditProject 
}) => {
  const navigate = useNavigate();
  const { logout, user, can } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const activeWorkspace = mockWorkspaces.find(w => w.id === activeWorkspaceId) || mockWorkspaces[0];

  const handleProjectClick = (id: string) => {
    onSelectProject(id);
    navigate('/tasks');
  };

  const handleWorkspaceChange = (id: string) => {
    onSelectWorkspace(id);
    onSelectProject(null);
    setShowWorkspaceMenu(false);
  };

  return (
    <aside className="w-72 h-screen bg-[#F3F4F6] border-r border-gray-200 flex flex-col sticky top-0 z-20 shadow-sm">
      {/* Workspace Switcher */}
      <div className="p-4 border-b border-gray-200 relative">
        <button 
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-200 hover:border-green-400 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md">
              {activeWorkspace.name.charAt(0)}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-black text-gray-900 truncate max-w-[120px]">{activeWorkspace.name}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Workspace</span>
            </div>
          </div>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
        </button>

        {showWorkspaceMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
            <div className="absolute left-4 right-4 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2">
              <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Seus Workspaces</p>
              {mockWorkspaces.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleWorkspaceChange(w.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${activeWorkspaceId === w.id ? 'bg-green-50 text-green-700' : 'text-gray-600'}`}
                >
                  <Building2 size={16} />
                  <span className="text-xs font-bold">{w.name}</span>
                </button>
              ))}
              <div className="border-t border-gray-50 mt-2 pt-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-green-600 hover:bg-gray-50 transition-colors">
                  <Plus size={16} /> Criar Workspace
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        {/* Navigation */}
        <div className="space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                ${isActive ? 'bg-white text-green-700 shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}
              `}
            >
              <span className="opacity-70">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Space Hierarchy */}
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Espaços de Trabalho</h3>
            {can('CREATE_PROJECT') && (
              <button onClick={onAddProject} className="p-1 hover:bg-gray-200 rounded-md text-gray-400 transition-colors">
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project.id} className="group">
                <button
                  onClick={() => handleProjectClick(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                    ${activeProjectId === project.id ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-white/50'}
                  `}
                >
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="flex-1 text-left truncate text-xs font-bold">{project.name}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-40" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Profile */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-gray-50 border border-gray-100">
          <img src={user?.avatar} className="w-9 h-9 rounded-xl shadow-sm" alt="Profile" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 truncate">{user?.name}</p>
            <p className="text-[9px] text-green-600 font-black uppercase tracking-widest">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
