const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/servicios - listar todos activos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM servicios WHERE activo = true ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

// POST /api/servicios - crear (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { nombre, descripcion, duracion_minutos } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    const result = await pool.query(
      'INSERT INTO servicios (nombre, descripcion, duracion_minutos) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, duracion_minutos || 60]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error creando servicio' });
  }
});

// PUT /api/servicios/:id - actualizar (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { nombre, descripcion, duracion_minutos, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE servicios SET nombre=$1, descripcion=$2, duracion_minutos=$3, activo=$4 WHERE id=$5 RETURNING *',
      [nombre, descripcion, duracion_minutos, activo, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando servicio' });
  }
});

// DELETE /api/servicios/:id - desactivar (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE servicios SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Servicio desactivado' });
  } catch (err) {
    res.status(500).json({ error: 'Error desactivando servicio' });
  }
});

module.exports = router;
