
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Users } from './pages/Users';
import { Templates } from './pages/Templates';

// Wrapper component to provide the correct page title
const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');

  useEffect(() => {
    switch(location.pathname) {
      case '/tasks': setTitle('Minhas Tarefas'); break;
      case '/users': setTitle('Gestão de Equipe'); break;
      case '/templates': setTitle('Modelos de Processos'); break;
      case '/settings': setTitle('Configurações'); break;
      default: setTitle('Painel Geral'); break;
    }
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/users" element={<Users />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<div className="p-10 text-gray-500">Configurações do Sistema em desenvolvimento.</div>} />
        </Routes>
      </PageLayout>
    </Router>
  );
};

export default App;
