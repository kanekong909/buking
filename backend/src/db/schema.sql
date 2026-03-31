-- =============================================
-- SISTEMA DE RESERVAS - Schema PostgreSQL
-- Sprint 1: Usuarios, Servicios, Disponibilidad, Reservas
-- =============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente', 'administrador')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de servicios/espacios
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  duracion_minutos INT NOT NULL DEFAULT 60,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de horarios disponibles (configurados por el admin)
CREATE TABLE IF NOT EXISTS disponibilidad (
  id SERIAL PRIMARY KEY,
  servicio_id INT REFERENCES servicios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  cupos_totales INT NOT NULL DEFAULT 1,
  cupos_ocupados INT NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT cupos_validos CHECK (cupos_ocupados <= cupos_totales)
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  disponibilidad_id INT REFERENCES disponibilidad(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'completada')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- RN01: Un usuario no puede tener dos reservas en el mismo horario
  UNIQUE (usuario_id, disponibilidad_id)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,
  reserva_id INT REFERENCES reservas(id) ON DELETE SET NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('confirmacion', 'cancelacion', 'modificacion', 'recordatorio')),
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- DATOS INICIALES (seed)
-- =============================================

-- Admin por defecto (password: Admin1234!)
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
  'Administrador',
  'admin@reservas.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  'administrador'
) ON CONFLICT (email) DO NOTHING;

-- Servicios de ejemplo
INSERT INTO servicios (nombre, descripcion, duracion_minutos) VALUES
  ('Consulta General', 'Atención médica general', 30),
  ('Sala de Reuniones A', 'Sala con capacidad para 10 personas', 60),
  ('Cancha de Tenis', 'Cancha exterior cubierta', 60),
  ('Consulta Especialista', 'Atención especializada', 45)
ON CONFLICT DO NOTHING;

-- Disponibilidad de ejemplo para la próxima semana
INSERT INTO disponibilidad (servicio_id, fecha, hora_inicio, hora_fin, cupos_totales)
SELECT 
  s.id,
  CURRENT_DATE + generate_series(1, 7) AS fecha,
  h.hora_inicio,
  h.hora_fin,
  1
FROM servicios s
CROSS JOIN (
  VALUES 
    ('08:00'::TIME, '09:00'::TIME),
    ('09:00'::TIME, '10:00'::TIME),
    ('10:00'::TIME, '11:00'::TIME),
    ('11:00'::TIME, '12:00'::TIME),
    ('14:00'::TIME, '15:00'::TIME),
    ('15:00'::TIME, '16:00'::TIME),
    ('16:00'::TIME, '17:00'::TIME)
) AS h(hora_inicio, hora_fin)
ON CONFLICT DO NOTHING;
