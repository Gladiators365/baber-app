const express = require('express');
const router = express.Router();

// GET available slots for a date (must be before /:id route)
router.get('/slots/:date', (req, res) => {
  const { queryGet } = req.app.locals;
  const barber = req.query.barber || 'Mark';
  const dateStr = req.params.date;
  const cutDuration = parseInt(process.env.DEFAULT_CUT_DURATION_MINUTES) || 45;

  const slots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let min = 0; min < 60; min += cutDuration) {
      if (hour === 18 && min + cutDuration > 60) continue;
      const start = `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
      const endDate = new Date(new Date(start).getTime() + cutDuration * 60000);
      const end = endDate.toISOString().slice(0, 19);

      const taken = queryGet(`
        SELECT id FROM appointments
        WHERE barber_name = ? AND status IN ('Confirmed', 'Proposed')
        AND start_time < ? AND end_time > ?
      `, [barber, end, start]);

      slots.push({ start_time: start, end_time: end, available: !taken });
    }
  }

  res.json(slots.filter(s => s.available));
});

// GET all appointments
router.get('/', (req, res) => {
  const { queryAll } = req.app.locals;
  const { date, status } = req.query;

  let sql = `
    SELECT a.*, c.name as client_name, c.phone_number
    FROM appointments a
    JOIN clients c ON c.id = a.client_id
  `;
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push('date(a.start_time) = ?');
    params.push(date);
  }
  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY a.start_time ASC';

  const appointments = queryAll(sql, params);
  res.json(appointments);
});

// GET single appointment
router.get('/:id', (req, res) => {
  const { queryGet } = req.app.locals;
  const appt = queryGet(`
    SELECT a.*, c.name as client_name, c.phone_number
    FROM appointments a
    JOIN clients c ON c.id = a.client_id
    WHERE a.id = ?
  `, [req.params.id]);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appt);
});

// POST create appointment
router.post('/', (req, res) => {
  const { queryGet, runSql } = req.app.locals;
  const { client_id, barber_name, start_time, end_time, status } = req.body;

  if (!client_id || !start_time) {
    return res.status(400).json({ error: 'client_id and start_time are required' });
  }

  const cutDuration = parseInt(process.env.DEFAULT_CUT_DURATION_MINUTES) || 45;
  const actualEnd = end_time || new Date(new Date(start_time).getTime() + cutDuration * 60000).toISOString();
  const barber = barber_name || 'Mark';

  const conflict = queryGet(`
    SELECT id FROM appointments
    WHERE barber_name = ? AND status IN ('Confirmed', 'Proposed')
    AND start_time < ? AND end_time > ?
  `, [barber, actualEnd, start_time]);

  if (conflict) {
    return res.status(409).json({ error: 'Time slot conflicts with existing appointment', conflicting_id: conflict.id });
  }

  const result = runSql(
    `INSERT INTO appointments (client_id, barber_name, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)`,
    [client_id, barber, start_time, actualEnd, status || 'Proposed']
  );

  const appt = queryGet(`
    SELECT a.*, c.name as client_name FROM appointments a JOIN clients c ON c.id = a.client_id WHERE a.id = ?
  `, [result.lastInsertRowid]);
  res.status(201).json(appt);
});

// PUT update appointment
router.put('/:id', (req, res) => {
  const { queryGet, runSql } = req.app.locals;
  const { status, start_time, end_time } = req.body;

  const existing = queryGet('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Appointment not found' });

  runSql(
    `UPDATE appointments SET status = ?, start_time = ?, end_time = ? WHERE id = ?`,
    [status || existing.status, start_time || existing.start_time, end_time || existing.end_time, req.params.id]
  );

  if (status === 'Completed') {
    runSql(`UPDATE clients SET last_visit_date = date(?) WHERE id = ?`, [existing.start_time, existing.client_id]);
  }

  const updated = queryGet(`
    SELECT a.*, c.name as client_name FROM appointments a JOIN clients c ON c.id = a.client_id WHERE a.id = ?
  `, [req.params.id]);
  res.json(updated);
});

// DELETE appointment
router.delete('/:id', (req, res) => {
  const { runSql } = req.app.locals;
  const result = runSql('DELETE FROM appointments WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ message: 'Appointment deleted' });
});

module.exports = router;
