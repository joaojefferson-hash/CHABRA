
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TASK_VIEWS, PRIORITY_CONFIG } from '../constants';
import { mockUsers } from '../store';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  MoreVertical, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  Search,
  GripVertical,
  X,
  Clock,
  Filter as FilterIcon,
  Trash2,
  Palette,
  Check,
  Settings,
  Lock
} from 'lucide-react';
import { Task } from '../types';
import { TaskDetailsModal } from '../components/TaskDetailsModal';

interface TasksProps {
  tasks: Task[]; 
  allTasks: Task[]; 
  onUpdateTasks: (tasks: Task[]) => void;
  statusConfig: Record<string, { label: string, color: string, textColor: string }>;
  statusOrder: string[];
  onAddColumn: (name: string, color: string) => void;
  onDeleteColumn: (status: string) => void;
}

const PRESET_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 
  'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500', 'bg-gray-500'
];

export const Tasks: React.FC<TasksProps> = ({ 
  tasks, 
  allTasks, 
  onUpdateTasks, 
  statusConfig, 
  statusOrder, 
  onAddColumn,
  onDeleteColumn
}) => {
  const { user, can } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isBacklogView = queryParams.get('view') === 'backlog';

  const [activeView, setActiveView] = useState('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(statusOrder);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('bg-blue-500');
  
  // Drag and drop states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const canManageStructure = can('CREATE_PROJECT');

  const checkEditPermission = (task: Task) => {
    if (!user) return false;
    if (can('EDIT_OTHERS_TASKS')) return true;
    return task.creatorId === user.id || task.assigneeId === user.id;
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (isBacklogView) {
      result = result.filter(t => t.status === 'BACKLOG');
    } else if (selectedStatuses.length > 0) {
      result = result.filter(t => selectedStatuses.includes(t.status));
    }

    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result;
  }, [tasks, isBacklogView, searchQuery, selectedStatuses]);

  const visibleStatusOrder = useMemo(() => {
    if (isBacklogView) return ['BACKLOG'];
    if (selectedStatuses.length > 0) {
      return statusOrder.filter(s => selectedStatuses.includes(s));
    }
    return statusOrder;
  }, [statusOrder, isBacklogView, selectedStatuses]);

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleUpdateSingleTask = (updatedTask: Task) => {
    if (!checkEditPermission(updatedTask)) {
      alert("Você não tem permissão para editar esta tarefa.");
      return;
    }
    const newAllTasks = allTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateTasks(newAllTasks);
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleQuickCreate = (status: string, date?: string) => {
    if (!can('CREATE_TASK')) {
      alert("Você não tem permissão para criar tarefas.");
      return;
    }
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova tarefa',
      description: '',
      status: status,
      priority: 'NORMAL',
      assigneeId: user?.id || 'u1',
      creatorId: user?.id || 'u1',
      dueDate: date || new Date().toISOString().split('T')[0],
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

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageStructure) return;
    if (!newColumnName.trim()) return;
    onAddColumn(newColumnName.trim(), newColumnColor);
    setNewColumnName('');
    setIsCreatingColumn(false);
  };

  const onDragStart = (e: React.DragEvent, task: Task) => {
    if (!checkEditPermission(task)) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(task.id);
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a ghost image if desired, but native is fine for this UI
  };

  const onDragOverStatus = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const onDragLeaveStatus = (e: React.DragEvent) => {
    setDragOverStatus(null);
  };

  const onDropStatus = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (!taskId) return;
    
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      handleUpdateSingleTask({ ...task, status, updatedAt: new Date().toISOString() });
    }
    setDraggedTaskId(null);
  };

  const onDragOverCalendar = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (dragOverDate !== date) {
      setDragOverDate(date);
    }
  };

  const onDropCalendar = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (!taskId) return;
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.dueDate !== date) {
      handleUpdateSingleTask({ ...task, dueDate: date, updatedAt: new Date().toISOString() });
    }
    setDraggedTaskId(null);
  };

  const toggleGroup = (status: string) => {
    setExpandedGroups(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const renderListView = () => (
    <div className="space-y-4 pb-20">
      {visibleStatusOrder.map(status => {
        const groupTasks = filteredTasks.filter(t => t.status === status);
        const config = statusConfig[status];
        if (!config) return null;

        return (
          <div key={status} className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50" onClick={() => toggleGroup(status)}>
              <div className="flex items-center gap-3">
                {expandedGroups.includes(status) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className={`w-2.5 h-6 rounded-full ${config.color}`} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">{config.label}</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{groupTasks.length}</span>
              </div>
            </div>
            {expandedGroups.includes(status) && (
              <div className="divide-y divide-gray-50">
                {groupTasks.map(task => {
                  const hasPermission = checkEditPermission(task);
                  return (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)} 
                      className={`flex items-center px-4 py-3 hover:bg-green-50/20 cursor-pointer border-l-4 border-transparent hover:border-green-500 transition-all ${!hasPermission ? 'opacity-80' : ''}`}
                    >
                      <CheckCircle2 size={18} className={task.status === 'DONE' ? 'text-green-500' : 'text-gray-300'} />
                      <div className="flex-1 flex items-center justify-between ml-3">
                        <span className={`text-sm font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                        {!hasPermission && <Lock size={12} className="text-gray-300" />}
                      </div>
                    </div>
                  );
                })}
                {groupTasks.length === 0 && (
                  <div className="px-10 py-4 text-[10px] text-gray-400 font-bold uppercase italic">Nenhuma tarefa encontrada</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderBoardView = () => (
    <div className="flex gap-6 overflow-x-auto pb-10 items-start min-h-full scrollbar-thin scrollbar-thumb-gray-200 px-1">
      {visibleStatusOrder.map(status => {
        const groupTasks = filteredTasks.filter(t => t.status === status);
        const config = statusConfig[status];
        if (!config) return null;

        const isOver = dragOverStatus === status;

        return (
          <div 
            key={status} 
            onDragOver={(e) => onDragOverStatus(e, status)} 
            onDragLeave={onDragLeaveStatus}
            onDrop={(e) => onDropStatus(e, status)} 
            className={`flex-shrink-0 w-80 flex flex-col gap-3 group/col transition-colors duration-200 p-2 rounded-2xl ${isOver ? 'bg-green-50/50 ring-2 ring-dashed ring-green-300' : ''}`}
          >
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-4 rounded-full ${config.color}`} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600 truncate max-w-[150px]">{config.label}</h3>
                <span className="text-[10px] font-bold text-gray-400">{groupTasks.length}</span>
              </div>
              <div className={`flex items-center gap-1 transition-opacity ${draggedTaskId ? 'opacity-0' : 'opacity-0 group-hover/col:opacity-100'}`}>
                {can('CREATE_TASK') && (
                  <button onClick={() => handleQuickCreate(status)} className="p-1 hover:bg-gray-200 rounded text-gray-400" title="Adicionar Tarefa"><Plus size={14} /></button>
                )}
                {canManageStructure && status !== 'BACKLOG' && status !== 'DONE' && status !== 'TODO' && (
                  <button onClick={() => onDeleteColumn(status)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500" title="Excluir Coluna"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <div className={`flex flex-col gap-3 min-h-[500px] transition-all ${isOver ? 'translate-y-1' : ''}`}>
              {groupTasks.map(task => {
                const hasPermission = checkEditPermission(task);
                const isDragging = draggedTaskId === task.id;
                
                return (
                  <div 
                    key={task.id} 
                    draggable={hasPermission} 
                    onDragStart={(e) => onDragStart(e, task)} 
                    onDragEnd={() => { setDraggedTaskId(null); setDragOverStatus(null); }}
                    onClick={() => setSelectedTask(task)} 
                    className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-green-400 active:cursor-grabbing group space-y-3 transition-all 
                      ${hasPermission ? 'cursor-grab' : 'cursor-pointer opacity-90'} 
                      ${isDragging ? 'opacity-40 scale-95 border-dashed border-green-500 ring-2 ring-green-100' : 'hover:shadow-md'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>{PRIORITY_CONFIG[task.priority].label}</span>
                      {!hasPermission && <Lock size={10} className="text-gray-300" />}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                       <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10}/> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                       <img src={mockUsers.find(u => u.id === task.assigneeId)?.avatar} className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm" alt="avatar" />
                    </div>
                  </div>
                );
              })}
              {groupTasks.length === 0 && isOver && (
                <div className="h-24 border-2 border-dashed border-green-200 rounded-xl flex items-center justify-center bg-white/50 animate-pulse">
                   <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Solte aqui</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!isBacklogView && selectedStatuses.length === 0 && canManageStructure && (
        <div className={`flex-shrink-0 w-80 transition-opacity ${draggedTaskId ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          {isCreatingColumn ? (
            <form onSubmit={handleCreateColumn} className="bg-white p-4 rounded-2xl border border-green-200 shadow-lg animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nova Coluna</span>
                <button type="button" onClick={() => setIsCreatingColumn(false)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
              </div>
              <input 
                autoFocus
                placeholder="Nome do status..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-green-500/20 mb-3"
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_COLORS.map(color => (
                  <button 
                    key={color} 
                    type="button"
                    onClick={() => setNewColumnColor(color)}
                    className={`w-6 h-6 rounded-full ${color} border-2 transition-transform ${newColumnColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-110'}`}
                  />
                ))}
              </div>
              <button 
                type="submit"
                disabled={!newColumnName.trim()}
                className="w-full py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 disabled:bg-gray-100 transition-all"
              >
                Criar Status
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsCreatingColumn(true)}
              className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-green-300 hover:text-green-600 transition-all group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Add Coluna</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderCalendarView = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full mb-10">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50 rounded-xl transition-all">Hoje</button>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-auto">
          {days.map((day, idx) => {
            const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const dayTasks = day ? filteredTasks.filter(t => t.dueDate === dateStr) : [];
            const isOver = dragOverDate === dateStr && day !== null;
            
            return (
              <div 
                key={idx} 
                onDragOver={(e) => day && onDragOverCalendar(e, dateStr)}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => day && onDropCalendar(e, dateStr)}
                className={`min-h-[140px] border-r border-b border-gray-50 p-2 transition-all duration-200 ${day ? 'hover:bg-gray-50/30' : 'bg-gray-50/20'} ${isOver ? 'bg-green-50 scale-[0.98] ring-2 ring-inset ring-green-200 z-10 shadow-inner' : ''}`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black ${new Date().toISOString().split('T')[0] === dateStr ? 'bg-green-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                        {day}
                      </span>
                      {can('CREATE_TASK') && (
                        <button onClick={() => handleQuickCreate('TODO', dateStr)} className="opacity-0 hover:opacity-100 p-1 text-gray-300 hover:text-green-600"><Plus size={12}/></button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map(task => {
                        const hasPermission = checkEditPermission(task);
                        const isDragging = draggedTaskId === task.id;
                        
                        return (
                          <div 
                            key={task.id}
                            draggable={hasPermission}
                            onDragStart={(e) => onDragStart(e, task)}
                            onDragEnd={() => { setDraggedTaskId(null); setDragOverDate(null); }}
                            onClick={() => setSelectedTask(task)}
                            className={`px-2 py-1.5 rounded-lg border shadow-sm transition-all hover:scale-[1.02] ${statusConfig[task.status]?.color || 'bg-white'} border-black/5 
                              ${hasPermission ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer opacity-90'}
                              ${isDragging ? 'opacity-20' : ''}
                            `}
                          >
                            <p className={`text-[10px] font-bold truncate leading-tight ${statusConfig[task.status]?.textColor || 'text-gray-700'} flex items-center justify-between`}>
                              {task.title}
                              {!hasPermission && <Lock size={8} />}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
            {TASK_VIEWS.map(view => (
              <button 
                key={view.id} 
                onClick={() => setActiveView(view.id)} 
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === view.id ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {view.icon} {view.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedStatuses.length > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              <FilterIcon size={14} />
              Status {selectedStatuses.length > 0 && (
                <span className="ml-1 bg-green-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] animate-in zoom-in">
                  {selectedStatuses.length}
                </span>
              )}
              <ChevronDown size={12} className={`transition-transform duration-200 ${showStatusFilter ? 'rotate-180' : ''}`} />
            </button>

            {showStatusFilter && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusFilter(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between p-2 mb-1 border-b border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtrar Status</span>
                    {selectedStatuses.length > 0 && (
                      <button onClick={() => setSelectedStatuses([])} className="text-[9px] font-black text-red-500 uppercase hover:underline">Limpar</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-hide">
                    {statusOrder.map(status => {
                      const config = statusConfig[status];
                      const isSelected = selectedStatuses.includes(status);
                      return (
                        <button
                          key={status}
                          onClick={() => toggleStatusFilter(status)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${isSelected ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                          <div className={`w-3 h-3 rounded-full ${config.color} shadow-sm`} />
                          <span className="text-[10px] font-bold uppercase flex-1 text-left">{config.label}</span>
                          {isSelected && <Check size={12} className="text-green-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {canManageStructure && (
            <button 
              onClick={() => setIsCreatingColumn(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
            >
              <Settings size={14} />
              Config. Status
            </button>
          )}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={14} />
          <input 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs w-full lg:w-64 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 shadow-sm transition-all" 
            placeholder="Buscar nas tarefas..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeView === 'list' && renderListView()}
        {activeView === 'board' && renderBoardView()}
        {activeView === 'calendar' && renderCalendarView()}
      </div>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateSingleTask} 
          statusConfigs={statusConfig}
        />
      )}
    </div>
  );
};
