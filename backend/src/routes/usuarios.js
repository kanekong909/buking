const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/usuarios - listar (admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// PUT /api/usuarios/:id - actualizar (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { nombre, rol, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, rol=$2, activo=$3, updated_at=NOW() WHERE id=$4 RETURNING id, nombre, email, rol, activo',
      [nombre, rol, activo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// GET /api/usuarios/notificaciones - mis notificaciones
router.get('/notificaciones', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo notificaciones' });
  }
});

// PUT /api/usuarios/notificaciones/:id/leida
router.put('/notificaciones/:id/leida', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = true WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando notificación' });
  }
});

module.exports = router;
