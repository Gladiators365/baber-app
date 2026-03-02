/**
 * SMS Routes — handles inbound Twilio webhooks and manual triggers.
 */
const express = require('express');
const router = express.Router();
const { parseIntent } = require('../utils/nlp');
const { sendSMS } = require('../services/smsService');

/**
 * POST /api/sms/inbound — Twilio webhook for incoming texts.
 */
router.post('/inbound', async (req, res) => {
  const { queryGet, runSql } = req.app.locals;
  const from = req.body.From || req.body.from;
  const body = req.body.Body || req.body.body;

  if (!from || !body) {
    return res.status(400).json({ error: 'From and Body are required' });
  }

  console.log(`[SMS Inbound] From: ${from} | Body: "${body}"`);

  const client = queryGet('SELECT * FROM clients WHERE phone_number = ?', [from]);
  if (!client) {
    console.log(`[SMS Inbound] Unknown number: ${from}`);
    return res.status(200).json({ message: 'Unknown sender' });
  }

  // Log inbound
  runSql(
    `INSERT INTO automation_logs (client_id, message_type, message_body, direction) VALUES (?, 'Confirmation', ?, 'inbound')`,
    [client.id, body]
  );

  const { intent } = parseIntent(body);
  console.log(`[SMS Inbound] Client: ${client.name} | Intent: ${intent}`);

  if (intent === 'confirm') {
    const proposed = queryGet(
      `SELECT * FROM appointments WHERE client_id = ? AND status = 'Proposed' ORDER BY created_at DESC LIMIT 1`,
      [client.id]
    );

    if (!proposed) {
      await sendSMS(req.app.locals, {
        clientId: client.id, to: from,
        body: `Hey ${client.name.split(' ')[0]}, we don't have a pending slot for you right now. Give us a call to book!`,
        messageType: 'Confirmation'
      });
      return res.status(200).json({ action: 'no_proposed_slot' });
    }

    runSql(`UPDATE appointments SET status = 'Confirmed' WHERE id = ?`, [proposed.id]);

    const apptDate = new Date(proposed.start_time);
    const dayName = apptDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = apptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    await sendSMS(req.app.locals, {
      clientId: client.id, to: from,
      body: `Got it! You're all set for ${dayName} at ${timeStr}. See you then!`,
      messageType: 'Confirmation'
    });

    return res.status(200).json({ action: 'confirmed', appointment_id: proposed.id });

  } else if (intent === 'decline') {
    const proposed = queryGet(
      `SELECT * FROM appointments WHERE client_id = ? AND status = 'Proposed' ORDER BY created_at DESC LIMIT 1`,
      [client.id]
    );
    if (proposed) {
      runSql(`UPDATE appointments SET status = 'Cancelled' WHERE id = ?`, [proposed.id]);
    }

    await sendSMS(req.app.locals, {
      clientId: client.id, to: from,
      body: `No worries, ${client.name.split(' ')[0]}! We'll check in with you again soon.`,
      messageType: 'Cancellation'
    });
    return res.status(200).json({ action: 'declined' });

  } else if (intent === 'reschedule') {
    await sendSMS(req.app.locals, {
      clientId: client.id, to: from,
      body: `Sure thing! Give us a call and we'll find a better time for you.`,
      messageType: 'Confirmation'
    });
    return res.status(200).json({ action: 'reschedule_requested' });

  } else {
    await sendSMS(req.app.locals, {
      clientId: client.id, to: from,
      body: `Hey ${client.name.split(' ')[0]}, reply YES to confirm your spot or NO to skip. You can also call us to reschedule.`,
      messageType: 'Confirmation'
    });
    return res.status(200).json({ action: 'unknown_intent' });
  }
});

/**
 * POST /api/sms/send-reminder — Manual reminder for a specific client.
 */
router.post('/send-reminder', async (req, res) => {
  const { queryGet } = req.app.locals;
  const { client_id } = req.body;

  const client = queryGet('SELECT * FROM clients WHERE id = ?', [client_id]);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const daysSince = Math.floor(
    (Date.now() - new Date(client.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const body = `Hey ${client.name.split(' ')[0]}, it's been ${daysSince} days! Ready for a fresh cut? Reply YES and we'll get you booked.`;

  await sendSMS(req.app.locals, {
    clientId: client.id, to: client.phone_number, body, messageType: 'Retention'
  });

  res.json({ message: 'Reminder sent', client: client.name });
});

/**
 * POST /api/sms/run-retention — Manual retention scan trigger.
 */
router.post('/run-retention', async (req, res) => {
  const { runRetentionScan } = require('../services/retentionEngine');
  try {
    const count = await runRetentionScan(req.app.locals);
    res.json({ message: `Retention scan complete. ${count} client(s) contacted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
