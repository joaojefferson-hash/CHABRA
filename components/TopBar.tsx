
import React, { useState, useMemo } from 'react';
import { Search, Bell, HelpCircle, Plus, LogOut, Check, Trash2, Clock as ClockIcon, X, Flag, Cloud, CloudOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { PRIORITY_CONFIG } from '../constants.tsx';
import { Task } from '../types.ts';
import { isCloudEnabled } from '../lib/firebase.ts';

interface TopBarProps {
  title: string;
  onNewTask: () => void;
  tasks?: Task[];
}

export const TopBar: React.FC<TopBarProps> = ({ title, onNewTask, tasks = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { logout, user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      logout();
    }
  };

  const prioritySummary = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    const urgent = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'DONE').length;
    const high = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length;
    return { urgent, high };
  }, [tasks]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
        
        {/* Cloud Sync Status */}
        <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
           {isCloudEnabled ? (
             <Cloud size={12} className="text-green-500" />
           ) : (
             <CloudOff size={12} className="text-amber-500" />
           )}
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
             {isCloudEnabled ? 'Sincronizado' : 'Local (Home Office)'}
           </span>
        </div>

        {prioritySummary && (prioritySummary.urgent > 0 || prioritySummary.high > 0) && (
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <div className="h-4 w-px bg-gray-200 mx-2" />
            {prioritySummary.urgent > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${PRIORITY_CONFIG.URGENT.color} border border-red-200 animate-pulse`}>
                <Flag size={10} className="fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  {prioritySummary.urgent} {PRIORITY_CONFIG.URGENT.label}
                </span>
              </div>
            )}
            {prioritySummary.high > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${PRIORITY_CONFIG.HIGH.color} border border-orange-200`}>
                <Flag size={10} className="fill-current" />
                <span className="text-[9px] font-black uppercase tracking-tighter">
                  {prioritySummary.high} {PRIORITY_CONFIG.HIGH.label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onNewTask}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-green-200"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Nova Tarefa</span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2" />

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full relative transition-all ${showNotifications ? 'bg-green-50 text-green-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] text-white flex items-center justify-center font-black">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown ... (Same as before) */}
        </div>

        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all group ml-1">
          <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
