const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/servicios
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

// POST /api/servicios
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

// PUT /api/servicios/:id
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

// DELETE /api/servicios/:id — elimina si no tiene reservas, desactiva si tiene
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si tiene reservas activas asociadas
    const reservas = await pool.query(
      `SELECT COUNT(*) FROM reservas r
       JOIN disponibilidad d ON d.id = r.disponibilidad_id
       WHERE d.servicio_id = $1 AND r.estado = 'activa'`,
      [id]
    );

    const tieneReservas = parseInt(reservas.rows[0].count) > 0;

    if (tieneReservas) {
      // Si tiene reservas activas, solo desactivar
      await pool.query('UPDATE servicios SET activo = false WHERE id = $1', [id]);
      return res.json({ message: 'Servicio desactivado (tiene reservas activas asociadas)', desactivado: true });
    }

    // Sin reservas activas — eliminar completamente
    await pool.query('DELETE FROM disponibilidad WHERE servicio_id = $1', [id]);
    await pool.query('DELETE FROM servicios WHERE id = $1', [id]);
    res.json({ message: 'Servicio eliminado correctamente', eliminado: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando servicio' });
  }
});

module.exports = router;