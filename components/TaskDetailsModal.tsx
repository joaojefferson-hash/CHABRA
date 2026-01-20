
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { X, CheckCircle2, Circle, Plus, Trash2, Calendar, User, Tag, Flag, MessageSquare, Clock, Paperclip, Upload, FileText, ExternalLink, Check, Lock, Send, ChevronDown } from 'lucide-react';
import { Task, Subtask, Priority, Attachment, Comment } from '../types.ts';
import { PRIORITY_CONFIG, STATUS_CONFIG as DEFAULT_STATUS_CONFIG } from '../constants.tsx';
import { mockUsers } from '../store.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Logo } from './Logo';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  statusConfigs?: Record<string, { label: string, color: string, textColor: string }>;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  task, 
  onClose, 
  onUpdate,
  statusConfigs = DEFAULT_STATUS_CONFIG
}) => {
  const { user, can } = useAuth();
  const { addNotification } = useNotifications();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic: triggered when comments length changes
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [task.comments]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    if (can('EDIT_OTHERS_TASKS')) return true;
    const isOwner = task.creatorId === user.id;
    const isAssignee = task.assigneeId === user.id;
    return isOwner || isAssignee;
  }, [task, user, can]);

  const canEditPriority = useMemo(() => {
    return user?.role === 'ADMINISTRADOR';
  }, [user]);
  
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user.id,
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedTask = { 
      ...task, 
      comments: [...(task.comments || []), comment],
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedTask);

    // Notify assignee if someone else comments
    if (task.assigneeId !== user.id) {
      addNotification({
        title: 'Novo Comentário',
        message: `${user.name} comentou na tarefa: "${task.title}"`,
        type: 'INFO'
      });
    }

    setNewComment('');
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
    if (!canEditPriority) return;
    const newPriority = e.target.value as Priority;
    onUpdate({ ...task, priority: newPriority, updatedAt: new Date().toISOString() });
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return;
    onUpdate({ ...task, assigneeId: e.target.value, updatedAt: new Date().toISOString() });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!canEdit) return;
    const newStatus = e.target.value;
    onUpdate({ ...task, status: newStatus, updatedAt: new Date().toISOString() });
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

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
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
  const currentStatus = statusConfigs[task.status] || { label: task.status, color: 'bg-gray-400', textColor: 'text-white' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {!canEdit && (
          <div className="bg-amber-50 border-b border-amber-100 px-8 py-3 flex items-center justify-center gap-3">
            <Lock size={14} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
              Modo de Visualização • Algumas edições estão restritas ao seu cargo
            </span>
          </div>
        )}

        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                disabled={!canEdit}
                value={task.status}
                onChange={handleStatusChange}
                className={`appearance-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${currentStatus.color} ${currentStatus.textColor} shadow-sm shadow-black/10 outline-none border-none transition-all ${canEdit ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default opacity-80'}`}
              >
                {Object.entries(statusConfigs).map(([id, config]) => (
                  <option key={id} value={id} className="bg-white text-gray-900">{config.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium">#{displayTaskId}</span>
              <span className="text-gray-200">|</span>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-tighter">
                {task.projectId === 'p1' ? 'Segurança' : task.projectId === 'p2' ? 'Medicina' : 'Gestão'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-[2.5] p-8 lg:p-10 border-r border-gray-100 overflow-y-auto scrollbar-thin">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{task.title}</h2>
            </div>
            
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText size={14} /> Descrição</span>
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
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all font-bold shadow-sm"
                  />
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </form>
              )}
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <MessageSquare size={14} /> Histórico de Atualizações
              </h3>
              
              <div className="space-y-6 mb-8 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                {task.comments && task.comments.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {task.comments.map((comment) => {
                      const author = mockUsers.find(u => u.id === comment.authorId);
                      const isMe = user?.id === comment.authorId;
                      return (
                        <div key={comment.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <img 
                            src={author?.avatar || `https://picsum.photos/seed/${comment.authorId}/100`} 
                            className="w-8 h-8 rounded-full shadow-sm border border-gray-100 flex-shrink-0"
                            alt={author?.name}
                          />
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-gray-900">{isMe ? 'Você' : author?.name}</span>
                              <span className="text-[9px] font-bold text-gray-400">
                                {new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-sm font-medium leading-relaxed ${
                              isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'
                            }`}>
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={commentsEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                    <MessageSquare size={24} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inicie a discussão técnica</p>
                  </div>
                )}
              </div>

              {canEdit && (
                <form onSubmit={handleAddComment} className="relative group">
                  <div className="flex gap-3">
                    <img src={user?.avatar} className="w-10 h-10 rounded-full shadow-md border-2 border-white flex-shrink-0" alt="me" />
                    <div className="flex-1 relative">
                      <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário ou atualização..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 pr-14 text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all resize-none h-24 font-semibold placeholder:text-gray-400"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute bottom-3 right-3 p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-95 shadow-lg shadow-green-500/20"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="flex-1 bg-gray-50/50 p-8 lg:p-10 space-y-10 overflow-y-auto scrollbar-thin">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                Atributos da Tarefa
                {!canEdit && <Lock size={12} className="text-gray-300" />}
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                    {assignee?.avatar ? <img src={assignee.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Responsável</p>
                    {canEdit ? (
                      <select 
                        value={task.assigneeId}
                        onChange={handleAssigneeChange}
                        className="text-sm font-bold text-gray-900 bg-transparent border-none w-full outline-none cursor-pointer hover:text-green-600 transition-colors"
                      >
                        {mockUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">{assignee?.name || 'Não atribuído'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-blue-500 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prazo Final</p>
                    <input 
                      readOnly={!canEdit}
                      type="date"
                      value={task.dueDate}
                      onChange={handleDateChange}
                      className={`text-sm font-bold text-gray-900 bg-transparent border-none w-full outline-none transition-colors ${canEdit ? 'cursor-pointer hover:text-green-600' : 'cursor-default'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm transition-colors ${PRIORITY_CONFIG[task.priority]?.iconColor}`}>
                    <Flag size={20} />
                  </div>
                  <div className="flex-1 relative group">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prioridade</p>
                       {!canEditPriority && <Lock size={10} className="text-gray-300" />}
                    </div>
                    
                    <div className="relative">
                      <select
                        disabled={!canEditPriority}
                        value={task.priority}
                        onChange={handlePriorityChange}
                        className={`text-sm font-black bg-white/50 border border-transparent rounded-lg px-2 py-1 -ml-2 w-full outline-none appearance-none transition-all ${PRIORITY_CONFIG[task.priority]?.iconColor} 
                          ${canEditPriority ? 'cursor-pointer hover:bg-white hover:border-gray-200 shadow-sm' : 'cursor-default opacity-80'}`}
                      >
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <option key={key} value={key} className="text-gray-900 font-bold bg-white">
                            {config.label}
                          </option>
                        ))}
                      </select>
                      {canEditPriority && (
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                      )}
                    </div>
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
                        <div key={tag} className="flex items-center gap-1 text-[10px] bg-white text-gray-700 px-2 py-1 rounded-lg border border-gray-100 font-bold uppercase shadow-sm">
                          <span>{tag}</span>
                          {canEdit && <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={10} /></button>}
                        </div>
                      ))}
                      {canEdit && !isAddingTag && (
                        <button onClick={() => setIsAddingTag(true)} className="text-[10px] text-gray-400 px-2 py-1 rounded-lg border border-dashed border-gray-200 font-bold hover:bg-white hover:border-green-300 hover:text-green-600 transition-all bg-white/50">
                          + Adicionar
                        </button>
                      )}
                      {isAddingTag && (
                        <form onSubmit={handleAddTag} className="flex items-center gap-1">
                          <input 
                            autoFocus
                            className="text-[10px] px-2 py-1 rounded-lg border border-green-200 outline-none w-24 bg-white font-bold shadow-inner"
                            value={newTagLabel}
                            onChange={(e) => setNewTagLabel(e.target.value)}
                            onBlur={() => setIsAddingTag(false)}
                          />
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Paperclip size={14} /> Arquivos em Anexo
                </h3>
                {canEdit && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    Upload
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
              
              <div className="space-y-3">
                {(task.attachments || []).map(att => (
                  <div key={att.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-green-200 transition-colors cursor-pointer">
                    <FileText size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 truncate">{att.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{att.size}</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                  <div className="text-center py-6 bg-gray-100/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nenhum anexo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 opacity-30 grayscale">
                <Logo size="sm" showText={false} />
                <p className="text-[9px] text-gray-900 font-black uppercase tracking-[0.2em]">
                  CHABRA SYSTEM v1.3.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
