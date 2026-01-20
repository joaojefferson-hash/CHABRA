
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { NAVIGATION_ITEMS, CHABRA_COLORS } from '../constants';
import { mockProjects } from '../store';
import { Plus, ChevronDown, Hash, Star } from 'lucide-react';

export const Sidebar: React.FC = () => {
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
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all
                  ${isActive 
                    ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {/* Fixed: Wrapped children in a function to access the isActive state correctly from NavLink */}
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
              Espaços (Projetos)
            </h3>
            <button className="text-gray-400 hover:text-green-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {mockProjects.map((project) => (
              <button
                key={project.id}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group"
              >
                <div 
                  className="w-2 h-2 rounded-sm rotate-45" 
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 text-left truncate">{project.name}</span>
                <ChevronDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200">
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/admin/100" 
              alt="User" 
              className="w-8 h-8 rounded-full ring-2 ring-white"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-extrabold text-gray-900 truncate">Admin Chabra</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Workspace Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
