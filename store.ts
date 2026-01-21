
import { Task, User, Project, Workspace, Notification } from './types';

export const mockWorkspaces: Workspace[] = [
  { id: 'w1', name: 'CHABRA Engenharia', slug: 'chabra-eng' },
  { id: 'w2', name: 'Consultoria Saúde', slug: 'saude-cons' }
];

export const mockUsers: (User & { password?: string })[] = [
  {
    id: 'u1',
    name: 'Admin Chabra',
    email: 'admin@chabra.com.br',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    role: 'ADMINISTRADOR',
    status: 'ACTIVE',
    permissions: [],
    password: 'chabra2024'
  },
  {
    id: 'u2',
    name: 'João Jefferson',
    email: 'joao.jefferson@chabra.com.br',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    role: 'ADMINISTRADOR',
    status: 'ACTIVE',
    permissions: [],
    password: 'chabra2024'
  },
  {
    id: 'u3',
    name: 'Isabela Esteves',
    email: 'isabela.esteves@chabra.com.br',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: 'ANALISTA',
    status: 'ACTIVE',
    permissions: [],
    password: 'chabra2024'
  },
  {
    id: 'u4',
    name: 'Keven Vital',
    email: 'keven.vital@chabra.com.br',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    role: 'ANALISTA',
    status: 'ACTIVE',
    permissions: [],
    password: 'chabra2024'
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
  },
  {
    id: 'task-backlog-1',
    workspaceId: 'w1',
    projectId: 'p1',
    title: 'Triagem de Documentos Home Office',
    description: 'Organizar documentos pendentes enviados por e-mail.',
    status: 'BACKLOG',
    priority: 'NORMAL',
    assigneeId: 'u3',
    creatorId: 'u1',
    dueDate: '2024-12-31',
    createdAt: '2024-05-18',
    updatedAt: '2024-05-18',
    tags: ['HOME OFFICE'],
    subtasks: [],
    attachments: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Acesso Remoto Liberado',
    message: 'O portal CHABRA agora está acessível para toda a equipe em home office.',
    type: 'SUCCESS',
    read: false,
    timestamp: new Date().toISOString()
  }
];

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
  }
];
