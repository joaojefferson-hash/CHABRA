
import React from 'react';
import { mockTemplates } from '../store';
import { Copy, Plus, MoreVertical, FileText, CheckSquare } from 'lucide-react';

export const Templates: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Modelos de Tarefas</h2>
          <p className="text-sm text-gray-500">Padronize seus processos internos com modelos prontos.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={18} />
          <span>Criar Modelo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-green-400 transition-all group">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={18} />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.defaultDescription}</p>
              
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estrutura de Subtarefas</p>
                {template.defaultSubtasks.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckSquare size={14} className="text-green-500" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-green-600 hover:text-white text-gray-700 rounded-lg text-sm font-semibold transition-all">
                <Copy size={16} />
                <span>Usar este modelo</span>
              </button>
            </div>
          </div>
        ))}

        <button className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-300 group transition-all">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
            <Plus size={24} className="text-gray-400 group-hover:text-green-600" />
          </div>
          <span className="text-sm font-semibold text-gray-500 group-hover:text-green-700">Novo Modelo em Branco</span>
        </button>
      </div>
    </div>
  );
};
