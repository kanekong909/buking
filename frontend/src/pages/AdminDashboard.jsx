import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDashboard() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getReservas(), api.getUsuarios(), api.getReportes({})])
      .then(([r, u, rep]) => { setReservas(r); setUsuarios(u); setReportes(rep); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activas = reservas.filter(r => r.estado === 'activa').length;
  const hoy = format(new Date(), 'yyyy-MM-dd');
  const hoyCount = reservas.filter(r => r.fecha === hoy && r.estado === 'activa').length;
  const clientes = usuarios.filter(u => u.rol === 'cliente').length;

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h2>Panel de Administración</h2>
        <p>Resumen general del sistema de reservas</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Reservas activas</div>
          <div className="stat-value">{activas}</div>
          <div className="stat-sub">en total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reservas hoy</div>
          <div className="stat-value">{hoyCount}</div>
          <div className="stat-sub">{format(new Date(), "d 'de' MMMM", { locale: es })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total clientes</div>
          <div className="stat-value">{clientes}</div>
          <div className="stat-sub">usuarios registrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total reservas</div>
          <div className="stat-value">{reservas.length}</div>
          <div className="stat-sub">historial completo</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Últimas reservas */}
        <div className="card">
          <div className="card-header"><h3>Últimas reservas</h3></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.slice(0, 6).map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 500 }}>{r.usuario_nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{r.usuario_email}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{r.servicio_nombre}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.fecha ? format(new Date(r.fecha + 'T00:00:00'), 'd MMM', { locale: es }) : ''}</td>
                    <td>
                      <span className={`badge badge-${r.estado === 'activa' ? 'success' : r.estado === 'cancelada' ? 'danger' : 'neutral'}`}>
                        {r.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reporte por servicio */}
        <div className="card">
          <div className="card-header"><h3>Reservas por servicio</h3></div>
          <div className="card-body">
            {reportes.length === 0 ? (
              <div className="empty-state"><p>Sin datos de reportes</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reportes.map((rep, i) => {
                  const pct = reportes[0]?.total > 0 ? (rep.total / reportes[0].total) * 100 : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500 }}>{rep.servicio}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{rep.total} total</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--success)' }}>✓ {rep.activas} activas</span>
                        <span style={{ color: 'var(--danger)' }}>✗ {rep.canceladas} canceladas</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
