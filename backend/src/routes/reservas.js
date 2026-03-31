const express = require('express');
const { pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/reservas - mis reservas (cliente) o todas (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (req.user.rol === 'administrador') {
      query = `
        SELECT r.*, u.nombre AS usuario_nombre, u.email AS usuario_email,
               s.nombre AS servicio_nombre, d.fecha, d.hora_inicio, d.hora_fin
        FROM reservas r
        JOIN usuarios u ON u.id = r.usuario_id
        JOIN disponibilidad d ON d.id = r.disponibilidad_id
        JOIN servicios s ON s.id = d.servicio_id
        ORDER BY d.fecha DESC, d.hora_inicio DESC
      `;
      params = [];
    } else {
      query = `
        SELECT r.*, s.nombre AS servicio_nombre, d.fecha, d.hora_inicio, d.hora_fin
        FROM reservas r
        JOIN disponibilidad d ON d.id = r.disponibilidad_id
        JOIN servicios s ON s.id = d.servicio_id
        WHERE r.usuario_id = $1
        ORDER BY d.fecha DESC, d.hora_inicio DESC
      `;
      params = [req.user.id];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

// POST /api/reservas - crear reserva
router.post('/', authMiddleware, async (req, res) => {
  const { disponibilidad_id, notas } = req.body;
  if (!disponibilidad_id)
    return res.status(400).json({ error: 'La disponibilidad es requerida' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar disponibilidad con lock para evitar race conditions
    const disp = await client.query(
      'SELECT * FROM disponibilidad WHERE id = $1 AND activo = true FOR UPDATE',
      [disponibilidad_id]
    );
    if (disp.rows.length === 0)
      throw { status: 404, message: 'Horario no encontrado o inactivo' };

    const slot = disp.rows[0];

    // RN08: no se puede reservar en fechas pasadas
    if (new Date(slot.fecha) < new Date().setHours(0,0,0,0))
      throw { status: 400, message: 'No se pueden hacer reservas en fechas pasadas' };

    // RN02: verificar cupos
    if (slot.cupos_ocupados >= slot.cupos_totales)
      throw { status: 409, message: 'No hay cupos disponibles en este horario' };

    // RN01: verificar duplicado del usuario en ese horario
    const duplicado = await client.query(
      'SELECT id FROM reservas WHERE usuario_id = $1 AND disponibilidad_id = $2 AND estado = $3',
      [req.user.id, disponibilidad_id, 'activa']
    );
    if (duplicado.rows.length > 0)
      throw { status: 409, message: 'Ya tienes una reserva activa en este horario' };

    // Crear reserva
    const reserva = await client.query(
      'INSERT INTO reservas (usuario_id, disponibilidad_id, notas) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, disponibilidad_id, notas]
    );

    // Actualizar cupos
    await client.query(
      'UPDATE disponibilidad SET cupos_ocupados = cupos_ocupados + 1 WHERE id = $1',
      [disponibilidad_id]
    );

    // Crear notificación de confirmación
    await client.query(
      "INSERT INTO notificaciones (usuario_id, reserva_id, tipo, mensaje) VALUES ($1, $2, 'confirmacion', $3)",
      [req.user.id, reserva.rows[0].id, `Tu reserva ha sido confirmada para el ${slot.fecha}`]
    );

    await client.query('COMMIT');
    res.status(201).json(reserva.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Error creando reserva' });
  } finally {
    client.release();
  }
});

// DELETE /api/reservas/:id - cancelar reserva
router.delete('/:id', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'SELECT r.*, d.fecha FROM reservas r JOIN disponibilidad d ON d.id = r.disponibilidad_id WHERE r.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      throw { status: 404, message: 'Reserva no encontrada' };

    const reserva = result.rows[0];

    // RN05: solo el dueño o admin puede cancelar
    if (req.user.rol !== 'administrador' && reserva.usuario_id !== req.user.id)
      throw { status: 403, message: 'No tienes permiso para cancelar esta reserva' };

    if (reserva.estado === 'cancelada')
      throw { status: 400, message: 'La reserva ya está cancelada' };

    // Cancelar reserva
    await client.query(
      "UPDATE reservas SET estado = 'cancelada', updated_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    // RN04: liberar horario automáticamente
    await client.query(
      'UPDATE disponibilidad SET cupos_ocupados = GREATEST(cupos_ocupados - 1, 0) WHERE id = $1',
      [reserva.disponibilidad_id]
    );

    // Notificación de cancelación
    await client.query(
      "INSERT INTO notificaciones (usuario_id, reserva_id, tipo, mensaje) VALUES ($1, $2, 'cancelacion', $3)",
      [reserva.usuario_id, reserva.id, `Tu reserva del ${reserva.fecha} ha sido cancelada`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(err.status || 500).json({ error: err.message || 'Error cancelando reserva' });
  } finally {
    client.release();
  }
});

// Reportes (admin)
router.get('/reportes', authMiddleware, adminMiddleware, async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  try {
    const result = await pool.query(`
      SELECT 
        s.nombre AS servicio,
        COUNT(r.id) FILTER (WHERE r.estado = 'activa') AS activas,
        COUNT(r.id) FILTER (WHERE r.estado = 'cancelada') AS canceladas,
        COUNT(r.id) FILTER (WHERE r.estado = 'completada') AS completadas,
        COUNT(r.id) AS total
      FROM reservas r
      JOIN disponibilidad d ON d.id = r.disponibilidad_id
      JOIN servicios s ON s.id = d.servicio_id
      WHERE ($1::date IS NULL OR d.fecha >= $1::date)
        AND ($2::date IS NULL OR d.fecha <= $2::date)
      GROUP BY s.nombre
      ORDER BY total DESC
    `, [fecha_inicio || null, fecha_fin || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error generando reporte' });
  }
});

module.exports = router;
