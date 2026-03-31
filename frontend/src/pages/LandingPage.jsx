import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReservar = () => {
    if (user) {
      navigate(user.rol === 'administrador' ? '/admin' : '/reservar');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="landing">

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="logo-b">B</span>uking
          </div>
          <div className="landing-nav-links">
            <a href="#servicios">Servicios</a>
            <a href="#como-reservar">Cómo reservar</a>
            <a href="#contacto">Contacto</a>
          </div>
          <div className="landing-nav-actions">
            {user ? (
              <button className="btn-landing-primary" onClick={handleReservar}>
                Ir al panel
              </button>
            ) : (
              <>
                <button className="btn-landing-ghost" onClick={() => navigate('/auth')}>Iniciar sesión</button>
                <button className="btn-landing-primary" onClick={() => navigate('/auth')}>Reservar ahora</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">✦ Sistema de reservas inteligente</div>
          <h1 className="hero-title">
            Reserva tu estadía<br />
            <span className="hero-accent">sin complicaciones</span>
          </h1>
          <p className="hero-sub">
            Buking te permite gestionar reservas de habitaciones, salas y servicios en tiempo real.
            Confirmación inmediata, disponibilidad actualizada al instante.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={handleReservar}>
              Hacer una reserva
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <a href="#como-reservar" className="btn-hero-ghost">Ver cómo funciona</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span>+500</span><p>Reservas realizadas</p></div>
            <div className="hero-divider" />
            <div className="hero-stat"><span>24/7</span><p>Disponibilidad</p></div>
            <div className="hero-divider" />
            <div className="hero-stat"><span>100%</span><p>Confirmación inmediata</p></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="booking-card">
            <div className="booking-card-header">
              <div className="booking-card-dot green" />
              <div className="booking-card-dot yellow" />
              <div className="booking-card-dot red" />
              <span>Reserva confirmada</span>
            </div>
            <div className="booking-card-body">
              <div className="booking-row">
                <div className="booking-label">Servicio</div>
                <div className="booking-value">Suite Ejecutiva</div>
              </div>
              <div className="booking-row">
                <div className="booking-label">Fecha</div>
                <div className="booking-value">15 de Abril, 2026</div>
              </div>
              <div className="booking-row">
                <div className="booking-label">Horario</div>
                <div className="booking-value">14:00 – 12:00</div>
              </div>
              <div className="booking-status">
                <span className="status-dot" />
                Confirmado automáticamente
              </div>
            </div>
          </div>
          <div className="floating-notif notif-1">
            <span>✓</span> Reserva registrada
          </div>
          <div className="floating-notif notif-2">
            <span>🔔</span> Recordatorio enviado
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="section" id="servicios">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Nuestros servicios</div>
            <h2>Todo lo que Buking ofrece</h2>
            <p>Reserva cualquier espacio o servicio del hotel de forma rápida y segura</p>
          </div>
          <div className="services-grid">
            {[
              { icon: '🛏️', title: 'Habitaciones', desc: 'Estándar, superiores, suites y más. Consulta disponibilidad en tiempo real y reserva con un clic.', tag: 'Más popular' },
              { icon: '🍽️', title: 'Restaurante', desc: 'Reserva tu mesa para desayuno, almuerzo o cena. Menús especiales disponibles para grupos.' },
              { icon: '💆', title: 'Spa & Bienestar', desc: 'Masajes, tratamientos y relajación. Agenda tu sesión y llega sin esperas.' },
              { icon: '🏊', title: 'Piscina & Zonas', desc: 'Reserva acceso exclusivo a la piscina, jacuzzi y zonas de recreación del hotel.' },
              { icon: '🏢', title: 'Salas de Reuniones', desc: 'Espacios equipados para eventos corporativos, conferencias y reuniones de trabajo.' },
              { icon: '🚗', title: 'Estacionamiento', desc: 'Garantiza tu espacio de parqueo con anticipación. Disponible las 24 horas.' },
            ].map((s, i) => (
              <div key={i} className="service-card">
                {s.tag && <div className="service-tag">{s.tag}</div>}
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <button className="service-btn" onClick={handleReservar}>Reservar →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO RESERVAR */}
      <section className="section section-dark" id="como-reservar">
        <div className="section-inner">
          <div className="section-header light">
            <div className="section-badge light">Proceso simple</div>
            <h2>¿Cómo hacer una reserva?</h2>
            <p>En 3 pasos tienes tu reserva confirmada</p>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', icon: '👤', title: 'Crea tu cuenta', desc: 'Regístrate con tu correo electrónico. Solo toma un minuto y es completamente gratuito.' },
              { n: '02', icon: '📅', title: 'Elige fecha y servicio', desc: 'Selecciona el servicio que necesitas, la fecha disponible y el horario que más te convenga.' },
              { n: '03', icon: '✅', title: 'Confirma tu reserva', desc: 'Revisa los detalles y confirma. Recibirás una notificación inmediata con tu reserva registrada.' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{step.n}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < 2 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button className="btn-hero-primary" onClick={handleReservar}>
              Comenzar ahora
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="section" id="beneficios">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">¿Por qué Buking?</div>
            <h2>Ventajas del sistema</h2>
          </div>
          <div className="benefits-grid">
            {[
              { icon: '⚡', title: 'Tiempo real', desc: 'La disponibilidad se actualiza al instante. Sin llamadas, sin esperas.' },
              { icon: '🔒', title: 'Seguro', desc: 'Acceso con autenticación segura. Tus datos siempre protegidos.' },
              { icon: '📱', title: 'Desde cualquier dispositivo', desc: 'Interfaz responsive. Reserva desde tu celular, tablet o computador.' },
              { icon: '🔔', title: 'Notificaciones automáticas', desc: 'Recibe confirmaciones y recordatorios de tus reservas automáticamente.' },
              { icon: '📊', title: 'Control total', desc: 'El administrador tiene visibilidad completa de todas las reservas y reportes.' },
              { icon: '🚫', title: 'Sin dobles reservas', desc: 'El sistema bloquea automáticamente conflictos de horario.' },
            ].map((b, i) => (
              <div key={i} className="benefit-card">
                <div className="benefit-icon">{b.icon}</div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-orb" />
          <h2>¿Listo para reservar?</h2>
          <p>Crea tu cuenta gratis y gestiona tus reservas desde hoy</p>
          <button className="btn-hero-primary" onClick={handleReservar}>
            Reservar ahora — es gratis
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="section" id="contacto">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-badge">Contáctanos</div>
            <h2>Estamos para ayudarte</h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              {[
                { icon: '📍', label: 'Dirección', val: 'Av. Principal 123, Ciudad, Colombia' },
                { icon: '📞', label: 'Teléfono', val: '+57 300 123 4567' },
                { icon: '✉️', label: 'Email', val: 'contacto@buking.com' },
                { icon: '🕐', label: 'Horario', val: 'Lun–Dom · 24 horas' },
              ].map((c, i) => (
                <div key={i} className="contact-item">
                  <div className="contact-icon">{c.icon}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-val">{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="contact-form-box">
              <h3>Envíanos un mensaje</h3>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="correo@ejemplo.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Mensaje</label>
                <textarea className="form-input" rows={4} placeholder="¿En qué podemos ayudarte?" style={{ resize: 'vertical' }} />
              </div>
              <button className="btn-landing-primary" style={{ width: '100%' }}>Enviar mensaje</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="landing-logo" style={{ color: 'white' }}>
            <span className="logo-b">B</span>uking
          </div>
          <p>© 2026 Buking · Sistema de Reservas · Todos los derechos reservados</p>
          <div className="footer-links">
            <a href="#servicios">Servicios</a>
            <a href="#como-reservar">Cómo funciona</a>
            <a href="#contacto">Contacto</a>
            <button onClick={() => navigate('/auth')}>Iniciar sesión</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
