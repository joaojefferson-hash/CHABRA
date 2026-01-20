
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TASK_VIEWS, STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { mockTasks, mockUsers } from '../store';
import { 
  MoreVertical, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

export const Tasks: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewFilter = queryParams.get('view');

  const [activeView, setActiveView] = useState('list');
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['BACKLOG', 'TODO', 'IN_PROGRESS']);

  const toggleGroup = (status: string) => {
    setExpandedGroups(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredTasks = useMemo(() => {
    if (viewFilter === 'backlog') {
      return tasks.filter(t => t.status === 'BACKLOG');
    }
    return tasks;
  }, [tasks, viewFilter]);

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const renderListView = () => {
    const statuses: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE'];

    return (
      <div className="space-y-4">
        {statuses.map(status => {
          const groupTasks = filteredTasks.filter(t => t.status === status);
          if (viewFilter === 'backlog' && status !== 'BACKLOG') return null;
          
          const isExpanded = expandedGroups.includes(status);

          return (
            <div key={status} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className={`flex items-center justify-between px-4 py-2 cursor-pointer select-none hover:bg-gray-50 transition-colors`}
                onClick={() => toggleGroup(status)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <span className={`w-2 h-6 rounded-full ${STATUS_CONFIG[status].color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {groupTasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400">
                  <Plus size={14} />
                </button>
              </div>

              {isExpanded && (
                <div className="divide-y divide-gray-50">
                  {groupTasks.length > 0 ? (
                    groupTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="flex items-center group px-4 py-3 hover:bg-green-50/30 cursor-pointer transition-all border-l-4 border-transparent hover:border-green-500"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <CheckCircle2 size={18} className="text-gray-300 group-hover:text-green-500 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-800 truncate">{task.title}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>
                                {PRIORITY_CONFIG[task.priority].label}
                              </span>
                              {task.tags.map(tag => (
                                <span key={tag} className="text-[9px] text-gray-400">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-gray-400">
                          <div className="hidden md:flex items-center gap-1.5 text-xs">
                            <CalendarIcon size={14} />
                            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="flex -space-x-1.5">
                            <img 
                              src={mockUsers.find(u => u.id === task.assigneeId)?.avatar} 
                              className="w-6 h-6 rounded-full border-2 border-white"
                              alt="assignee"
                            />
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 italic">
                      Nenhuma tarefa neste status.
                    </div>
                  )}
                  <button className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-green-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                    <Plus size={12} /> NOVO ITEM
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Contextual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            {TASK_VIEWS.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeView === view.id 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.icon}
                {view.label}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
            <Filter size={14} />
            Filtros
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Buscar nesta lista..." 
              className="pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none w-48 md:w-64 transition-all"
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm">
            Nova Tarefa
          </button>
        </div>
      </div>

      {activeView === 'list' ? renderListView() : (
        <div className="py-20 text-center bg-white rounded-xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 text-sm font-medium">Visualização em desenvolvimento. Use a "Lista" para melhor experiência.</p>
        </div>
      )}

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};
