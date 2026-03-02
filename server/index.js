require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = path.join(__dirname, 'barber.db');

async function start() {
  const SQL = await initSqlJs();

  // Load existing DB or create new one
  let db;
  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  db.run(schema);

  // Seed if empty
  const [{ values }] = db.exec('SELECT COUNT(*) as count FROM clients');
  if (values[0][0] === 0) {
    const seed = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
    db.run(seed);
    console.log('Database seeded with demo data.');
  }

  // Save DB periodically and on changes
  function saveDb() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  }

  // Helper: make sql.js results look like better-sqlite3 results
  function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  function queryGet(sql, params = []) {
    const results = queryAll(sql, params);
    return results[0] || null;
  }

  function runSql(sql, params = []) {
    db.run(sql, params);
    const changes = db.getRowsModified();
    // Get last insert rowid
    const [{ values: idVals }] = db.exec('SELECT last_insert_rowid()');
    const lastInsertRowid = idVals[0][0];
    saveDb();
    return { changes, lastInsertRowid };
  }

  // Make helpers available to routes
  app.locals.queryAll = queryAll;
  app.locals.queryGet = queryGet;
  app.locals.runSql = runSql;
  app.locals.db = db;
  app.locals.saveDb = saveDb;

  // --- Routes ---
  app.use('/api/clients', require('./routes/clients'));
  app.use('/api/appointments', require('./routes/appointments'));
  app.use('/api/sms', require('./routes/sms'));

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', (req, res) => {
    const { queryAll, queryGet } = req.app.locals;

    const overdue = queryAll(`
      SELECT c.* FROM clients c
      WHERE julianday('now') - julianday(c.last_visit_date) > c.preferred_cadence
      AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.client_id = c.id
        AND a.status IN ('Proposed', 'Confirmed')
        AND a.start_time > datetime('now')
      )
    `);

    const revenueAtRisk = overdue.reduce((sum, c) => sum + (c.avg_ticket || 35), 0);

    const todayAppts = queryAll(`
      SELECT a.*, c.name as client_name, c.phone_number
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      WHERE date(a.start_time) = date('now')
      AND a.status IN ('Confirmed', 'Proposed')
      ORDER BY a.start_time
    `);

    const totalRow = queryGet('SELECT COUNT(*) as count FROM clients');
    const totalClients = totalRow ? totalRow.count : 0;

    res.json({
      overdueClients: overdue,
      overdueCount: overdue.length,
      revenueAtRisk,
      todayAppointments: todayAppts,
      todayCount: todayAppts.length,
      totalClients
    });
  });

  // Manual retention trigger
  app.post('/api/retention/run', async (req, res) => {
    const { runRetentionScan } = require('./services/retentionEngine');
    try {
      const count = await runRetentionScan(req.app.locals);
      res.json({ message: `Retention scan complete. ${count} client(s) contacted.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Start Retention Scheduler ---
  const { startScheduler } = require('./services/scheduler');
  startScheduler(app.locals);

  // --- Start Server ---
  app.listen(PORT, () => {
    console.log(`\n  Barber APP API running on http://localhost:${PORT}`);
    console.log(`  Dashboard stats:  GET /api/dashboard/stats`);
    console.log(`  Clients:          GET /api/clients`);
    console.log(`  Appointments:     GET /api/appointments\n`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    saveDb();
    db.close();
    process.exit(0);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
