const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const { servicio_id, fecha } = req.query;
  const isAdmin = req.user?.rol === 'administrador';
  try {
    let query = `
      SELECT d.*, s.nombre AS servicio_nombre, s.duracion_minutos,
             (d.cupos_totales - d.cupos_ocupados) AS cupos_disponibles
      FROM disponibilidad d
      JOIN servicios s ON s.id = d.servicio_id
      WHERE d.activo = true
        AND d.fecha >= CURRENT_DATE
    `;

    if (!isAdmin) {
      query += ' AND (d.cupos_totales - d.cupos_ocupados) > 0';
    }

    const params = [];
    if (servicio_id) {
      params.push(servicio_id);
      query += ` AND d.servicio_id = $${params.length}`;
    }
    if (fecha) {
      params.push(fecha);
      query += ` AND d.fecha = $${params.length}`;
    }
    query += ' ORDER BY d.fecha, d.hora_inicio';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo disponibilidad' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { servicio_id, fecha, hora_inicio, hora_fin, cupos_totales } = req.body;
  if (!servicio_id || !fecha || !hora_inicio || !hora_fin)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  if (new Date(fecha) < new Date().setHours(0,0,0,0))
    return res.status(400).json({ error: 'No se puede crear disponibilidad en fechas pasadas' });

  try {
    const result = await pool.query(
      'INSERT INTO disponibilidad (servicio_id, fecha, hora_inicio, hora_fin, cupos_totales) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [servicio_id, fecha, hora_inicio, hora_fin, cupos_totales || 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando disponibilidad' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE disponibilidad SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Horario desactivado' });
  } catch (err) {
    res.status(500).json({ error: 'Error desactivando horario' });
  }
});

module.exports = router;