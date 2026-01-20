
export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  permissions: string[];
}

export type TaskStatus = string; // Mudado para string para permitir colunas dinâmicas
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
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  timestamp: string;
}

// Fixed: Added TaskTemplate interface as it was missing and causing an import error in store.ts
export interface TaskTemplate {
  id: string;
  name: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultSubtasks: string[];
}
