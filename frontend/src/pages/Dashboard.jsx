import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getReservas(), api.getNotificaciones()])
      .then(([r, n]) => { setReservas(Array.isArray(r) ? r : []); setNotifs(Array.isArray(n) ? n : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activas = reservas.filter(r => r.estado === 'activa');
  const proximas = activas
    .filter(r => new Date(r.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 3);
  const noLeidas = notifs.filter(n => !n.leida).length;

  if (loading) return (
    <div style={{ padding: 40 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Hola, {user?.nombre?.split(' ')[0]} 👋</h2>
        <p>Aquí tienes un resumen de tu actividad</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Reservas activas</div>
          <div className="stat-value">{activas.length}</div>
          <div className="stat-sub">en este momento</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Próximas reservas</div>
          <div className="stat-value">{proximas.length}</div>
          <div className="stat-sub">en los próximos días</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Notificaciones</div>
          <div className="stat-value">{noLeidas}</div>
          <div className="stat-sub">sin leer</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total reservas</div>
          <div className="stat-value">{reservas.length}</div>
          <div className="stat-sub">historial completo</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Próximas citas</h3>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/reservar')}>+ Nueva reserva</button>
          </div>
          <div className="card-body">
            {proximas.length === 0 ? (
              <div className="empty-state">
                <p>No tienes reservas próximas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {proximas.map(r => (
                  <div key={r.id} className="reserva-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="fecha">
                          {format(new Date(String(r.fecha).slice(0, 10) + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                        </div>
                        <div className="hora">{r.hora_inicio?.slice(0, 5)} – {r.hora_fin?.slice(0, 5)}</div>
                        <div className="servicio">{r.servicio_nombre}</div>
                      </div>
                      <span className="badge badge-success">activa</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Notificaciones recientes</h3>
          </div>
          <div className="card-body">
            {notifs.length === 0 ? (
              <div className="empty-state"><p>Sin notificaciones</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notifs.slice(0, 5).map(n => (
                  <div key={n.id} style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: n.leida ? 'transparent' : 'var(--accent-light)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                  }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                      <span className={`badge badge-${n.tipo === 'confirmacion' ? 'success' : n.tipo === 'cancelacion' ? 'danger' : 'warning'}`}>
                        {n.tipo}
                      </span>
                      {!n.leida && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
                    </div>
                    <p style={{ color: 'var(--text-primary)', marginTop: 4 }}>{n.mensaje}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
