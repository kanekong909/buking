import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null); // servicio en edición
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracion_minutos: 60 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [eliminando, setEliminando] = useState(false);

  const load = () => {
    setLoading(true);
    api.getServicios().then(setServicios).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const abrirNuevo = () => {
    setEditando(null);
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
    setForm({ nombre: '', descripcion: '', duracion_minutos: 60 });
    setError('');
    setShowForm(true);
  };

  const abrirEditar = (s) => {
    setEditando(s);
    setForm({ nombre: s.nombre, descripcion: s.descripcion || '', duracion_minutos: s.duracion_minutos });
    setError('');
    setShowForm(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await api.updateServicio(editando.id, { ...form, activo: editando.activo });
        setSuccess('Servicio actualizado');
      } else {
        await api.createServicio(form);
        setSuccess('Servicio creado');
      }
      setShowForm(false);
      setSeleccionados(new Set());
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarUno = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return;
    try {
      const r = await api.deleteServicio(id);
      setSuccess(r.eliminado ? 'Servicio eliminado correctamente' : 'Servicio desactivado (tiene reservas activas)');
      setSeleccionados(prev => { const n = new Set(prev); n.delete(id); return n; });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminarSeleccionados = async () => {
    if (seleccionados.size === 0) return;
    if (!confirm(`¿Desactivar ${seleccionados.size} servicio(s) seleccionado(s)?`)) return;
    setEliminando(true);
    try {
      const resultados = await Promise.all([...seleccionados].map(id => api.deleteServicio(id)));
      const eliminados = resultados.filter(r => r.eliminado).length;
      const desactivados = resultados.filter(r => r.desactivado).length;
      setSuccess(`${eliminados} eliminado(s), ${desactivados} desactivado(s) por tener reservas activas`);
      setSeleccionados(new Set());
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleTodos = () => {
    if (seleccionados.size === servicios.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(servicios.map(s => s.id)));
    }
  };

  const todosSeleccionados = servicios.length > 0 && seleccionados.size === servicios.length;
  const algunoSeleccionado = seleccionados.size > 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Servicios</h2>
          <p>Gestiona los servicios o espacios disponibles</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo servicio</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar servicio' : 'Nuevo servicio'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleGuardar}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Nombre del servicio</label>
                  <input className="form-input" placeholder="Ej: Suite Ejecutiva" value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-input" rows={3} placeholder="Descripción breve del servicio..."
                    value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (minutos)</label>
                  <input className="form-input" type="number" min={15} max={480} step={15}
                    value={form.duracion_minutos}
                    onChange={e => setForm(f => ({ ...f, duracion_minutos: parseInt(e.target.value) || 60 }))}
                    style={{ maxWidth: 120 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : editando ? 'Guardar cambios' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barra de acciones masivas */}
      {algunoSeleccionado && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--accent-light)', border: '1px solid rgba(194,65,12,0.2)',
          borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 16,
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent)' }}>
            {seleccionados.size} servicio{seleccionados.size > 1 ? 's' : ''} seleccionado{seleccionados.size > 1 ? 's' : ''}
          </span>
          <button className="btn btn-danger btn-sm" onClick={handleEliminarSeleccionados} disabled={eliminando}>
            {eliminando ? 'Desactivando...' : `Desactivar seleccionados (${seleccionados.size})`}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSeleccionados(new Set())}>
            Cancelar selección
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
        ) : servicios.length === 0 ? (
          <div className="card-body">
            <div className="empty-state"><p>No hay servicios registrados</p></div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleTodos}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      title="Seleccionar todos"
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map(s => (
                  <tr key={s.id} style={{ background: seleccionados.has(s.id) ? 'var(--accent-light)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionados.has(s.id)}
                        onChange={() => toggleSeleccion(s.id)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 220 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.descripcion || '—'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{s.duracion_minutos} min</td>
                    <td>
                      <span className={`badge badge-${s.activo ? 'success' : 'neutral'}`}>
                        {s.activo ? 'activo' : 'inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => abrirEditar(s)}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        {s.activo && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminarUno(s.id)}
                            title="Desactivar"
                          >
                            🗑️ Eliminar
                          </button>
                        )}
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