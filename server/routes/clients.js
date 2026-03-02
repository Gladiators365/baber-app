const express = require('express');
const router = express.Router();

// GET all clients
router.get('/', (req, res) => {
  const { queryAll } = req.app.locals;
  const clients = queryAll(`
    SELECT c.*,
      CAST(julianday('now') - julianday(c.last_visit_date) AS INTEGER) as days_since_visit,
      CASE
        WHEN julianday('now') - julianday(c.last_visit_date) > c.preferred_cadence THEN 'overdue'
        WHEN julianday('now') - julianday(c.last_visit_date) > c.preferred_cadence - 2 THEN 'due_soon'
        ELSE 'on_track'
      END as retention_status
    FROM clients c
    ORDER BY c.last_visit_date ASC
  `);
  res.json(clients);
});

// GET single client
router.get('/:id', (req, res) => {
  const { queryGet, queryAll } = req.app.locals;
  const client = queryGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const appointments = queryAll(
    'SELECT * FROM appointments WHERE client_id = ? ORDER BY start_time DESC',
    [req.params.id]
  );

  res.json({ ...client, appointments });
});

// POST create client
router.post('/', (req, res) => {
  const { queryGet, runSql } = req.app.locals;
  const { name, phone_number, preferred_cadence, avg_ticket } = req.body;

  if (!name || !phone_number) {
    return res.status(400).json({ error: 'Name and phone_number are required' });
  }

  // Check for duplicate
  const existing = queryGet('SELECT id FROM clients WHERE phone_number = ?', [phone_number]);
  if (existing) {
    return res.status(409).json({ error: 'A client with this phone number already exists' });
  }

  const result = runSql(
    `INSERT INTO clients (name, phone_number, preferred_cadence, avg_ticket, last_visit_date)
     VALUES (?, ?, ?, ?, date('now'))`,
    [name, phone_number, preferred_cadence || 14, avg_ticket || 35.00]
  );

  const client = queryGet('SELECT * FROM clients WHERE id = ?', [result.lastInsertRowid]);
  res.status(201).json(client);
});

// PUT update client
router.put('/:id', (req, res) => {
  const { queryGet, runSql } = req.app.locals;
  const { name, phone_number, preferred_cadence, avg_ticket, last_visit_date } = req.body;

  const existing = queryGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  runSql(
    `UPDATE clients SET name = ?, phone_number = ?, preferred_cadence = ?, avg_ticket = ?, last_visit_date = ? WHERE id = ?`,
    [
      name || existing.name,
      phone_number || existing.phone_number,
      preferred_cadence || existing.preferred_cadence,
      avg_ticket || existing.avg_ticket,
      last_visit_date || existing.last_visit_date,
      req.params.id
    ]
  );

  const updated = queryGet('SELECT * FROM clients WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// DELETE client
router.delete('/:id', (req, res) => {
  const { runSql } = req.app.locals;
  const result = runSql('DELETE FROM clients WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Client not found' });
  res.json({ message: 'Client deleted' });
});

module.exports = router;
