# Sistema de Reservas 🗓️

Sistema web completo para gestión de reservas — desarrollado con Node.js + Express + PostgreSQL (backend) y React + Vite (frontend).

## Estructura del proyecto

```
sistema-reservas/
├── backend/          # API REST con Express
│   ├── src/
│   │   ├── db/       # Conexión PostgreSQL + schema SQL
│   │   ├── middleware/  # Auth JWT
│   │   ├── routes/   # auth, servicios, disponibilidad, reservas, usuarios
│   │   └── index.js  # Entry point
│   └── package.json
└── frontend/         # React + Vite
    ├── src/
    │   ├── context/  # AuthContext
    │   ├── lib/      # API client
    │   ├── pages/    # Todas las páginas
    │   └── components/  # Sidebar
    └── package.json
```

---

## 🚀 Deploy en Railway (paso a paso)

### 1. Crear base de datos PostgreSQL

1. Entra a [railway.app](https://railway.app) → **New Project**
2. Selecciona **Provision PostgreSQL**
3. Ve a la pestaña **Connect** y copia la variable `DATABASE_URL`

### 2. Deploy del Backend

1. En el mismo proyecto, crea un nuevo servicio → **Deploy from GitHub repo**
2. Selecciona tu repositorio y elige la carpeta `backend` como **Root Directory**
3. Railway detectará automáticamente Node.js
4. En **Variables**, agrega:
   ```
   DATABASE_URL=<el valor copiado del paso 1>
   JWT_SECRET=una_cadena_secreta_muy_larga_y_aleatoria
   NODE_ENV=production
   FRONTEND_URL=https://tu-frontend.railway.app
   ```
5. El backend iniciará automáticamente y creará las tablas

### 3. Deploy del Frontend

1. Crea otro servicio → **Deploy from GitHub repo**
2. Selecciona la carpeta `frontend` como **Root Directory**
3. En **Variables**, agrega:
   ```
   VITE_API_URL=https://tu-backend.railway.app/api
   ```
4. Railway ejecutará `npm run build` automáticamente

### 4. Configurar URLs cruzadas

Una vez que tengas las URLs de Railway:
- En el backend: actualiza `FRONTEND_URL` con la URL del frontend
- En el frontend: actualiza `VITE_API_URL` con la URL del backend + `/api`
- Haz redeploy de ambos servicios

---

## 🔧 Desarrollo local

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu DATABASE_URL local
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Si el backend corre en localhost:3000, puedes usar el proxy de Vite (no necesitas .env)
npm run dev
```

---

## 🔐 Credenciales por defecto

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@reservas.com | password |

> ⚠️ Cambia la contraseña del admin en producción. El hash en el schema SQL corresponde a `password` — actualiza en la BD después del primer login.

---

## 📋 Funcionalidades implementadas (Sprint 1)

### Cliente
- ✅ Registro e inicio de sesión
- ✅ Ver servicios disponibles
- ✅ Consultar disponibilidad por fecha
- ✅ Crear reservas (flujo de 3 pasos)
- ✅ Ver historial de reservas
- ✅ Cancelar reservas
- ✅ Ver notificaciones

### Administrador
- ✅ Dashboard con estadísticas
- ✅ Ver todas las reservas
- ✅ Cancelar cualquier reserva
- ✅ Gestionar servicios
- ✅ Configurar disponibilidad
- ✅ Gestionar usuarios (activar/desactivar, cambiar rol)
- ✅ Reportes por servicio y período

### Reglas de negocio implementadas
- ✅ RN01: Sin reservas duplicadas en el mismo horario
- ✅ RN02: Solo en horarios disponibles
- ✅ RN03: Solo admin modifica disponibilidad general
- ✅ RN04: Cancelación libera el horario automáticamente
- ✅ RN05: Usuario solo cancela sus propias reservas
- ✅ RN08: No se reserva en fechas pasadas

---

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil actual |
| GET | `/api/servicios` | Listar servicios |
| GET | `/api/disponibilidad` | Consultar slots disponibles |
| GET | `/api/reservas` | Mis reservas / todas (admin) |
| POST | `/api/reservas` | Crear reserva |
| DELETE | `/api/reservas/:id` | Cancelar reserva |
| GET | `/api/reservas/reportes` | Reportes (admin) |
| GET | `/api/usuarios` | Listar usuarios (admin) |
| GET | `/health` | Health check |
