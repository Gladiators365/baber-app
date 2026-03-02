/**
 * SMS Service — Stubbed for development.
 * When TWILIO_ACCOUNT_SID is set in .env, switches to real Twilio.
 */

let twilioClient = null;
const TWILIO_ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

if (TWILIO_ENABLED) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('SMS Service: Twilio LIVE mode enabled');
} else {
  console.log('SMS Service: STUB mode (messages logged to console)');
}

/**
 * Send an SMS message.
 * @param {object} locals - app.locals with queryAll, queryGet, runSql helpers
 * @param {object} opts
 */
async function sendSMS(locals, { clientId, to, body, messageType }) {
  const { runSql } = locals;

  // Log to automation_logs
  runSql(
    `INSERT INTO automation_logs (client_id, message_type, message_body, direction) VALUES (?, ?, ?, 'outbound')`,
    [clientId, messageType, body]
  );

  if (TWILIO_ENABLED) {
    try {
      const message = await twilioClient.messages.create({
        body, to, from: process.env.TWILIO_PHONE_NUMBER
      });
      console.log(`[SMS SENT] To: ${to} | SID: ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      console.error(`[SMS ERROR] To: ${to} | Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('  STUB SMS');
    console.log(`  To:   ${to}`);
    console.log(`  Type: ${messageType}`);
    console.log(`  Body: ${body}`);
    console.log('='.repeat(60) + '\n');
    return { success: true, stub: true };
  }
}

module.exports = { sendSMS, TWILIO_ENABLED };
