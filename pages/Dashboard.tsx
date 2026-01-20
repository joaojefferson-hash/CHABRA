
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
  statusConfig: Record<string, { label: string, color: string, textColor: string }>;
}

type DateFilter = 'today' | '7days' | '30days' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ tasks, statusConfig }) => {
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    // 1. Filter by ownership
    let result = viewMode === 'all' ? tasks : tasks.filter(t => t.assigneeId === 'u1');

    // 2. Filter by project
    if (projectFilter !== 'all') {
      result = result.filter(t => t.projectId === projectFilter);
    }

    // 3. Filter by date range
    const now = new Date();
    // Start of today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (dateFilter !== 'all') {
      result = result.filter(t => {
        // We use createdAt to define when the task entered the workflow for dashboard stats
        const taskDate = new Date(t.createdAt).getTime();
        
        if (dateFilter === 'today') {
          return taskDate >= todayStart;
        }
        if (dateFilter === '7days') {
          const sevenDaysAgo = todayStart - (7 * oneDayMs);
          return taskDate >= sevenDaysAgo;
        }
        if (dateFilter === '30days') {
          const thirtyDaysAgo = todayStart - (30 * oneDayMs);
          return taskDate >= thirtyDaysAgo;
        }
        return true;
      });
    }

    return result;
  }, [tasks, viewMode, dateFilter, projectFilter]);

  const stats = useMemo(() => {
    const backlogCount = filteredTasks.filter(t => t.status === 'BACKLOG').length;
    const activeCount = filteredTasks.filter(t => !['BACKLOG', 'DONE'].includes(t.status)).length;
    const completedCount = filteredTasks.filter(t => t.status === 'DONE').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    // Late tasks are those not done and past due date
    const lateCount = filteredTasks.filter(t => t.status !== 'DONE' && t.dueDate < todayStr).length;

    const efficiency = filteredTasks.length > 0 
      ? Math.round((completedCount / filteredTasks.length) * 100) 
      : 0;

    return [
      { label: 'Backlog', value: backlogCount, icon: <ListIcon size={20} className="text-gray-500" />, color: 'bg-gray-100' },
      { label: 'Em Andamento', value: activeCount, icon: <Clock size={20} className="text-blue-600" />, color: 'bg-blue-50' },
      { label: 'Concluídas', value: completedCount, icon: <CheckCircle size={20} className="text-green-600" />, color: 'bg-green-50' },
      { label: 'Atrasadas', value: lateCount, icon: <AlertTriangle size={20} className="text-red-600" />, color: 'bg-red-50' },
      { 
        label: 'Eficiência', 
        value: `${efficiency}%`, 
        icon: <TrendingUp size={20} className="text-purple-600" />, 
        color: 'bg-purple-50' 
      },
    ];
  }, [filteredTasks]);

  const pieData = useMemo(() => {
    if (filteredTasks.length === 0) {
      return [{ name: 'Sem Dados', value: 1, color: '#f3f4f6' }];
    }

    const counts: Record<string, number> = {};
    filteredTasks.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => {
      const config = statusConfig[status];
      let hexColor = '#cbd5e1'; 
      if (config) {
        if (config.color.includes('blue')) hexColor = '#3b82f6';
        else if (config.color.includes('green')) hexColor = '#22c55e';
        else if (config.color.includes('yellow')) hexColor = '#eab308';
        else if (config.color.includes('red')) hexColor = '#ef4444';
        else if (config.color.includes('purple')) hexColor = '#a855f7';
        else if (config.color.includes('orange')) hexColor = '#f97316';
        else if (config.color.includes('pink')) hexColor = '#ec4899';
        else if (config.color.includes('teal')) hexColor = '#14b8a6';
        else if (config.color.includes('gray')) hexColor = '#94a3b8';
      }

      return {
        name: config?.label || status,
        value: count,
        color: hexColor
      };
    });
  }, [filteredTasks, statusConfig]);

  const chartData = useMemo(() => {
    // Show evolution of task creation/progress over the period
    const sorted = [...filteredTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted.map((t) => ({
      name: t.title.length > 15 ? t.title.substring(0, 12) + '...' : t.title,
      progresso: (t.subtasks?.filter(st => st.isCompleted).length || 0) + (t.status === 'DONE' ? 5 : 0),
    }));
  }, [filteredTasks]);

  const getDateLabel = () => {
    switch(dateFilter) {
      case 'today': return 'Hoje';
      case '7days': return 'Últimos 7 dias';
      case '30days': return 'Últimos 30 dias';
      default: return 'Todo o Período';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
            <FilterIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Análise de Performance</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Intervalo: {getDateLabel()}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
              Meus Itens
            </button>
          </div>

          <div className="relative group">
            <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-600 transition-colors pointer-events-none" />
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-700 outline-none cursor-pointer hover:bg-white hover:border-green-200 transition-all appearance-none min-w-[170px] shadow-sm"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="all">Todo o Período</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>

          <div className="relative group">
            <Target size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-green-600 transition-colors pointer-events-none" />
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-700 outline-none cursor-pointer hover:bg-white hover:border-green-200 transition-all appearance-none min-w-[200px] shadow-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Evolução de Atividade</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase">Ref: {getDateLabel()}</span>
          </div>
          <div className="flex-1 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHABRA_COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHABRA_COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: '800' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="progresso" 
                    name="Engajamento" 
                    stroke={CHABRA_COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorProg)" 
                    strokeWidth={4} 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-50 rounded-3xl">
                <CalendarIcon size={48} className="opacity-10" />
                <p className="text-xs font-black uppercase tracking-widest opacity-40 text-center px-10">Nenhum registro para este período</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">Distribuição por Status</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={8} 
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-8 space-y-3">
               {pieData[0].name !== 'Sem Dados' ? pieData.map((entry, i) => (
                 <div key={i} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{entry.name}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">{entry.value}</span>
                 </div>
               )) : (
                 <div className="text-center py-4">
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sem dados para o filtro</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
