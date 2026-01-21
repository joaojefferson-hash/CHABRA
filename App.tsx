
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
import { mockTasks, mockProjects, mockWorkspaces } from './store.ts';
import { Task, Project } from './types.ts';
import { STATUS_CONFIG as initialStatusConfig } from './constants.tsx';
import { Loader2 } from 'lucide-react';
import { TaskDetailsModal } from './components/TaskDetailsModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, can, isLoading: authLoading } = useAuth();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('w1');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusConfig, setStatusConfig] = useState(initialStatusConfig);
  const [statusOrder, setStatusOrder] = useState<string[]>(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE']);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const savedTasks = localStorage.getItem(`tasks_${activeWorkspaceId}`);
      const savedProjs = localStorage.getItem(`projs_${activeWorkspaceId}`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : mockTasks.filter(t => t.workspaceId === activeWorkspaceId));
      setProjects(savedProjs ? JSON.parse(savedProjs) : mockProjects.filter(p => p.workspaceId === activeWorkspaceId));
      setIsLoaded(true);
    }
  }, [isAuthenticated, activeWorkspaceId]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`tasks_${activeWorkspaceId}`, JSON.stringify(tasks));
      localStorage.setItem(`projs_${activeWorkspaceId}`, JSON.stringify(projects));
    }
  }, [tasks, projects, isLoaded, activeWorkspaceId]);

  const filteredTasks = useMemo(() => {
    return activeProjectId ? tasks.filter(t => t.projectId === activeProjectId) : tasks;
  }, [tasks, activeProjectId]);

  if (authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">CHABRA GESTÃO</span>
    </div>
  );

  if (!isAuthenticated) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={setActiveWorkspaceId}
        onSelectProject={setActiveProjectId}
        onAddProject={() => {}}
        onDeleteProject={() => {}}
        onEditProject={() => {}}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          title={projects.find(p => p.id === activeProjectId)?.name || "Visão Geral"} 
          onNewTask={() => {}} 
          tasks={filteredTasks}
        />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} statusConfig={statusConfig} />} />
            <Route path="/tasks" element={
              <Tasks 
                tasks={filteredTasks}
                allTasks={tasks}
                onUpdateTasks={setTasks}
                statusConfig={statusConfig}
                statusOrder={statusOrder}
                onAddColumn={() => {}}
                onDeleteColumn={() => {}}
              />
            } />
            <Route path="/users" element={<Users />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      {editingTask && (
        <TaskDetailsModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          onUpdate={(t) => setTasks(prev => prev.map(old => old.id === t.id ? t : old))} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
