/**
 * Simple NLP intent parser for SMS replies.
 * Recognizes affirmative, negative, and unknown intents.
 */

const AFFIRM_PATTERNS = [
  /^y(es|eah|ep|up|a)?$/i,
  /^ok(ay)?$/i,
  /^sure$/i,
  /^confirm(ed)?$/i,
  /^book\s*(it|me)?$/i,
  /^(do\s*it|let'?s?\s*go|i'?m?\s*(in|down)|bet|sounds?\s*good|perfect)$/i,
  /^(absolutely|definitely|for\s*sure|of\s*course)$/i,
];

const DECLINE_PATTERNS = [
  /^n(o|ah|ope)?$/i,
  /^cancel/i,
  /^(not?\s*(now|today|this\s*time)|pass|skip|nah)$/i,
  /^(i'?m?\s*(good|busy)|can'?t|don'?t)$/i,
];

const RESCHEDULE_PATTERNS = [
  /^(reschedule|different\s*time|another\s*day|later|change)/i,
  /^(can\s*(i|we)\s*(get|do)\s*(a\s*)?(different|another|later))/i,
];

/**
 * Parse an SMS body and return the detected intent.
 * @param {string} message - The raw SMS text
 * @returns {{ intent: 'confirm'|'decline'|'reschedule'|'unknown', confidence: number }}
 */
function parseIntent(message) {
  const text = (message || '').trim();

  for (const pattern of AFFIRM_PATTERNS) {
    if (pattern.test(text)) {
      return { intent: 'confirm', confidence: 0.95 };
    }
  }

  for (const pattern of DECLINE_PATTERNS) {
    if (pattern.test(text)) {
      return { intent: 'decline', confidence: 0.9 };
    }
  }

  for (const pattern of RESCHEDULE_PATTERNS) {
    if (pattern.test(text)) {
      return { intent: 'reschedule', confidence: 0.85 };
    }
  }

  return { intent: 'unknown', confidence: 0 };
}

module.exports = { parseIntent };
