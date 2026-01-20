
import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings, 
  Bell, 
  Calendar, 
  Kanban, 
  List, 
  PieChart, 
  Copy,
  Inbox,
  Folder,
  Layers
} from 'lucide-react';

export const CHABRA_COLORS = {
  primary: '#00a651', // Verde Chabra
  secondary: '#e30613', // Vermelho Chabra
  accent: '#2563eb',
  background: '#f9fafb',
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} />, path: '/' },
  { id: 'backlog', label: 'Backlog', icon: <Inbox size={18} />, path: '/tasks?view=backlog' },
  { id: 'tasks', label: 'Espaços', icon: <Layers size={18} />, path: '/tasks' },
  { id: 'users', label: 'Equipe', icon: <Users size={18} />, path: '/users' },
  { id: 'templates', label: 'Modelos', icon: <Copy size={18} />, path: '/templates' },
];

export const TASK_VIEWS = [
  { id: 'list', label: 'Lista', icon: <List size={16} /> },
  { id: 'board', label: 'Quadro', icon: <Kanban size={16} /> },
  { id: 'calendar', label: 'Calendário', icon: <Calendar size={16} /> },
];

export const STATUS_CONFIG: Record<string, { label: string, color: string, textColor: string }> = {
  BACKLOG: { label: 'Backlog', color: 'bg-gray-200', textColor: 'text-gray-600' },
  TODO: { label: 'A Fazer', color: 'bg-blue-500', textColor: 'text-white' },
  IN_PROGRESS: { label: 'Em Execução', color: 'bg-yellow-500', textColor: 'text-white' },
  REVIEW: { label: 'Em Revisão', color: 'bg-purple-500', textColor: 'text-white' },
  BLOCKED: { label: 'Bloqueado', color: 'bg-red-600', textColor: 'text-white' },
  DONE: { label: 'Concluído', color: 'bg-green-500', textColor: 'text-white' },
};

export const PRIORITY_CONFIG: Record<string, { label: string, color: string, iconColor: string }> = {
  URGENT: { label: 'Urgente', color: 'bg-red-50 text-red-600', iconColor: 'text-red-500' },
  HIGH: { label: 'Alta', color: 'bg-orange-50 text-orange-600', iconColor: 'text-orange-500' },
  NORMAL: { label: 'Normal', color: 'bg-blue-50 text-blue-600', iconColor: 'text-blue-500' },
  LOW: { label: 'Baixa', color: 'bg-gray-50 text-gray-600', iconColor: 'text-gray-400' },
};
