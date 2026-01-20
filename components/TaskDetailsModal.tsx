
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, Circle, Plus, Trash2, Calendar, User, Tag, Flag, MessageSquare, Clock, Paperclip, Upload, FileText, ExternalLink, Check } from 'lucide-react';
import { Task, Subtask, Priority, Attachment } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants';
import { mockUsers } from '../store';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, onClose, onUpdate }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  
  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    
    onUpdate({ ...task, subtasks: [...task.subtasks, newSubtask] });
    setNewSubtaskTitle('');
  };

  const removeSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...task, dueDate: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ ...task, priority: e.target.value as Priority });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...task, description: e.target.value });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      attachments: [...(task.attachments || []), newAttachment] 
    });
  };

  const handleAddTag = () => {
    const trimmedTag = newTagLabel.trim();
    if (trimmedTag && !task.tags.includes(trimmedTag)) {
      onUpdate({ ...task, tags: [...task.tags, trimmedTag] });
    }
    setNewTagLabel('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({ ...task, tags: task.tags.filter(tag => tag !== tagToRemove) });
  };

  const assignee = mockUsers.find(u => u.id === task.assigneeId);
  const completedCount = task.subtasks.filter(st => st.isCompleted).length;
  const progress = task.subtasks.length > 0 ? (completedCount / task.subtasks.length) * 100 : 0;
  
  const displayTaskId = task.id.includes('-') ? task.id.split('-')[1] : task.id;

  const formattedCreatedAt = new Date(task.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[task.status].color} text-white shadow-sm shadow-black/10`}>
              {STATUS_CONFIG[task.status].label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium">#{displayTaskId}</span>
              <span className="text-gray-200">|</span>
              <span className="text-xs text-gray-500 font-medium">{task.projectId === 'p1' ? 'Segurança do Trabalho' : 'Medicina Ocupacional'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-[2.5] p-8 lg:p-10 border-r border-gray-100">
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="space-y-1 flex-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{task.title}</h2>
              </div>
              <Link 
                to="/tasks" 
                onClick={onClose}
                className="flex-shrink-0 flex items-center gap-2 text-xs font-bold text-green-700 hover:text-white transition-all bg-green-50 hover:bg-green-600 px-4 py-2.5 rounded-xl border border-green-100 uppercase tracking-wider shadow-sm"
              >
                <ExternalLink size={14} />
                Ir para Tarefas
              </Link>
            </div>
            
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14} />
                Descrição
              </h3>
              <textarea 
                value={task.description}
                onChange={handleDescriptionChange}
                placeholder="Adicione uma descrição detalhada para esta tarefa..."
                className="w-full text-gray-700 leading-relaxed bg-gray-50/50 p-5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all min-h-[160px] resize-none text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Subtasks Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Subtarefas ({completedCount}/{task.subtasks.length})
                </h3>
                <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-green-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {task.subtasks.map(st => (
                  <div key={st.id} className="group flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-default">
                    <button 
                      onClick={() => toggleSubtask(st.id)}
                      className={`transition-all transform hover:scale-110 ${st.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      {st.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <span className={`flex-1 text-sm transition-all ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 font-semibold'}`}>
                      {st.title}
                    </span>
                    <button 
                      onClick={() => removeSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={addSubtask} className="relative group">
                <input 
                  type="text" 
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Adicionar nova subtarefa e pressionar Enter..."
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all placeholder:text-gray-400 shadow-sm"
                />
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
              </form>
            </div>

            {/* Attachments Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Paperclip size={14} />
                  Anexos {task.attachments && task.attachments.length > 0 ? `(${task.attachments.length})` : ''}
                </h3>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <button 
                  onClick={handleUploadClick}
                  className="flex items-center gap-2 text-[10px] font-bold text-green-700 hover:text-white bg-green-50 hover:bg-green-600 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider border border-green-100 shadow-sm"
                >
                  <Upload size={14} />
                  Fazer Upload
                </button>
              </div>
              
              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {task.attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-400 hover:shadow-lg hover:shadow-green-500/5 transition-all group cursor-pointer shadow-sm relative overflow-hidden">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all flex-shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">{att.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-2">
                          {att.size} 
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          {new Date(att.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                        <ExternalLink size={16} className="text-gray-400 hover:text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={handleUploadClick}
                  className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50/30 hover:border-green-200 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm group-hover:text-green-500 group-hover:scale-110 transition-all">
                    <Paperclip size={32} />
                  </div>
                  <p className="text-sm text-gray-700 font-bold group-hover:text-green-700 transition-colors">Nenhum anexo ainda</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Arraste seus arquivos para cá ou clique para fazer upload.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="flex-1 bg-gray-50/50 p-8 lg:p-10 space-y-10">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Informações</h3>
              <div className="space-y-6">
                {/* Assignee */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-gray-400 shadow-sm overflow-hidden">
                    {assignee?.avatar ? (
                      <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Responsável</p>
                    <p className="text-sm font-bold text-gray-900">{assignee?.name || 'Não atribuído'}</p>
                  </div>
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-blue-500 shadow-sm">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prazo de Entrega</p>
                    <input 
                      type="date"
                      value={task.dueDate}
                      onChange={handleDateChange}
                      className="text-sm font-bold text-gray-900 bg-transparent border-none focus:ring-0 rounded-lg px-0 cursor-pointer hover:text-green-600 transition-colors w-full outline-none"
                    />
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-purple-500 shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Data de Criação</p>
                    <p className="text-sm font-bold text-gray-900">{formattedCreatedAt}</p>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                    <Flag size={20} className={PRIORITY_CONFIG[task.priority].iconColor} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Prioridade</p>
                    <select
                      value={task.priority}
                      onChange={handlePriorityChange}
                      className={`text-sm font-black bg-transparent border-none focus:ring-0 rounded-lg px-0 cursor-pointer hover:underline transition-all w-full outline-none appearance-none ${PRIORITY_CONFIG[task.priority].iconColor}`}
                    >
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key} className="text-gray-900 font-bold">
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags Management */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-gray-100 text-orange-500 shadow-sm">
                    <Tag size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Marcadores</p>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {task.tags.map(tag => (
                        <div 
                          key={tag} 
                          className="group/tag flex items-center gap-1 text-[10px] bg-white text-gray-700 px-2 py-1 rounded-lg border border-gray-100 font-bold uppercase tracking-tight shadow-sm hover:border-red-200 hover:text-red-600 transition-all cursor-default"
                        >
                          <span>{tag}</span>
                          <button 
                            onClick={() => removeTag(tag)}
                            className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      
                      {isAddingTag ? (
                        <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                          <input 
                            ref={tagInputRef}
                            autoFocus
                            type="text"
                            value={newTagLabel}
                            onChange={(e) => setNewTagLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            onBlur={() => !newTagLabel && setIsAddingTag(false)}
                            placeholder="Tag..."
                            className="text-[10px] w-16 bg-white border border-green-300 px-2 py-1 rounded-lg outline-none font-bold uppercase"
                          />
                          <button 
                            onClick={handleAddTag}
                            className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                          >
                            <Check size={10} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsAddingTag(true)}
                          className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded-lg border border-dashed border-gray-200 font-bold uppercase hover:bg-gray-200 hover:text-gray-600 transition-all flex items-center gap-1"
                        >
                          <Plus size={10} /> Tag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 transform">
                <MessageSquare size={18} className="text-green-600" />
                <span>3 Comentários</span>
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 font-medium italic">
                Última alteração em {new Date(task.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
