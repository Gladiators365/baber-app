/**
 * Scheduler — wraps node-cron to run the retention engine.
 */

const cron = require('node-cron');
const { runRetentionScan } = require('./retentionEngine');

const RETENTION_CRON = process.env.RETENTION_CRON || '0 10 * * *';

function startScheduler(locals) {
  if (!cron.validate(RETENTION_CRON)) {
    console.error(`[Scheduler] Invalid cron expression: ${RETENTION_CRON}`);
    return;
  }

  console.log(`[Scheduler] Retention engine scheduled: ${RETENTION_CRON}`);

  cron.schedule(RETENTION_CRON, async () => {
    try {
      await runRetentionScan(locals);
    } catch (err) {
      console.error('[Scheduler] Retention scan failed:', err.message);
    }
  });
}

module.exports = { startScheduler, runRetentionScan };
