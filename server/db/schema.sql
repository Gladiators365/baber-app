-- Barber APP Database Schema
-- SQLite

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    preferred_cadence INTEGER NOT NULL DEFAULT 14, -- days between cuts
    last_visit_date TEXT, -- ISO date string
    avg_ticket REAL DEFAULT 35.00, -- average spend per visit
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    barber_name TEXT NOT NULL DEFAULT 'Mark',
    start_time TEXT NOT NULL, -- ISO datetime
    end_time TEXT NOT NULL,   -- ISO datetime
    status TEXT NOT NULL DEFAULT 'Proposed' CHECK(status IN ('Proposed','Confirmed','Completed','No-show','Cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS automation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    message_type TEXT NOT NULL CHECK(message_type IN ('Retention','Weekly Invite','Confirmation','Cancellation')),
    message_body TEXT,
    direction TEXT NOT NULL DEFAULT 'outbound' CHECK(direction IN ('outbound','inbound')),
    sent_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index for the retention engine's daily query
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON clients(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_status ON appointments(client_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_client_sent ON automation_logs(client_id, sent_at);
