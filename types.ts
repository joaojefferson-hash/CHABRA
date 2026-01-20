
export type UserRole = 
  | 'ADMINISTRADOR' 
  | 'GERENTE' 
  | 'SUPERVISOR' 
  | 'TECNICO' 
  | 'ANALISTA';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  permissions: string[];
}

export type TaskStatus = string;
export type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  creatorId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  tags: string[];
  projectId: string;
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  observations?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  timestamp: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultSubtasks: string[];
}

// Helper para hierarquia (quanto menor o número, maior o poder)
export const RoleHierarchy: Record<UserRole, number> = {
  'ADMINISTRADOR': 0,
  'GERENTE': 1,
  'SUPERVISOR': 2,
  'TECNICO': 3,
  'ANALISTA': 4
};
