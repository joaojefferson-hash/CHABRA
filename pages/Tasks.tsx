
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
  Check,
  Edit3,
  Archive,
  GripVertical
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

interface TasksProps {
  tasks: Task[]; 
  allTasks: Task[]; 
  onUpdateTasks: (tasks: Task[]) => void;
  statusConfig: Record<string, { label: string, color: string, textColor: string }>;
  statusOrder: string[];
  onAddColumn: (name: string, color: string) => void;
  onDeleteColumn?: (status: string) => void; // Adicionado para suporte futuro
}

export const Tasks: React.FC<TasksProps> = ({ 
  tasks, 
  allTasks, 
  onUpdateTasks, 
  statusConfig, 
  statusOrder, 
  onAddColumn 
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewFilter = queryParams.get('view');

  const [activeView, setActiveView] = useState('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(statusOrder);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm('Deseja excluir esta tarefa permanentemente?')) {
      onUpdateTasks(allTasks.filter(t => t.id !== id));
    }
  };

  const handleArchiveTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // No ClickUp arquivar é apenas mudar status ou flag, aqui simularemos removendo da lista ativa
    if(confirm('Deseja arquivar esta tarefa?')) {
      onUpdateTasks(allTasks.filter(t => t.id !== id));
    }
  };

  const handleQuickCreate = (status: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova tarefa',
      description: '',
      status: status as TaskStatus,
      priority: 'NORMAL',
      assigneeId: 'u1',
      creatorId: 'u1',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: tasks.length > 0 ? tasks[0].projectId : 'p1',
      tags: [],
      subtasks: [],
      attachments: []
    };
    onUpdateTasks([newTask, ...allTasks]);
    setSelectedTask(newTask);
  };

  const handleCreateColumn = () => {
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim(), 'bg-indigo-500');
      setNewColumnName('');
      setIsCreatingColumn(false);
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const onDrop = (status: string) => {
    if (!draggedTaskId) return;
    const task = allTasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== status) {
      handleUpdateSingleTask({ ...task, status: status as TaskStatus, updatedAt: new Date().toISOString() });
    }
    setDraggedTaskId(null);
  };

  const renderListView = () => {
    return (
      <div className="space-y-4 pb-20">
        {statusOrder.map(status => {
          const groupTasks = filteredTasks.filter(t => t.status === status);
          if (viewFilter === 'backlog' && status !== 'BACKLOG') return null;
          const config = statusConfig[status];
          if (!config) return null;

          return (
            <div key={status} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
                onClick={() => toggleGroup(status)}
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.includes(status) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className={`w-2.5 h-6 rounded-full ${config.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">{config.label}</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{groupTasks.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleQuickCreate(status); }} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {expandedGroups.includes(status) && (
                <div className="divide-y divide-gray-50">
                  {groupTasks.length > 0 ? groupTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)} 
                      className="flex items-center group px-4 py-3 hover:bg-green-50/20 cursor-pointer border-l-4 border-transparent hover:border-green-500 transition-all"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <CheckCircle2 size={18} className={task.status === 'DONE' ? 'text-green-500' : 'text-gray-300'} />
                        <span className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }} className="p-1.5 hover:text-blue-500 hover:bg-blue-50 rounded"><Edit3 size={14} /></button>
                        <button onClick={(e) => handleArchiveTask(e, task.id)} className="p-1.5 hover:text-orange-500 hover:bg-orange-50 rounded"><Archive size={14} /></button>
                        <button onClick={(e) => handleDeleteTask(e, task.id)} className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-[10px] text-gray-400 italic">Sem tarefas</div>
                  )}
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
      <div className="flex gap-6 overflow-x-auto pb-10 items-start min-h-full">
        {statusOrder.map(status => {
          const groupTasks = filteredTasks.filter(t => t.status === status);
          if (viewFilter === 'backlog' && status !== 'BACKLOG') return null;
          const config = statusConfig[status];

          return (
            <div 
              key={status} 
              onDragOver={onDragOver}
              onDrop={() => onDrop(status)}
              className={`flex-shrink-0 w-80 flex flex-col gap-3 rounded-xl transition-colors ${draggedTaskId ? 'bg-gray-100/50 ring-2 ring-dashed ring-gray-200' : ''}`}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-4 rounded-full ${config.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600">{config.label}</h3>
                  <span className="text-[10px] font-bold text-gray-400">{groupTasks.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleQuickCreate(status)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><Plus size={14} /></button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-400"><MoreVertical size={14} /></button>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-h-[500px] p-1">
                {groupTasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    onClick={() => setSelectedTask(task)} 
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-green-400 hover:shadow-md cursor-grab active:cursor-grabbing group space-y-3 transition-all relative"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <GripVertical size={12} className="text-gray-300 opacity-0 group-hover:opacity-100" />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>{PRIORITY_CONFIG[task.priority].label}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => handleArchiveTask(e, task.id)} className="p-1 hover:text-orange-500"><Archive size={12} /></button>
                         <button onClick={(e) => handleDeleteTask(e, task.id)} className="p-1 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{task.title}</h4>
                    
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[8px] bg-gray-50 text-gray-400 border border-gray-100 px-1 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                       <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <CalendarIcon size={10} />
                          <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                       </div>
                       <div className="flex -space-x-1">
                          <img src={mockUsers.find(u => u.id === task.assigneeId)?.avatar} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                       </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleQuickCreate(status)}
                  className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-[10px] font-bold hover:bg-white hover:border-green-200 hover:text-green-600 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={12} /> NOVA TAREFA
                </button>
              </div>
            </div>
          );
        })}
        
        {/* New Column Button */}
        <div className="flex-shrink-0 w-80">
          {isCreatingColumn ? (
            <div className="bg-white p-4 rounded-xl border-2 border-green-500 shadow-lg animate-in zoom-in-95">
              <input 
                autoFocus 
                className="w-full px-3 py-2 border rounded-lg mb-2 text-sm font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" 
                placeholder="Nome da coluna..." 
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateColumn()}
              />
              <div className="flex gap-2">
                <button onClick={handleCreateColumn} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors">Criar Coluna</button>
                <button onClick={() => setIsCreatingColumn(false)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingColumn(true)}
              className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold hover:bg-white hover:border-green-300 hover:text-green-600 flex flex-col items-center justify-center gap-3 transition-all h-[150px]"
            >
              <div className="p-2 bg-gray-50 rounded-full group-hover:bg-green-50">
                <Plus size={24} />
              </div>
              ADICIONAR NOVO STATUS
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 shadow-inner">
            {TASK_VIEWS.map(view => (
              <button 
                key={view.id} 
                onClick={() => setActiveView(view.id)} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeView === view.id 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.icon} {view.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200 px-3 py-1.5 rounded-lg transition-all">
            <Filter size={14} /> Filtrar
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-md text-xs w-64 focus:ring-2 focus:ring-green-500/10 focus:border-green-500 outline-none bg-white transition-all" 
              placeholder="Pesquisar tarefas..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <button 
             onClick={() => handleQuickCreate('TODO')}
             className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeView === 'list' ? renderListView() : renderBoardView()}
      </div>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateSingleTask} 
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};
