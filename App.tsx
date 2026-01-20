
import React, { useState, useMemo, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sincronizando Dados...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, can } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusConfig, setStatusConfig] = useState(initialStatusConfig);
  const [statusOrder, setStatusOrder] = useState<string[]>(['BACKLOG', 'IN_PROGRESS', 'TODO', 'BLOCKED', 'REVIEW', 'DONE']);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Centralized initial data loading
  useEffect(() => {
    if (isAuthenticated) {
      const loadInitialData = async () => {
        try {
          // Simulation of remote fetch
          const savedTasks = localStorage.getItem('chabra_tasks');
          const savedProjs = localStorage.getItem('chabra_projects');
          const savedConfig = localStorage.getItem('chabra_status_config');
          const savedOrder = localStorage.getItem('chabra_status_order');

          setTasks(savedTasks ? JSON.parse(savedTasks) : initialTasks);
          setProjects(savedProjs ? JSON.parse(savedProjs) : initialProjects);
          if (savedConfig) setStatusConfig(JSON.parse(savedConfig));
          if (savedOrder) setStatusOrder(JSON.parse(savedOrder));
        } finally {
          setDataLoaded(true);
        }
      };
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Atomic state persistence
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('chabra_tasks', JSON.stringify(tasks));
      localStorage.setItem('chabra_projects', JSON.stringify(projects));
      localStorage.setItem('chabra_status_config', JSON.stringify(statusConfig));
      localStorage.setItem('chabra_status_order', JSON.stringify(statusOrder));
    }
  }, [tasks, projects, statusConfig, statusOrder, dataLoaded]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const handleCreateTask = () => {
    if (!can('CREATE_TASK')) return alert("Sem permissão para criar tarefas.");
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
    setStatusOrder(prev => {
      const newOrder = [...prev];
      const doneIndex = newOrder.indexOf('DONE');
      newOrder.splice(doneIndex !== -1 ? doneIndex : newOrder.length, 0, id);
      return newOrder;
    });
  };

  const handleDeleteColumn = (id: string) => {
    const protectedStatuses = ['BACKLOG', 'DONE', 'TODO'];
    if (protectedStatuses.includes(id)) return alert("Status essenciais não podem ser removidos.");
    if (confirm("Excluir coluna? Tarefas serão movidas para o Backlog.")) {
      setTasks(prev => prev.map(t => t.status === id ? { ...t, status: 'BACKLOG' } : t));
      setStatusOrder(prev => prev.filter(s => s !== id));
      const newConfig = { ...statusConfig };
      delete newConfig[id];
      setStatusConfig(newConfig);
    }
  };

  const handleAddProject = () => {
    if (!can('CREATE_PROJECT')) return alert("Sem permissão para criar espaços.");
    const name = prompt("Nome do novo Espaço:");
    if (name) {
      const observations = prompt("Observações/Notas deste Espaço (opcional):") || "";
      const newProject: Project = {
        id: `p-${Date.now()}`,
        name,
        observations,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      };
      setProjects(prev => [...prev, newProject]);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!can('DELETE_PROJECT')) return alert("Sem permissão para excluir espaços.");
    if (confirm("ATENÇÃO: Isso excluirá o espaço e TODAS as tarefas vinculadas. Confirmar?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !can('CREATE_PROJECT')) return;
    const newName = prompt("Editar nome:", project.name);
    if (newName) {
      const newObs = prompt("Editar observações:", project.observations || "");
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName, observations: newObs || "" } : p));
    }
  };

  const filteredTasks = useMemo(() => {
    return activeProjectId ? tasks.filter(t => t.projectId === activeProjectId) : tasks;
  }, [tasks, activeProjectId]);

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
          tasks={filteredTasks}
        />
        <main className="flex-1 overflow-auto bg-[#F9F9F9]">
          {!dataLoaded ? (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estabelecendo Conexão...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard tasks={tasks} statusConfig={statusConfig} />} />
              <Route path="/tasks" element={
                <Tasks 
                  tasks={filteredTasks} 
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
          )}
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
