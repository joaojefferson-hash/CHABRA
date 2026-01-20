
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Plus } from 'lucide-react';

export const TopBar: React.FC<{ title: string }> = ({ title }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <div className="relative w-full max-w-md ml-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar tarefas, projetos, pessoas..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-green-200">
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
};
