import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format, subDays } from 'date-fns';

export default function AdminReportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getReportes({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
      setReportes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const total = reportes.reduce((s, r) => s + parseInt(r.total), 0);
  const totalActivas = reportes.reduce((s, r) => s + parseInt(r.activas), 0);
  const totalCanceladas = reportes.reduce((s, r) => s + parseInt(r.canceladas), 0);

  return (
    <div>
      <div className="page-header">
        <h2>Reportes</h2>
        <p>Análisis de reservas por período y servicio</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fecha inicio</label>
              <input className="form-input" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fecha fin</label>
              <input className="form-input" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={load} disabled={loading}>
              {loading ? '...' : 'Generar reporte'}
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total reservas</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Activas</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{totalActivas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Canceladas</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{totalCanceladas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tasa cancelación</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {total > 0 ? Math.round((totalCanceladas / total) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Detalle por servicio</h3></div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : reportes.length === 0 ? (
          <div className="card-body"><div className="empty-state"><p>Sin datos para el período seleccionado</p></div></div>
        ) : (
          <>
            <div className="card-body" style={{ paddingBottom: 0 }}>
              {reportes.map((r, i) => {
                const pct = total > 0 ? (r.total / total) * 100 : 0;
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.servicio}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.total} reservas ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 4 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--success)' }}>✓ {r.activas} activas</span>
                      <span style={{ color: 'var(--danger)' }}>✗ {r.canceladas} canceladas</span>
                      <span style={{ color: 'var(--text-muted)' }}>● {r.completadas} completadas</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Servicio</th><th>Total</th><th>Activas</th><th>Canceladas</th><th>Completadas</th></tr></thead>
                <tbody>
                  {reportes.map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{r.servicio}</td>
                      <td>{r.total}</td>
                      <td><span className="badge badge-success">{r.activas}</span></td>
                      <td><span className="badge badge-danger">{r.canceladas}</span></td>
                      <td><span className="badge badge-neutral">{r.completadas}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
