
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, CheckCircle, Clock, AlertTriangle, List as ListIcon, 
  ChevronDown, Filter as FilterIcon, Calendar as CalendarIcon, 
  Target
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

  // Lógica de Filtragem Consolidada
  const filteredTasks = useMemo(() => {
    let result = viewMode === 'all' ? tasks : tasks.filter(t => t.assigneeId === 'u1');

    // Filtro de Projeto
    if (projectFilter !== 'all') {
      result = result.filter(t => t.projectId === projectFilter);
    }

    // Filtro de Data
    if (dateFilter !== 'all') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      result = result.filter(t => {
        const taskDate = new Date(t.createdAt).getTime();
        if (dateFilter === 'today') return taskDate >= todayStart;
        if (dateFilter === '7days') return taskDate >= todayStart - (7 * 24 * 60 * 60 * 1000);
        if (dateFilter === '30days') return taskDate >= todayStart - (30 * 24 * 60 * 60 * 1000);
        return true;
      });
    }

    return result;
  }, [tasks, viewMode, dateFilter, projectFilter]);

  // Cálculos de Estatísticas baseados nos filtros
  const backlogCount = filteredTasks.filter(t => t.status === 'BACKLOG').length;
  const activeCount = filteredTasks.filter(t => !['BACKLOG', 'DONE'].includes(t.status)).length;
  const completedCount = filteredTasks.filter(t => t.status === 'DONE').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const lateCount = filteredTasks.filter(t => t.status !== 'DONE' && t.dueDate < todayStr).length;

  const stats = [
    { label: 'Backlog', value: backlogCount, icon: <ListIcon size={20} className="text-gray-500" />, color: 'bg-gray-100' },
    { label: 'Em Andamento', value: activeCount, icon: <Clock size={20} className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Concluídas', value: completedCount, icon: <CheckCircle size={20} className="text-green-600" />, color: 'bg-green-50' },
    { label: 'Atrasadas', value: lateCount, icon: <AlertTriangle size={20} className="text-red-600" />, color: 'bg-red-50' },
    { 
      label: 'Eficiência', 
      value: filteredTasks.length > 0 ? `${Math.round((completedCount / filteredTasks.length) * 100)}%` : '0%', 
      icon: <TrendingUp size={20} className="text-purple-600" />, 
      color: 'bg-purple-50' 
    },
  ];

  const pieData = [
    { name: 'Backlog', value: backlogCount, color: '#9ca3af' },
    { name: 'Em Aberto', value: activeCount, color: '#3b82f6' },
    { name: 'Finalizado', value: completedCount, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'Sem Dados', value: 1, color: '#f3f4f6' }];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Barra de Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <FilterIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Filtros de Visão</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Personalize os dados exibidos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Global/Meu */}
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl mr-2">
            <button 
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                viewMode === 'all' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Geral
            </button>
            <button 
              onClick={() => setViewMode('mine')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                viewMode === 'mine' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pessoal
            </button>
          </div>

          {/* Seletor de Data */}
          <div className="relative group">
            <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-600 transition-colors pointer-events-none" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-700 outline-none cursor-pointer hover:bg-white hover:border-green-200 transition-all appearance-none min-w-[160px]"
            >
              <option value="all">Todo o Período</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>

          {/* Seletor de Projeto */}
          <div className="relative group">
            <Target size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-600 transition-colors pointer-events-none" />
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-700 outline-none cursor-pointer hover:bg-white hover:border-green-200 transition-all appearance-none min-w-[200px]"
            >
              <option value="all">Todos os Espaços</option>
              {mockProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-300 transition-all group hover:shadow-lg hover:shadow-green-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${stat.color}`}>{stat.icon}</div>
              <div className="w-8 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-2/3" />
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h4>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Produtividade de Tarefas</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Volume de Entrega</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTasks.slice(-10).map((t, idx) => ({ name: `T${idx+1}`, val: t.subtasks.length + 1 }))}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHABRA_COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHABRA_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '800' }}
                  cursor={{ stroke: CHABRA_COLORS.primary, strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="val" stroke={CHABRA_COLORS.primary} fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Distribuição de Status</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie 
                    data={finalPieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={10} 
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {finalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-8 space-y-4">
               {finalPieData.map((entry, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-900 transition-colors">{entry.name}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900">{entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
