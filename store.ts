
import { Task, User, Project, Workspace, Notification } from './types';

export const mockWorkspaces: Workspace[] = [
  { id: 'w1', name: 'CHABRA Engenharia', slug: 'chabra-eng' },
  { id: 'w2', name: 'Consultoria Saúde', slug: 'saude-cons' }
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin Chabra',
    email: 'admin@chabra.com.br',
    avatar: 'https://picsum.photos/seed/admin/100',
    role: 'ADMINISTRADOR',
    status: 'ACTIVE',
    permissions: []
  },
  {
    id: 'u2',
    name: 'João Silva',
    email: 'joao@chabra.com.br',
    avatar: 'https://picsum.photos/seed/joao/100',
    role: 'GERENTE',
    status: 'ACTIVE',
    permissions: []
  }
];

export const mockProjects: Project[] = [
  { id: 'p1', workspaceId: 'w1', name: 'Segurança NR-10', color: '#e30613' },
  { id: 'p2', workspaceId: 'w1', name: 'Treinamentos', color: '#00a651' },
  { id: 'p3', workspaceId: 'w2', name: 'Exames 2024', color: '#2563eb' }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    workspaceId: 'w1',
    projectId: 'p1',
    title: 'Revisão Prontuário Elétrico',
    description: 'Analisar documentação técnica da planta A.',
    status: 'TODO',
    priority: 'HIGH',
    assigneeId: 'u2',
    creatorId: 'u1',
    dueDate: '2024-06-20',
    createdAt: '2024-05-15',
    updatedAt: '2024-05-15',
    tags: ['ELÉTRICA'],
    subtasks: [],
    attachments: [],
    comments: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Boas-vindas',
    message: 'Bem-vindo ao novo ambiente CHABRA Gestão.',
    type: 'SUCCESS',
    read: false,
    timestamp: new Date().toISOString()
  }
];

// Definition and export of mockTemplates as required by the Templates page
export interface TaskTemplate {
  id: string;
  name: string;
  defaultDescription: string;
  defaultSubtasks: string[];
}

export const mockTemplates: TaskTemplate[] = [
  {
    id: 'temp-1',
    name: 'Relatório Mensal de Segurança',
    defaultDescription: 'Template para vistorias de rotina em instalações industriais.',
    defaultSubtasks: ['Inspecionar painéis elétricos', 'Verificar sinalização de emergência', 'Checar validade dos extintores']
  },
  {
    id: 'temp-2',
    name: 'Processo de Onboarding',
    defaultDescription: 'Checklist para integração de novos técnicos na equipe.',
    defaultSubtasks: ['Apresentar normas internas', 'Entregar EPIs e uniformes', 'Configurar acesso aos sistemas']
  }
];
