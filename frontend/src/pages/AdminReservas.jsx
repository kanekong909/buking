import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getReservas().then(setReservas).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtradas = reservas.filter(r => filter === 'todas' || r.estado === filter);

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    setCancelingId(id);
    try {
      await api.cancelarReserva(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Todas las Reservas</h2>
        <p>Gestión completa de reservas del sistema</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['todas', 'activa', 'cancelada', 'completada'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {f === 'todas' ? `(${reservas.length})` : `(${reservas.filter(r => r.estado === f).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{r.usuario_nombre}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.usuario_email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{r.servicio_nombre}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {r.fecha ? format(new Date(r.fecha + 'T00:00:00'), "d MMM yyyy", { locale: es }) : '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {r.hora_inicio?.slice(0,5)} – {r.hora_fin?.slice(0,5)}
                    </td>
                    <td>
                      <span className={`badge badge-${r.estado === 'activa' ? 'success' : r.estado === 'cancelada' ? 'danger' : 'neutral'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td>
                      {r.estado === 'activa' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(r.id)} disabled={cancelingId === r.id}>
                          {cancelingId === r.id ? '...' : 'Cancelar'}
                        </button>
                      )}
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
