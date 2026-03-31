import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getReservas()
      .then(setReservas)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtradas = reservas.filter(r => {
    if (filter === 'todas') return true;
    return r.estado === filter;
  });

  const handleCancelar = async (id) => {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    setCancelingId(id);
    setError('');
    try {
      await api.cancelarReserva(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  const estadoBadge = (estado) => {
    const map = { activa: 'success', cancelada: 'danger', completada: 'neutral' };
    return <span className={`badge badge-${map[estado] || 'neutral'}`}>{estado}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Mis Reservas</h2>
        <p>Historial y gestión de todas tus reservas</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['todas', 'activa', 'cancelada', 'completada'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
      ) : filtradas.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>No hay reservas en esta categoría</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{r.id}</td>
                    <td style={{ fontWeight: 500 }}>{r.servicio_nombre}</td>
                    <td>
                      {format(new Date(r.fecha + 'T00:00:00'), "d MMM yyyy", { locale: es })}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {r.hora_inicio?.slice(0,5)} – {r.hora_fin?.slice(0,5)}
                    </td>
                    <td>{estadoBadge(r.estado)}</td>
                    <td>
                      {r.estado === 'activa' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelar(r.id)}
                          disabled={cancelingId === r.id}
                        >
                          {cancelingId === r.id ? '...' : 'Cancelar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
