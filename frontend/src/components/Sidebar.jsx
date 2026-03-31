import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconCalendar = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconHome = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconList = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const clientLinks = [
    { path: '/dashboard', label: 'Inicio', icon: <IconHome /> },
    { path: '/reservar', label: 'Nueva Reserva', icon: <IconCalendar /> },
    { path: '/mis-reservas', label: 'Mis Reservas', icon: <IconList /> },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: <IconHome /> },
    { path: '/admin/reservas', label: 'Todas las Reservas', icon: <IconList /> },
    { path: '/admin/disponibilidad', label: 'Disponibilidad', icon: <IconCalendar /> },
    { path: '/admin/servicios', label: 'Servicios', icon: <IconSettings /> },
    { path: '/admin/usuarios', label: 'Usuarios', icon: <IconUsers /> },
    { path: '/admin/reportes', label: 'Reportes', icon: <IconBarChart /> },
  ];

  const links = user?.rol === 'administrador' ? adminLinks : clientLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Reservas</h1>
        <span>{user?.rol === 'administrador' ? 'Panel Admin' : 'Portal Cliente'}</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Menú</div>
          {links.map(link => (
            <button
              key={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <strong>{user?.nombre}</strong>
          <span>{user?.rol}</span>
        </div>
        <button className="logout-btn" onClick={logout} title="Cerrar sesión">
          <IconLogout />
        </button>
      </div>
    </aside>
  );
}
