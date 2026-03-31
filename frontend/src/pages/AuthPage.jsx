import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        navigate(user.rol === 'administrador' ? '/admin' : '/dashboard');
      } else {
        await register(form.nombre, form.email, form.password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-left">
        <h1>Sistema de Reservas</h1>
        <p>Gestiona tus reservas de manera rápida, segura y eficiente. Disponibilidad en tiempo real, confirmaciones automáticas.</p>
      </div>
      <div className="auth-panel-right">
        <div className="auth-form-container">
          <h2>{mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}</h2>
          <p>{mode === 'login' ? 'Ingresa a tu cuenta para continuar' : 'Regístrate para comenzar a reservar'}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                className="form-input"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>¿No tienes cuenta? <a onClick={() => setMode('register')}>Regístrate</a></>
            ) : (
              <>¿Ya tienes cuenta? <a onClick={() => setMode('login')}>Inicia sesión</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
