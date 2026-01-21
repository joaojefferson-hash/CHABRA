# CHABRA Gestão - Arquitetura SaaS Profissional

## 1. Visão Geral
Sistema de gestão de produtividade multi-tenant inspirado no ClickUp, projetado para alta escalabilidade e performance.

## 2. Stack Tecnológica
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Lucide React, Recharts.
- **Backend (Referência):** NestJS (Node.js), Socket.io (Real-time), BullMQ (Background Jobs).
- **Banco de Dados:** PostgreSQL com Prisma ORM.
- **Cache/Queue:** Redis.
- **Infra:** Docker, AWS/Vercel.

## 3. Estrutura Multi-tenancy
O sistema utiliza isolamento lógico por `workspace_id`. 
- Usuários pertencem a múltiplos Workspaces via tabela associativa `workspace_members`.
- Cada Workspace possui seu próprio conjunto de Projetos, Listas e Tarefas.

## 4. Segurança
- **Auth:** JWT (Access + Refresh Tokens).
- **RBAC (Role Based Access Control):** 
  - `ADMIN`: Controle total do Workspace e faturamento.
  - `GESTOR`: Gestão de projetos, membros e relatórios.
  - `MEMBRO`: Operação de tarefas e comentários.
  - `CONVIDADO`: Acesso limitado a projetos específicos.

## 5. Fluxo de Dados Real-time
Eventos disparados via WebSockets (Socket.io) para:
- `task.updated`: Atualiza Kanban instantaneamente para todos no workspace.
- `comment.new`: Notificação push e atualização da thread.
- `user.typing`: Indicador de presença.
