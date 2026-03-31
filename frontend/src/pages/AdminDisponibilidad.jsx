import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminDisponibilidad() {
  const [slots, setSlots] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ servicio_id: '', fecha: '', hora_inicio: '', hora_fin: '', cupos_totales: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  const load = () => {
    setLoading(true);
    Promise.all([api.getDisponibilidad({}), api.getServicios()])
      .then(([d, s]) => { setSlots(d); setServicios(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createDisponibilidad(form);
      setSuccess('Horario creado correctamente');
      setShowForm(false);
      setForm({ servicio_id: '', fecha: '', hora_inicio: '', hora_fin: '', cupos_totales: 1 });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este horario?')) return;
    try {
      await api.deleteDisponibilidad(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Normalizar fecha (Postgres puede devolver '2026-04-01T00:00:00.000Z')
  const normalizeSlots = slots.map(s => ({
    ...s,
    fecha: (s.fecha || '').toString().slice(0, 10)
  }));

  // Agrupar por fecha
  const porFecha = normalizeSlots.reduce((acc, s) => {
    if (!s.fecha) return acc;
    if (!acc[s.fecha]) acc[s.fecha] = [];
    acc[s.fecha].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Disponibilidad</h2>
          <p>Configura los horarios disponibles por servicio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Agregar horario</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Nuevo horario disponible</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Servicio</label>
                  <select className="form-select" value={form.servicio_id} onChange={e => setForm(f => ({ ...f, servicio_id: e.target.value }))} required>
                    <option value="">Selecciona un servicio...</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input className="form-input" type="date" min={today} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Hora inicio</label>
                    <input className="form-input" type="time" value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora fin</label>
                    <input className="form-input" type="time" value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cupos disponibles</label>
                  <input className="form-input" type="number" min={1} max={50} value={form.cupos_totales} onChange={e => setForm(f => ({ ...f, cupos_totales: parseInt(e.target.value) || 1 }))} style={{ maxWidth: 100 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : 'Crear horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
      ) : Object.keys(porFecha).length === 0 ? (
        <div className="empty-state">
          <p>No hay horarios disponibles configurados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(porFecha).sort(([a],[b]) => a.localeCompare(b)).map(([fecha, fSlots]) => (
            <div key={fecha} className="card">
              <div className="card-header">
                <h3>{format(new Date(fecha + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fSlots.length} horarios</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>Servicio</th><th>Horario</th><th>Cupos</th><th>Ocupados</th><th>Disponibles</th><th></th></tr>
                  </thead>
                  <tbody>
                    {fSlots.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{s.servicio_nombre}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.hora_inicio?.slice(0,5)} – {s.hora_fin?.slice(0,5)}</td>
                        <td>{s.cupos_totales}</td>
                        <td>{s.cupos_ocupados}</td>
                        <td>
                          <span className={`badge badge-${s.cupos_disponibles > 0 ? 'success' : 'danger'}`}>
                            {s.cupos_disponibles}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Desactivar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
