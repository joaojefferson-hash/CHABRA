
import React, { useState, useRef, useMemo } from 'react';
import { X, CheckCircle2, Circle, Plus, Trash2, Calendar, User, Tag, Flag, MessageSquare, Clock, Paperclip, Upload, FileText, ExternalLink, Check, Lock } from 'lucide-react';
import { Task, Subtask, Priority, Attachment } from '../types.ts';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants.tsx';
import { mockUsers } from '../store.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onUpdate }) => {
  const { user, can } = useAuth();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lógica de Permissão de Edição Consolidada
  const canEdit = useMemo(() => {
    if (!user) return false;
    // Administradores, Gerentes e Supervisores podem editar tudo (via can EDIT_OTHERS_TASKS definido no AuthContext)
    if (can('EDIT_OTHERS_TASKS')) return true;
    // Criador e Assignee podem sempre editar suas próprias tarefas
    return task.creatorId === user.id || task.assigneeId === user.id;
  }, [task, user, can]);
  
  const toggleSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdate({ ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() });
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    
    onUpdate({ ...task, subtasks: [...task.subtasks, newSubtask], updatedAt: new Date().toISOString() });
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subtaskId: string) => {
    if (!canEdit) return;
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    onUpdate({ ...task, subtasks: updatedSubtasks, updatedAt: new Date().toISOString() });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    onUpdate({ ...task, dueDate: e.target.value, updatedAt: new Date().toISOString() });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return;
    onUpdate({ ...task, priority: e.target.value as Priority, updatedAt: new Date().toISOString() });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!canEdit) return;
    onUpdate({ ...task, description: e.target.value, updatedAt: new Date().toISOString() });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEdit) return;

    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      name: file.name,
      url: '#',
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      createdAt: new Date().toISOString()
    };

    onUpdate({ 
      ...task, 
      attachments: [...(task.attachments || []), newAttachment],
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddTag = () => {
    if (!canEdit) return;
    const trimmedTag = newTagLabel.trim();
    if (trimmedTag && !task.tags.includes(trimmedTag)) {
      onUpdate({ ...task, tags: [...task.tags, trimmedTag], updatedAt: new Date().toISOString() });
    }
    setNewTagLabel('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    if (!canEdit) return;
    onUpdate({ ...task, tags: task.tags.filter(tag => tag !== tagToRemove), updatedAt: new Date().toISOString() });
  };

  const assignee = mockUsers.find(u => u.id === task.assigneeId);
  const completedCount = task.subtasks.filter(st => st.isCompleted).length;
  const progress = task.subtasks.length > 0 ? (completedCount / task.subtasks.length) * 100 : 0;
  
  const displayTaskId = task.id.includes('-') ? task.id.split('-')[1] : task.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {!canEdit && (
          <div className="bg-orange-50 border-b border-orange-100 px-8 py-2 flex items-center justify-center gap-2">
            <Lock size={12} className="text-orange-500" />
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Modo de Visualização (Sem permissão para editar)</span>
          </div>
        )}

        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[task.status]?.color || 'bg-gray-400'} text-white shadow-sm shadow-black/10`}>
              {STATUS_CONFIG[task.status]?.label || task.status}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium">#{displayTaskId}</span>
              <span className="text-gray-200">|</span>
              <span className="text-xs text-gray-500 font-medium">
                {task.projectId === 'p1' ? 'Segurança do Trabalho' : 'Medicina Ocupacional'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          <div className="flex-[2.5] p-8 lg:p-10 border-r border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{task.title}</h2>
            </div>
            
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14} /> Descrição
              </h3>
              <textarea 
                readOnly={!canEdit}
                value={task.description}
                onChange={handleDescriptionChange}
                placeholder={canEdit ? "Adicione uma descrição detalhada..." : "Sem descrição disponível."}
                className={`w-full text-gray-700 leading-relaxed bg-gray-50/50 p-5 rounded-2xl border transition-all min-h-[160px] resize-none text-sm placeholder:text-gray-400 ${canEdit ? 'border-gray-100 focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50' : 'border-transparent cursor-default'}`}
              />
            </div>

            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> Subtarefas ({completedCount}/{task.subtasks.length})
                </h3>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {task.subtasks.map(st => (
                  <div key={st.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all">
                    <button 
                      onClick={() => toggleSubtask(st.id)}
                      disabled={!canEdit}
                      className={`transition-all ${canEdit ? 'hover:scale-110' : 'cursor-default'} ${st.isCompleted ? 'text-green-500' : 'text-gray-300'}`}
                    >
                      {st.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <span className={`flex-1 text-sm ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 font-semibold'}`}>
                      {st.title}
                    </span>
                    {canEdit && (
                      <button onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canEdit && (
                <form onSubmit={addSubtask} className="relative group">
                  <input 
                    type="text" 
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Adicionar nova subtarefa..."
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all"
                  />
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </form>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Paperclip size={14} /> Anexos
                </h3>
                {canEdit && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                  >
                    Fazer Upload
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(task.attachments || []).map(att => (
                  <div key={att.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl group cursor-pointer shadow-sm relative overflow-hidden">
                    <FileText size={24} className="text-gray-400 group-hover:text-green-600" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-900 truncate">{att.name}</p>
                      <p className="text-[10px] text-gray-400">{att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-50/50 p-8 lg:p-10 space-y-10">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Informações</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                    {assignee?.avatar ? <img src={assignee.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Responsável</p>
                    <p className="text-sm font-bold text-gray-900">{assignee?.name || 'Não atribuído'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-blue-500 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prazo de Entrega</p>
                    <input 
                      readOnly={!canEdit}
                      type="date"
                      value={task.dueDate}
                      onChange={handleDateChange}
                      className={`text-sm font-bold text-gray-900 bg-transparent border-none w-full outline-none ${canEdit ? 'cursor-pointer hover:text-green-600' : 'cursor-default'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                    <Flag size={20} className={PRIORITY_CONFIG[task.priority]?.iconColor || 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prioridade</p>
                    <select
                      disabled={!canEdit}
                      value={task.priority}
                      onChange={handlePriorityChange}
                      className={`text-sm font-black bg-transparent border-none w-full outline-none appearance-none ${PRIORITY_CONFIG[task.priority]?.iconColor || 'text-gray-400'} ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key} className="text-gray-900 font-bold">{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-orange-500 shadow-sm">
                    <Tag size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Marcadores</p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 text-[10px] bg-white text-gray-700 px-2 py-1 rounded-lg border border-gray-100 font-bold uppercase tracking-tight shadow-sm">
                          <span>{tag}</span>
                          {canEdit && <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500"><X size={10} /></button>}
                        </div>
                      ))}
                      {canEdit && (
                        <button onClick={() => setIsAddingTag(true)} className="text-[10px] text-gray-400 px-2 py-1 rounded-lg border border-dashed border-gray-200 font-bold hover:bg-gray-100 transition-all">
                          + Tag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                <MessageSquare size={18} className="text-green-600" />
                <span>Conversar sobre a tarefa</span>
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 font-medium italic">
                Sincronizado com a base de dados CHABRA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
