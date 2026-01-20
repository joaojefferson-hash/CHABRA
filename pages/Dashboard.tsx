
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, CheckCircle, Clock, AlertTriangle, List as ListIcon, 
  User, Layers, Calendar, ChevronDown, Filter as FilterIcon 
} from 'lucide-react';
import { CHABRA_COLORS } from '../constants';
import { Task, Project } from '../types';
import { mockProjects } from '../store';

interface DashboardProps {
  tasks: Task[];
}

type DateFilter = 'today' | '7days' | '30days' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Lógica de Filtragem
  const filteredTasks = useMemo(() => {
    let result = viewMode === 'all' ? tasks : tasks.filter(t => t.assigneeId === 'u1');

    // Filtro de Projeto
    if (projectFilter !== 'all') {
      result = result.filter(t => t.projectId === projectFilter);
    }

    // Filtro de Data
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      result = result.filter(t => {
        const taskDate = new Date(t.createdAt).getTime();
        if (dateFilter === 'today') return taskDate >= today;
        if (dateFilter === '7days') return taskDate >= today - (7 * 24 * 60 * 60 * 1000);
        if (dateFilter === '30days') return taskDate >= today - (30 * 24 * 60 * 60 * 1000);
        return true;
      });
    }

    return result;
  }, [tasks, viewMode, dateFilter, projectFilter]);

  // Estatísticas baseadas no filtro
  const backlogCount = filteredTasks.filter(t => t.status === 'BACKLOG').length;
  const activeCount = filteredTasks.filter(t => ['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED'].includes(t.status)).length;
  const completedCount = filteredTasks.filter(t => t.status === 'DONE').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const lateCount = filteredTasks.filter(t => t.status !== 'DONE' && t.dueDate < todayStr).length;

  const stats = [
    { label: 'Backlog', value: backlogCount.toString(), icon: <ListIcon className="text-gray-600" />, trend: 'Pendentes', color: 'bg-gray-50' },
    { label: 'Tarefas Ativas', value: activeCount.toString(), icon: <Clock className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Concluídas', value: completedCount.toString(), icon: <CheckCircle className="text-green-600" />, trend: '+5%', color: 'bg-green-50' },
    { label: 'Em Atraso', value: lateCount.toString(), icon: <AlertTriangle className="text-red-600" />, trend: '-2%', color: 'bg-red-50' },
    { label: 'Produtividade', value: filteredTasks.length > 0 ? `${Math.round((completedCount / filteredTasks.length) * 100)}%` : '0%', icon: <TrendingUp className="text-purple-600" />, trend: 'CHABRA', color: 'bg-purple-50' },
  ];

  const pieData = [
    { name: 'Backlog', value: backlogCount, color: '#9ca3af' },
    { name: 'Ativas', value: activeCount, color: '#3b82f6' },
    { name: 'Concluído', value: completedCount, color: '#22c55e' },
  ].filter(d => d.value > 0);

  // Fallback para pizza vazia
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'Sem Dados', value: 1, color: '#f3f4f6' }];

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho de Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers size={14} /> Global
            </button>
            <button 
              onClick={() => setViewMode('mine')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mine' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={14} /> Meu Trabalho
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer hover:text-green-600"
            >
              <option value="all">Todo o período</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <FilterIcon size={14} className="text-gray-400" />
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">Todos os Espaços</option>
              {mockProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${stat.color}`}>{stat.icon}</div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</h4>
              <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Carga de Trabalho (Subtarefas)</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Amostra Recente</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTasks.slice(-10).map((t, i) => ({ name: t.title.substring(0, 10), val: t.subtasks.length }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="val" stroke={CHABRA_COLORS.primary} fill={CHABRA_COLORS.primary} fillOpacity={0.1} strokeWidth={3} dot={{ r: 4, fill: CHABRA_COLORS.primary }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">Distribuição de Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie 
                    data={finalPieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {finalPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 space-y-2">
               {finalPieData.map((entry, i) => (
                 <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-500">{entry.name}</span>
                    </div>
                    <span className="text-gray-900">{entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
