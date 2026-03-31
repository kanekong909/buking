import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getUsuarios().then(setUsuarios).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActivo = async (u) => {
    try {
      await api.updateUsuario(u.id, { nombre: u.nombre, rol: u.rol, activo: !u.activo });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRol = async (u) => {
    const nuevoRol = u.rol === 'cliente' ? 'administrador' : 'cliente';
    if (!confirm(`¿Cambiar rol de ${u.nombre} a ${nuevoRol}?`)) return;
    try {
      await api.updateUsuario(u.id, { nombre: u.nombre, rol: nuevoRol, activo: u.activo });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
        <p>Gestión de usuarios registrados en el sistema</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ minWidth: 140 }}>
          <div className="stat-label">Total</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{usuarios.length}</div>
        </div>
        <div className="stat-card" style={{ minWidth: 140 }}>
          <div className="stat-label">Clientes</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{usuarios.filter(u => u.rol === 'cliente').length}</div>
        </div>
        <div className="stat-card" style={{ minWidth: 140 }}>
          <div className="stat-label">Admins</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{usuarios.filter(u => u.rol === 'administrador').length}</div>
        </div>
        <div className="stat-card" style={{ minWidth: 140 }}>
          <div className="stat-label">Activos</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{usuarios.filter(u => u.activo).length}</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                          {u.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.rol === 'administrador' ? 'warning' : 'neutral'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${u.activo ? 'success' : 'danger'}`}>
                        {u.activo ? 'activo' : 'inactivo'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {u.created_at ? format(new Date(u.created_at), 'd MMM yyyy', { locale: es }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleRol(u)}>
                          {u.rol === 'cliente' ? 'Hacer admin' : 'Hacer cliente'}
                        </button>
                        <button className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleActivo(u)}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
