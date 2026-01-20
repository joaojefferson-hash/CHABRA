
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, List as ListIcon, User, Layers } from 'lucide-react';
import { CHABRA_COLORS } from '../constants';
import { Task } from '../types';

interface DashboardProps {
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');

  const currentTasks = viewMode === 'all' 
    ? tasks 
    : tasks.filter(t => t.assigneeId === 'u1');

  const backlogCount = currentTasks.filter(t => t.status === 'BACKLOG').length;
  const activeCount = currentTasks.filter(t => ['TODO', 'IN_PROGRESS', 'REVIEW'].includes(t.status)).length;
  const completedCount = currentTasks.filter(t => t.status === 'DONE').length;
  
  const today = new Date().toISOString().split('T')[0];
  const lateCount = currentTasks.filter(t => t.status !== 'DONE' && t.dueDate < today).length;

  const stats = [
    { label: 'Backlog', value: backlogCount.toString(), icon: <ListIcon className="text-gray-600" />, trend: 'Pendentes', color: 'bg-gray-50' },
    { label: 'Tarefas Ativas', value: activeCount.toString(), icon: <Clock className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50' },
    { label: 'Concluídas', value: completedCount.toString(), icon: <CheckCircle className="text-green-600" />, trend: '+5%', color: 'bg-green-50' },
    { label: 'Em Atraso', value: lateCount.toString(), icon: <AlertTriangle className="text-red-600" />, trend: '-2%', color: 'bg-red-50' },
    { label: 'Produtividade', value: '94%', icon: <TrendingUp className="text-purple-600" />, trend: '+3%', color: 'bg-purple-50' },
  ];

  const pieData = [
    { name: 'Backlog', value: Math.max(1, (backlogCount / (tasks.length || 1)) * 100), color: '#9ca3af' },
    { name: 'Em Aberto', value: Math.max(1, (activeCount / (tasks.length || 1)) * 100), color: '#3b82f6' },
    { name: 'Concluído', value: Math.max(1, (completedCount / (tasks.length || 1)) * 100), color: '#22c55e' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex p-1 bg-gray-200/50 rounded-xl">
          <button 
            onClick={() => setViewMode('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'all' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers size={16} /> Todos os Projetos
          </button>
          <button 
            onClick={() => setViewMode('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'mine' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User size={16} /> Minhas Tarefas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-green-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
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
          <h3 className="font-bold text-gray-800 mb-6">Volume de Tarefas Ativas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tasks.slice(-7).map((t, i) => ({ name: `T${i}`, val: t.subtasks.length }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke={CHABRA_COLORS.primary} fill={CHABRA_COLORS.primary} fillOpacity={0.1} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Status Geral</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
