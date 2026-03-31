const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Servicios
  getServicios: () => request('/servicios'),
  createServicio: (body) => request('/servicios', { method: 'POST', body: JSON.stringify(body) }),
  updateServicio: (id, body) => request(`/servicios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteServicio: (id) => request(`/servicios/${id}`, { method: 'DELETE' }),

  // Disponibilidad
  getDisponibilidad: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/disponibilidad?${q}`);
  },
  createDisponibilidad: (body) => request('/disponibilidad', { method: 'POST', body: JSON.stringify(body) }),
  deleteDisponibilidad: (id) => request(`/disponibilidad/${id}`, { method: 'DELETE' }),

  // Reservas
  getReservas: () => request('/reservas'),
  createReserva: (body) => request('/reservas', { method: 'POST', body: JSON.stringify(body) }),
  cancelarReserva: (id) => request(`/reservas/${id}`, { method: 'DELETE' }),
  getReportes: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reservas/reportes?${q}`);
  },

  // Usuarios
  getUsuarios: () => request('/usuarios'),
  updateUsuario: (id, body) => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getNotificaciones: () => request('/usuarios/notificaciones'),
  marcarLeida: (id) => request(`/usuarios/notificaciones/${id}/leida`, { method: 'PUT' }),
};
