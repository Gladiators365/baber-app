-- Demo seed data for Barber APP

-- Clients with varying cadences and last visit dates
INSERT OR IGNORE INTO clients (name, phone_number, preferred_cadence, last_visit_date, avg_ticket) VALUES
    ('John Davis',      '+15551234567', 14, date('now', '-16 days'), 40.00),
    ('Marcus Thompson', '+15559876543', 7,  date('now', '-9 days'),  35.00),
    ('DeShawn Williams','+15554567890', 21, date('now', '-5 days'),  50.00),
    ('Carlos Rivera',   '+15557891234', 14, date('now', '-20 days'), 45.00),
    ('Tyler Johnson',   '+15553216549', 7,  date('now', '-3 days'),  30.00);

-- Some existing appointments
INSERT OR IGNORE INTO appointments (client_id, barber_name, start_time, end_time, status) VALUES
    (3, 'Mark', datetime('now', '+2 days', 'start of day', '+14 hours'), datetime('now', '+2 days', 'start of day', '+14 hours', '+45 minutes'), 'Confirmed'),
    (5, 'Mark', datetime('now', '+4 days', 'start of day', '+10 hours'), datetime('now', '+4 days', 'start of day', '+10 hours', '+30 minutes'), 'Confirmed');

-- A past completed appointment
INSERT OR IGNORE INTO appointments (client_id, barber_name, start_time, end_time, status) VALUES
    (1, 'Mark', datetime('now', '-16 days', 'start of day', '+13 hours'), datetime('now', '-16 days', 'start of day', '+13 hours', '+45 minutes'), 'Completed');
