
import { Task, User, Project, TaskTemplate, Notification } from './types';

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
  },
  {
    id: 'u3',
    name: 'Maria Oliveira',
    email: 'maria@chabra.com.br',
    avatar: 'https://picsum.photos/seed/maria/100',
    role: 'SUPERVISOR',
    status: 'ACTIVE',
    permissions: []
  },
  {
    id: 'u4',
    name: 'Carlos Santos',
    email: 'carlos.tecnico@chabra.com.br',
    avatar: 'https://picsum.photos/seed/carlos/100',
    role: 'TECNICO',
    status: 'ACTIVE',
    permissions: []
  },
  {
    id: 'u5',
    name: 'Ana Costa',
    email: 'ana.analista@chabra.com.br',
    avatar: 'https://picsum.photos/seed/ana/100',
    role: 'ANALISTA',
    status: 'ACTIVE',
    permissions: []
  }
];

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Segurança do Trabalho', color: '#e30613' },
  { id: 'p2', name: 'Medicina Ocupacional', color: '#00a651' },
  { id: 'p3', name: 'Gestão Interna', color: '#2563eb' }
];

export const mockTemplates: TaskTemplate[] = [
  {
    id: 't1',
    name: 'Exame Periódico',
    defaultTitle: 'Realizar Exame Periódico: [Nome]',
    defaultDescription: 'Checklist padrão para exames periódicos de colaboradores.',
    defaultSubtasks: ['Agendar data', 'Confirmar presença', 'Realizar coleta', 'Emitir ASO']
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implementação de Novos Protocolos NR',
    description: 'Atualizar os manuais internos conforme novas normativas.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeId: 'u2',
    creatorId: 'u1',
    dueDate: '2024-06-15',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-10',
    projectId: 'p1',
    tags: ['Normativas', 'Compliance'],
    subtasks: [
      { id: 's1', title: 'Ler PDF da NR-10', isCompleted: true },
      { id: 's2', title: 'Redigir rascunho', isCompleted: false }
    ],
    attachments: []
  },
  {
    id: 'task-2',
    title: 'Análise de Backlog - Treinamentos',
    description: 'Revisar lista de pendências de treinamentos técnicos.',
    status: 'BACKLOG',
    priority: 'NORMAL',
    assigneeId: 'u3',
    creatorId: 'u1',
    dueDate: '2024-07-20',
    createdAt: '2024-05-05',
    updatedAt: '2024-05-05',
    projectId: 'p1',
    tags: ['Treinamento'],
    subtasks: [],
    attachments: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Nova Tarefa Atribuída',
    message: 'Você foi designado para "Implementação de Novos Protocolos NR"',
    type: 'INFO',
    read: false,
    timestamp: new Date().toISOString()
  }
];
