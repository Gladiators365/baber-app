# Barber APP

Client retention & automated booking system for barbers. Tracks client visit frequency, sends automated "you're due" SMS reminders, and handles two-way text booking.

## Quick Start

### 1. Start the API Server

```bash
cd server
npm install
cp .env.example .env     # Edit .env if you want to customize
npm start
```

The server starts at `http://localhost:3001`. It auto-creates the database and seeds demo data on first run.

### 2. Start the React Dashboard

```bash
cd client
npm install
npm start
```

Opens at `http://localhost:3000`.

## Features

- **Dashboard** — Revenue at risk, overdue clients, today's bookings
- **Client Management** — Add/edit clients with preferred visit cadence
- **Appointment Booking** — Create, confirm, complete appointments with conflict detection
- **Retention Engine** — Daily scan finds overdue clients and auto-proposes next available slot
- **Two-Way SMS** — Clients reply "YES" to confirm, "NO" to decline. NLP handles "yeah", "sure", "ok", etc.
- **Stubbed SMS** — Messages log to console by default. Add Twilio credentials to `.env` to go live.

## Plugging In Twilio

Edit `server/.env`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

Set your Twilio webhook URL to: `https://your-domain.com/api/sms/inbound`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Dashboard overview |
| GET/POST/PUT/DELETE | /api/clients | Client CRUD |
| GET/POST/PUT/DELETE | /api/appointments | Appointment CRUD |
| GET | /api/appointments/slots/:date | Available time slots |
| POST | /api/sms/inbound | Twilio webhook (inbound texts) |
| POST | /api/sms/send-reminder | Manual reminder trigger |
| POST | /api/sms/run-retention | Manual retention scan |

## Configuration (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | API server port |
| DEFAULT_BARBER_NAME | Mark | Barber name used in messages |
| DEFAULT_CUT_DURATION_MINUTES | 45 | Appointment duration |
| DEFAULT_PRICE | 35.00 | Default ticket price |
| RETENTION_CRON | 0 10 * * * | When the retention engine runs (10 AM daily) |
| REMINDER_COOLDOWN_DAYS | 3 | Min days between reminders to same client |
