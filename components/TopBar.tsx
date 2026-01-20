
import React, { useState, useMemo } from 'react';
import { Search, Bell, HelpCircle, Plus, LogOut, Check, Trash2, Clock as ClockIcon, X, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { PRIORITY_CONFIG } from '../constants.tsx';
import { Task } from '../types.ts';

interface TopBarProps {
  title: string;
  onNewTask: () => void;
  // We'll assume tasks are passed or we can fetch them from context if available. 
  // For this implementation, we'll make it optional to avoid breaking existing signatures 
  // but implement the logic for when they are provided.
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

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

        <div className="relative w-full max-w-xs ml-auto mr-4 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>
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
            title="Notificações"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] text-white flex items-center justify-center font-black">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Notificações</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{unreadCount} mensagens não lidas</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={markAllAsRead} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors" title="Marcar todas como lidas">
                      <Check size={14} />
                    </button>
                    <button onClick={clearAll} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors" title="Limpar tudo">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`px-6 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative flex gap-4 ${!notif.read ? 'bg-green-50/30' : ''}`}
                      >
                        {!notif.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />}
                        <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                          notif.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                          notif.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                          notif.type === 'ERROR' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Bell size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-400 font-bold">
                            <ClockIcon size={10} />
                            <span>{formatTime(notif.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <Bell size={32} className="opacity-20" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Sem notificações</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50/50 text-center">
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline"
                    >
                      Fechar Painel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button 
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          title="Ajuda"
        >
          <HelpCircle size={20} />
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all group ml-1"
          title="Sair do Sistema"
        >
          <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
};
