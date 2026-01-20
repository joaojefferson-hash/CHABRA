
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, List as ListIcon, User, Layers } from 'lucide-react';
import { CHABRA_COLORS } from '../constants';
import { mockTasks } from '../store';

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');

  // Filter tasks based on selected view mode (u1 is the logged-in Admin)
  const currentTasks = viewMode === 'all' 
    ? mockTasks 
    : mockTasks.filter(t => t.assigneeId === 'u1');

  // Dynamic calculations based on current filter
  const backlogCount = currentTasks.filter(t => t.status === 'BACKLOG').length;
  const activeCount = currentTasks.filter(t => ['TODO', 'IN_PROGRESS', 'REVIEW'].includes(t.status)).length;
  const completedCount = currentTasks.filter(t => t.status === 'DONE').length;
  
  // Logic for late tasks (simple string comparison for YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const lateCount = currentTasks.filter(t => t.status !== 'DONE' && t.dueDate < today).length;

  const stats = [
    { label: 'Backlog', value: backlogCount.toString(), icon: <ListIcon className="text-gray-600" />, trend: 'Pendentes', color: 'bg-gray-50' },
    { label: 'Tarefas Ativas', value: activeCount.toString(), icon: <Clock className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Concluídas', value: completedCount.toString(), icon: <CheckCircle className="text-green-600" />, trend: '+5%', color: 'bg-green-50' },
    { label: 'Em Atraso', value: lateCount.toString(), icon: <AlertTriangle className="text-red-600" />, trend: '-2%', color: 'bg-red-50' },
    { label: 'Produtividade', value: '94%', icon: <TrendingUp className="text-purple-600" />, trend: '+3%', color: 'bg-purple-50' },
  ];

  const barData = [
    { name: 'Seg', tasks: 12 },
    { name: 'Ter', tasks: 19 },
    { name: 'Qua', tasks: 15 },
    { name: 'Qui', tasks: 22 },
    { name: 'Sex', tasks: 18 },
    { name: 'Sáb', tasks: 5 },
    { name: 'Dom', tasks: 2 },
  ];

  const pieData = [
    { name: 'Backlog', value: 30, color: '#9ca3af' },
    { name: 'A Fazer', value: 20, color: '#3b82f6' },
    { name: 'Em Execução', value: 25, color: '#eab308' },
    { name: 'Em Revisão', value: 10, color: '#a855f7' },
    { name: 'Concluído', value: 15, color: '#22c55e' },
  ];

  const productivityData = [
    { month: 'Jan', val: 400 },
    { month: 'Fev', val: 300 },
    { month: 'Mar', val: 600 },
    { month: 'Abr', val: 800 },
    { month: 'Mai', val: 700 },
    { month: 'Jun', val: 900 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* View Toggle Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex p-1 bg-gray-200/50 rounded-xl">
          <button 
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'all' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={16} />
            Todos os Projetos
          </button>
          <button 
            onClick={() => setViewMode('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'mine' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} />
            Minhas Tarefas
          </button>
        </div>
        
        <div className="text-xs text-gray-400 font-medium italic">
          Visualizando {viewMode === 'all' ? 'todos os dados da organização' : 'apenas suas atribuições'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.trend.startsWith('+') || stat.trend === 'Pendentes' || stat.trend === 'Novo' ? 'text-green-600' : 'text-red-600'}`}>
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
        {/* Main Productivity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Tarefas Concluídas por Dia</h3>
            <select className="text-sm border border-gray-200 rounded-lg p-1 outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="tasks" fill={CHABRA_COLORS.primary} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Distribuição de Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Métrica de Produção (Histórico)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHABRA_COLORS.primary} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={CHABRA_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke={CHABRA_COLORS.primary} fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-6">Atividades Recentes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex-shrink-0 flex items-center justify-center border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">JS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    João Silva <span className="text-gray-500 font-normal">concluiu a tarefa</span> Implementação NR-10
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Há 2 horas • Segurança do Trabalho</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
