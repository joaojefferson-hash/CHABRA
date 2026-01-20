
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { TASK_VIEWS, PRIORITY_CONFIG } from '../constants';
import { mockUsers } from '../store';
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
  Clock
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

export const Tasks: React.FC<TasksProps> = ({ 
  tasks, 
  allTasks, 
  onUpdateTasks, 
  statusConfig, 
  statusOrder, 
  onAddColumn,
  onDeleteColumn
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isBacklogView = queryParams.get('view') === 'backlog';

  const [activeView, setActiveView] = useState('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(statusOrder);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Estados do Calendário
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (isBacklogView) {
      result = result.filter(t => t.status === 'BACKLOG');
    }
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [tasks, isBacklogView, searchQuery]);

  const handleUpdateSingleTask = (updatedTask: Task) => {
    const newAllTasks = allTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    onUpdateTasks(newAllTasks);
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleQuickCreate = (status: string, date?: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova tarefa',
      description: '',
      status: status,
      priority: 'NORMAL',
      assigneeId: 'u1',
      creatorId: 'u1',
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

  // Drag and Drop Logic
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDropStatus = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (!taskId) return;
    const task = allTasks.find(t => t.id === taskId);
    if (task) handleUpdateSingleTask({ ...task, status, updatedAt: new Date().toISOString() });
    setDraggedTaskId(null);
  };

  const onDropCalendar = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId") || draggedTaskId;
    if (!taskId) return;
    const task = allTasks.find(t => t.id === taskId);
    if (task) handleUpdateSingleTask({ ...task, dueDate: date, updatedAt: new Date().toISOString() });
    setDraggedTaskId(null);
  };

  const renderListView = () => (
    <div className="space-y-4 pb-20">
      {statusOrder.map(status => {
        const groupTasks = filteredTasks.filter(t => t.status === status);
        const config = statusConfig[status];
        if (!config || (isBacklogView && status !== 'BACKLOG')) return null;

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
                {groupTasks.map(task => (
                  <div key={task.id} onClick={() => setSelectedTask(task)} className="flex items-center px-4 py-3 hover:bg-green-50/20 cursor-pointer border-l-4 border-transparent hover:border-green-500 transition-all">
                    <CheckCircle2 size={18} className={task.status === 'DONE' ? 'text-green-500' : 'text-gray-300'} />
                    <span className={`ml-3 text-sm font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderBoardView = () => (
    <div className="flex gap-6 overflow-x-auto pb-10 items-start min-h-full scrollbar-thin scrollbar-thumb-gray-200">
      {statusOrder.map(status => {
        const groupTasks = filteredTasks.filter(t => t.status === status);
        const config = statusConfig[status];
        if (!config || (isBacklogView && status !== 'BACKLOG')) return null;

        return (
          <div key={status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropStatus(e, status)} className="flex-shrink-0 w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 py-1 group/col">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-4 rounded-full ${config.color}`} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600 truncate max-w-[150px]">{config.label}</h3>
                <span className="text-[10px] font-bold text-gray-400">{groupTasks.length}</span>
              </div>
              <button onClick={() => handleQuickCreate(status)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><Plus size={14} /></button>
            </div>
            <div className="flex flex-col gap-3 min-h-[500px]">
              {groupTasks.map(task => (
                <div key={task.id} draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={() => setSelectedTask(task)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-green-400 cursor-grab active:cursor-grabbing group space-y-3 transition-all">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${PRIORITY_CONFIG[task.priority].color}`}>{PRIORITY_CONFIG[task.priority].label}</span>
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                     <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10}/> {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                     <img src={mockUsers.find(u => u.id === task.assigneeId)?.avatar} className="w-6 h-6 rounded-full" alt="avatar" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
            
            return (
              <div 
                key={idx} 
                onDragOver={(e) => day && e.preventDefault()}
                onDrop={(e) => day && onDropCalendar(e, dateStr)}
                className={`min-h-[140px] border-r border-b border-gray-50 p-2 transition-colors ${day ? 'hover:bg-gray-50/30' : 'bg-gray-50/20'} ${draggedTaskId && day ? 'bg-green-50/30' : ''}`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black ${new Date().toISOString().split('T')[0] === dateStr ? 'bg-green-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                        {day}
                      </span>
                      <button onClick={() => handleQuickCreate('TODO', dateStr)} className="opacity-0 hover:opacity-100 p-1 text-gray-300 hover:text-green-600"><Plus size={12}/></button>
                    </div>
                    <div className="space-y-1">
                      {dayTasks.map(task => (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className={`px-2 py-1.5 rounded-lg border shadow-sm cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${statusConfig[task.status]?.color || 'bg-white'} border-black/5`}
                        >
                          <p className={`text-[10px] font-bold truncate leading-tight ${statusConfig[task.status]?.textColor || 'text-gray-700'}`}>
                            {task.title}
                          </p>
                        </div>
                      ))}
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

  const toggleGroup = (status: string) => {
    setExpandedGroups(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 flex-shrink-0">
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs w-64 outline-none focus:ring-2 focus:ring-green-500/20" placeholder="Buscar tarefas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
