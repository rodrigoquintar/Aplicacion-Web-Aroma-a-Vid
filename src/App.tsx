
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Clients from './pages/Clients';
import POS from './pages/POS';
import Finances from './pages/Finances';
import Calendar from './pages/Calendar';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Today from './pages/Today';
import Login from './pages/Login';
import { AppProvider, useApp } from './context/AppContext';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useApp();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-0 md:ml-72 p-4 md:p-10 overflow-x-hidden">
        {/* Espaciador para móvil para que el contenido no quede bajo el botón de la hojita */}
        <div className="h-16 md:hidden"></div>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
      <Route path="/today" element={<AuthenticatedLayout><Today /></AuthenticatedLayout>} />
      <Route path="/rooms" element={<AuthenticatedLayout><Rooms /></AuthenticatedLayout>} />
      <Route path="/bookings" element={<AuthenticatedLayout><Bookings /></AuthenticatedLayout>} />
      <Route path="/clients" element={<AuthenticatedLayout><Clients /></AuthenticatedLayout>} />
      <Route path="/pos" element={<AuthenticatedLayout><POS /></AuthenticatedLayout>} />
      <Route path="/finances" element={<AuthenticatedLayout><Finances /></AuthenticatedLayout>} />
      <Route path="/calendar" element={<AuthenticatedLayout><Calendar /></AuthenticatedLayout>} />
      <Route path="/stock" element={<AuthenticatedLayout><Stock /></AuthenticatedLayout>} />
      <Route path="/reports" element={<AuthenticatedLayout><Reports /></AuthenticatedLayout>} />
      <Route path="/settings" element={<AuthenticatedLayout><Settings /></AuthenticatedLayout>} />
      <Route path="*" element={<Navigate to="/today" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
