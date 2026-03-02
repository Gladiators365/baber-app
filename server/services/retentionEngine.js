/**
 * Retention Engine
 * Scans for overdue clients and sends automated reminders with proposed slots.
 */

const { sendSMS } = require('./smsService');

const BARBER_NAME = process.env.DEFAULT_BARBER_NAME || 'Mark';
const CUT_DURATION = parseInt(process.env.DEFAULT_CUT_DURATION_MINUTES) || 45;
const COOLDOWN_DAYS = parseInt(process.env.REMINDER_COOLDOWN_DAYS) || 3;

/**
 * @param {object} locals - app.locals with queryAll, queryGet, runSql
 */
async function runRetentionScan(locals) {
  const { queryAll, queryGet, runSql } = locals;

  console.log(`\n[Retention Engine] Running scan at ${new Date().toISOString()}`);

  const overdueClients = queryAll(`
    SELECT c.* FROM clients c
    WHERE julianday('now') - julianday(c.last_visit_date) > c.preferred_cadence
    AND NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.client_id = c.id
      AND a.status IN ('Proposed', 'Confirmed')
      AND a.start_time > datetime('now')
    )
    AND NOT EXISTS (
      SELECT 1 FROM automation_logs al
      WHERE al.client_id = c.id
      AND al.message_type = 'Retention'
      AND julianday('now') - julianday(al.sent_at) < ?
    )
  `, [COOLDOWN_DAYS]);

  console.log(`[Retention Engine] Found ${overdueClients.length} overdue client(s)`);

  for (const client of overdueClients) {
    const daysSince = Math.floor(
      (Date.now() - new Date(client.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const slot = findNextAvailableSlot(locals);

    if (!slot) {
      console.log(`[Retention Engine] No available slots for ${client.name}, skipping.`);
      continue;
    }

    // Create Proposed appointment
    runSql(
      `INSERT INTO appointments (client_id, barber_name, start_time, end_time, status) VALUES (?, ?, ?, ?, 'Proposed')`,
      [client.id, BARBER_NAME, slot.start, slot.end]
    );

    const slotDate = new Date(slot.start);
    const dayName = slotDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const weeks = Math.floor(daysSince / 7);
    const timeAgo = weeks >= 2 ? `${weeks} weeks` : `${daysSince} days`;

    const body = `Hey ${client.name.split(' ')[0]}, it's been ${timeAgo} since your last cut! ${BARBER_NAME} has an opening ${dayName} at ${timeStr}. Reply YES to grab it.`;

    await sendSMS(locals, {
      clientId: client.id, to: client.phone_number, body, messageType: 'Retention'
    });

    console.log(`[Retention Engine] Reminded ${client.name} (${daysSince}d overdue) -> Proposed ${dayName} ${timeStr}`);
  }

  console.log(`[Retention Engine] Scan complete.\n`);
  return overdueClients.length;
}

function findNextAvailableSlot(locals) {
  const { queryGet } = locals;
  const cutMs = CUT_DURATION * 60000;

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().slice(0, 10);

    if (date.getDay() === 0) continue; // Skip Sundays

    for (let hour = 9; hour < 19; hour++) {
      for (let min = 0; min < 60; min += CUT_DURATION) {
        if (hour === 18 && min + CUT_DURATION > 60) continue;

        const startStr = `${dateStr}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
        const endDate = new Date(new Date(startStr).getTime() + cutMs);
        const endStr = endDate.toISOString().slice(0, 19);

        const conflict = queryGet(`
          SELECT id FROM appointments
          WHERE barber_name = ? AND status IN ('Confirmed', 'Proposed')
          AND start_time < ? AND end_time > ?
        `, [BARBER_NAME, endStr, startStr]);

        if (!conflict) {
          return { start: startStr, end: endStr };
        }
      }
    }
  }

  return null;
}

module.exports = { runRetentionScan };
