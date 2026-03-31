import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import NuevaReserva from './pages/NuevaReserva';
import MisReservas from './pages/MisReservas';
import AdminDashboard from './pages/AdminDashboard';
import AdminReservas from './pages/AdminReservas';
import AdminDisponibilidad from './pages/AdminDisponibilidad';
import AdminServicios from './pages/AdminServicios';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminReportes from './pages/AdminReportes';

function ProtectedLayout({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );

  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && user?.rol !== 'administrador') return <Navigate to="/dashboard" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const isAdmin = user?.rol === 'administrador';

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <AuthPage />} />

      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/reservar" element={<ProtectedLayout><NuevaReserva /></ProtectedLayout>} />
      <Route path="/mis-reservas" element={<ProtectedLayout><MisReservas /></ProtectedLayout>} />

      <Route path="/admin" element={<ProtectedLayout requireAdmin><AdminDashboard /></ProtectedLayout>} />
      <Route path="/admin/reservas" element={<ProtectedLayout requireAdmin><AdminReservas /></ProtectedLayout>} />
      <Route path="/admin/disponibilidad" element={<ProtectedLayout requireAdmin><AdminDisponibilidad /></ProtectedLayout>} />
      <Route path="/admin/servicios" element={<ProtectedLayout requireAdmin><AdminServicios /></ProtectedLayout>} />
      <Route path="/admin/usuarios" element={<ProtectedLayout requireAdmin><AdminUsuarios /></ProtectedLayout>} />
      <Route path="/admin/reportes" element={<ProtectedLayout requireAdmin><AdminReportes /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}