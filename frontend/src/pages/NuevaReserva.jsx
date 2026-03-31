import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NuevaReserva() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd');

  useEffect(() => {
    api.getServicios().then(setServicios).catch(() => {});
  }, []);

  useEffect(() => {
    if (servicioId && fecha) {
      setSlots([]);
      setSlotId('');
      api.getDisponibilidad({ servicio_id: servicioId, fecha })
        .then(setSlots)
        .catch(() => setSlots([]));
    }
  }, [servicioId, fecha]);

  const handleReservar = async () => {
    if (!slotId) return;
    setLoading(true);
    setError('');
    try {
      await api.createReserva({ disponibilidad_id: slotId, notas });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div>
      <div className="page-header">
        <h2>¡Reserva confirmada!</h2>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 8 }}>
            Tu reserva ha sido registrada
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
            Recibirás una notificación de confirmación en tu cuenta.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setSuccess(false); setStep(1); setServicioId(''); setFecha(''); setSlotId(''); }}>
              Nueva reserva
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/mis-reservas')}>
              Ver mis reservas
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Nueva Reserva</h2>
        <p>Selecciona el servicio, fecha y horario disponible</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
        {['Servicio', 'Fecha y horario', 'Confirmar'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--accent)' : 'var(--border)',
              color: step >= i + 1 ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.8rem', color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 600 : 400 }}>
              {label}
            </span>
            {i < 2 && <div style={{ width: 32, height: 1, background: 'var(--border)', marginLeft: 4 }} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="card-body">

          {/* Step 1: Servicio */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>¿Qué servicio necesitas?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {servicios.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setServicioId(String(s.id))}
                    style={{
                      padding: '16px 20px', border: `2px solid ${servicioId === String(s.id) ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)', background: servicioId === String(s.id) ? 'var(--accent-light)' : 'var(--bg-card)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.nombre}</div>
                    {s.descripcion && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>{s.descripcion}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>⏱ {s.duracion_minutos} min</div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" disabled={!servicioId} onClick={() => setStep(2)}>
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fecha y horario */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Elige fecha y horario</h3>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  className="form-input"
                  type="date"
                  min={today}
                  max={maxDate}
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  style={{ maxWidth: 220 }}
                />
              </div>

              {fecha && (
                <div>
                  <label className="form-label" style={{ marginBottom: 12 }}>Horarios disponibles</label>
                  {slots.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                      <p>No hay horarios disponibles para esta fecha</p>
                    </div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map(s => (
                        <div
                          key={s.id}
                          className={`slot ${slotId === String(s.id) ? 'selected' : ''}`}
                          onClick={() => setSlotId(String(s.id))}
                        >
                          <div className="slot-hora">{s.hora_inicio?.slice(0,5)} – {s.hora_fin?.slice(0,5)}</div>
                          <div className="slot-cupos">{s.cupos_disponibles} cupo{s.cupos_disponibles !== 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Atrás</button>
                <button className="btn btn-primary" disabled={!slotId} onClick={() => setStep(3)}>Continuar →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmar */}
          {step === 3 && (() => {
            const slot = slots.find(s => String(s.id) === slotId);
            const servicio = servicios.find(s => String(s.id) === servicioId);
            return (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>Confirma tu reserva</h3>
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: 20, marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                    {[
                      ['Servicio', servicio?.nombre],
                      ['Fecha', fecha ? format(new Date(fecha + 'T00:00:00'), "d 'de' MMMM yyyy", { locale: es }) : ''],
                      ['Horario', slot ? `${slot.hora_inicio?.slice(0,5)} – ${slot.hora_fin?.slice(0,5)}` : ''],
                      ['Duración', `${servicio?.duracion_minutos} min`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notas adicionales (opcional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Información adicional para el administrador..."
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>← Atrás</button>
                  <button className="btn btn-primary" onClick={handleReservar} disabled={loading}>
                    {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Confirmar reserva'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
