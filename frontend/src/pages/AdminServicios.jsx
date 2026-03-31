import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracion_minutos: 60 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getServicios().then(setServicios).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createServicio(form);
      setShowForm(false);
      setForm({ nombre: '', descripcion: '', duracion_minutos: 60 });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return;
    try {
      await api.deleteServicio(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Servicios</h2>
          <p>Gestiona los servicios o espacios disponibles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nuevo servicio</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Nuevo servicio</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre del servicio</label>
                  <input className="form-input" placeholder="Ej: Consulta General" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-input" rows={2} placeholder="Descripción breve..." value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (minutos)</label>
                  <input className="form-input" type="number" min={15} max={480} step={15} value={form.duracion_minutos} onChange={e => setForm(f => ({ ...f, duracion_minutos: parseInt(e.target.value) }))} style={{ maxWidth: 120 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Descripción</th><th>Duración</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {servicios.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.descripcion || '—'}</td>
                    <td>{s.duracion_minutos} min</td>
                    <td><span className={`badge badge-${s.activo ? 'success' : 'neutral'}`}>{s.activo ? 'activo' : 'inactivo'}</span></td>
                    <td>
                      {s.activo && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Desactivar</button>
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
