
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TASK_VIEWS, PRIORITY_CONFIG } from '../constants';
import { mockUsers } from '../store';
import { 
  MoreVertical, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Search,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

interface TasksProps {
  tasks: Task[]; // Tarefas filtradas pelo projeto ativo
  allTasks: Task[]; // Todas as tarefas para permitir persistência global
  onUpdateTasks: (tasks: Task[]) => void;
  statusConfig: Record<string, { label: string, color: string, textColor: string }>;
  statusOrder: string[];
  onAddColumn: (name: string, color: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({ tasks, allTasks, onUpdateTasks, statusConfig, statusOrder, onAddColumn }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewFilter = queryParams.get('view');

  const [activeView, setActiveView] = useState('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(statusOrder);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const toggleGroup = (status: string) => {
    setExpandedGroups(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (viewFilter === 'backlog') {
      result = result.filter(t => t.status === 'BACKLOG');
    }
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [tasks, viewFilter, searchQuery]);

  const handleUpdateSingleTask = (updatedTask: Task) => {
    const newAllTasks = allTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateTasks(newAllTasks);
    setSelectedTask(updatedTask);
  };

  const moveTaskStatus = (e: React.MouseEvent, task: Task, direction: 'next' | 'prev') => {
    e.stopPropagation();
    const currentIndex = statusOrder.indexOf(task.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      const updatedTask = { ...task, status: statusOrder[nextIndex] as TaskStatus, updatedAt: new Date().toISOString() };
      handleUpdateSingleTask(updatedTask);
    }
  };

  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Deseja excluir esta tarefa?')) {
      onUpdateTasks(allTasks.filter(t => t.id !== id));
    }
  };

  const handleQuickCreate = (status: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova tarefa rápida',
      description: '',
      status: status as TaskStatus,
      priority: 'NORMAL',
      assigneeId: 'u1',
      creatorId: 'u1',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: tasks[0]?.projectId || 'p1',
      tags: [],
      subtasks: [],
      attachments: []
    };
    onUpdateTasks([newTask, ...allTasks]);
    setSelectedTask(newTask);
  };

  const handleCreateColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim(), 'bg-blue-500');
      setNewColumnName('');
      setIsCreatingColumn(false);
    }
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {statusOrder.map(status => {
          const groupTasks = filteredTasks.filter(t => t.status === status);
          if (viewFilter === 'backlog' && status !== 'BACKLOG') return null;
          const config = statusConfig[status];
          if (!config) return null;

          return (
            <div key={status} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGroup(status)}
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.includes(status) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className={`w-2 h-6 rounded-full ${config.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">{config.label}</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{groupTasks.length}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleQuickCreate(status); }} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                  <Plus size={14} />
                </button>
              </div>

              {expandedGroups.includes(status) && (
                <div className="divide-y divide-gray-50">
                  {groupTasks.map(task => (
                    <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center group px-4 py-3 hover:bg-green-50/30 cursor-pointer border-l-4 border-transparent hover:border-green-500 transition-all">
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <CheckCircle2 size={18} className={task.status === 'DONE' ? 'text-green-500' : 'text-gray-300'} />
                        <span className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => handleDeleteTask(e, task.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBoardView = () => {
    return (
      <div className="flex gap-6 overflow-x-auto pb-6 items-start">
        {statusOrder.map(status => {
          const groupTasks = filteredTasks.filter(t => t.status === status);
          if (viewFilter === 'backlog' && status !== 'BACKLOG') return null;
          const config = statusConfig[status];

          return (
            <div key={status} className="flex-shrink-0 w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-4 rounded-full ${config.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600">{config.label}</h3>
                </div>
                <button onClick={() => handleQuickCreate(status)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><Plus size={14} /></button>
              </div>

              <div className="flex flex-col gap-3 min-h-[400px]">
                {groupTasks.map(task => (
                  <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-green-400 cursor-pointer group space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>{PRIORITY_CONFIG[task.priority].label}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={(e) => moveTaskStatus(e, task, 'prev')} className="p-1 hover:bg-gray-100 rounded"><ArrowLeft size={12} /></button>
                        <button onClick={(e) => moveTaskStatus(e, task, 'next')} className="p-1 hover:bg-gray-100 rounded"><ArrowRight size={12} /></button>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">{task.title}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                       <span className="text-[10px] text-gray-400">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                       <img src={mockUsers.find(u => u.id === task.assigneeId)?.avatar} className="w-6 h-6 rounded-full border border-white" alt="avatar" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="flex-shrink-0 w-80">
          {isCreatingColumn ? (
            <div className="bg-white p-4 rounded-xl border-2 border-green-500 shadow-lg">
              <input 
                autoFocus 
                className="w-full px-3 py-2 border rounded-lg mb-2 text-sm" 
                placeholder="Nome da coluna..." 
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateColumn()}
              />
              <div className="flex gap-2">
                <button onClick={handleCreateColumn} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold">Criar</button>
                <button onClick={() => setIsCreatingColumn(false)} className="px-3 py-1.5 border rounded-lg text-xs">Cancelar</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingColumn(true)}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-white hover:border-green-300 flex flex-col items-center justify-center gap-2 h-[120px]"
            >
              <Plus size={20} /> ADICIONAR STATUS
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div className="flex items-center gap-4 bg-gray-100 p-0.5 rounded-lg border">
          {TASK_VIEWS.map(view => (
            <button key={view.id} onClick={() => setActiveView(view.id)} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold ${activeView === view.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {view.icon} {view.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input className="pl-8 pr-4 py-1.5 border rounded-md text-xs w-64" placeholder="Buscar tarefas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeView === 'list' ? renderListView() : renderBoardView()}
      </div>

      {selectedTask && (
        <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateSingleTask} />
      )}
    </div>
  );
};
