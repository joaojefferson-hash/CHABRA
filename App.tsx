
import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Tasks } from './pages/Tasks.tsx';
import { Users } from './pages/Users.tsx';
import { Templates } from './pages/Templates.tsx';
import { Login } from './pages/Login.tsx';
import { mockTasks as initialTasks, mockProjects as initialProjects } from './store.ts';
import { Task, Project } from './types.ts';
import { STATUS_CONFIG as initialStatusConfig } from './constants.tsx';

// Componente para proteger rotas privadas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  const [statusConfig, setStatusConfig] = useState(initialStatusConfig);
  const [statusOrder, setStatusOrder] = useState<string[]>(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE']);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: 'Nova Tarefa',
      description: '',
      status: 'TODO',
      priority: 'NORMAL',
      assigneeId: 'u1',
      creatorId: 'u1',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId || (projects.length > 0 ? projects[0].id : 'p1'),
      tags: [],
      subtasks: [],
      attachments: []
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleAddColumn = (name: string, color: string) => {
    const id = name.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now();
    setStatusConfig(prev => ({
      ...prev,
      [id]: { label: name, color: color, textColor: 'text-white' }
    }));
    setStatusOrder(prev => [...prev, id]);
  };

  const handleDeleteColumn = (id: string) => {
    if (confirm("Deseja excluir esta coluna? As tarefas serão movidas para o Backlog.")) {
      setTasks(prev => prev.map(t => t.status === id ? { ...t, status: 'BACKLOG' } : t));
      setStatusOrder(prev => prev.filter(s => s !== id));
      const newConfig = { ...statusConfig };
      delete newConfig[id];
      setStatusConfig(newConfig);
    }
  };

  const handleAddProject = () => {
    const name = prompt("Nome do novo Espaço:");
    if (name) {
      const newProject: Project = {
        id: `p-${Date.now()}`,
        name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Deseja realmente excluir este Espaço?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const newName = prompt("Novo nome do Espaço:", project.name);
    if (newName) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    }
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        projects={projects} 
        activeProjectId={activeProjectId} 
        onSelectProject={setActiveProjectId}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
        onEditProject={handleEditProject}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          title={activeProject ? activeProject.name : "Todos os Espaços"} 
          onNewTask={handleCreateTask} 
        />
        <main className="flex-1 overflow-auto bg-[#F9F9F9]">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} />} />
            <Route path="/tasks" element={
              <Tasks 
                tasks={activeProjectId ? tasks.filter(t => t.projectId === activeProjectId) : tasks} 
                allTasks={tasks}
                onUpdateTasks={setTasks} 
                statusConfig={statusConfig} 
                statusOrder={statusOrder}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            } />
            <Route path="/users" element={<Users />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
