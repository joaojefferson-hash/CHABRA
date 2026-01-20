
import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Templates } from './pages/Templates';
import { mockTasks as initialTasks, mockProjects as initialProjects } from './store';
import { Task, Project } from './types';
import { STATUS_CONFIG as initialStatusConfig } from './constants';

const App: React.FC = () => {
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
      status: statusOrder[1] || 'TODO', // Padrão para a segunda coluna (geralmente TODO)
      priority: 'NORMAL',
      assigneeId: 'u1',
      creatorId: 'u1',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: activeProjectId || projects[0]?.id || 'default',
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
    if (confirm("Deseja excluir esta coluna? As tarefas nela serão movidas para o Backlog.")) {
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
    if (confirm("Deseja realmente excluir este Espaço e todas as suas tarefas?")) {
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

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          projects={projects} 
          activeProjectId={activeProjectId} 
          onSelectProject={setActiveProjectId}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          onEditProject={handleEditProject}
        />
        <div className="flex-1 flex flex-col">
          <TopBar 
            title={activeProject ? activeProject.name : "Todos os Espaços"} 
            onNewTask={handleCreateTask} 
          />
          <main className="flex-1 overflow-x-hidden">
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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
