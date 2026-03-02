import { useState, useEffect } from "react";

const clients = [
  { id: 1, name: "Jordan Webb", phone: "919-555-0101", cadence: 14, lastVisit: 16, nextAppt: null, status: "overdue", avatar: "JW", revenue: 35 },
  { id: 2, name: "Marcus Hill", phone: "919-555-0234", cadence: 7, lastVisit: 6, nextAppt: "Mar 1, 2:00 PM", status: "upcoming", avatar: "MH", revenue: 40 },
  { id: 3, name: "Devon Carter", phone: "919-555-0312", cadence: 21, lastVisit: 22, nextAppt: null, status: "overdue", avatar: "DC", revenue: 45 },
  { id: 4, name: "Trey Simmons", phone: "919-555-0445", cadence: 14, lastVisit: 12, nextAppt: "Mar 3, 11:00 AM", status: "upcoming", avatar: "TS", revenue: 35 },
  { id: 5, name: "Khalil Reyes", phone: "919-555-0567", cadence: 7, lastVisit: 8, nextAppt: null, status: "overdue", avatar: "KR", revenue: 40 },
  { id: 6, name: "Aaron Brooks", phone: "919-555-0678", cadence: 14, lastVisit: 3, nextAppt: "Mar 2, 4:00 PM", status: "upcoming", avatar: "AB", revenue: 35 },
  { id: 7, name: "Dante Owens", phone: "919-555-0789", cadence: 21, lastVisit: 19, nextAppt: null, status: "safe", avatar: "DO", revenue: 50 },
  { id: 8, name: "Jamal Pierce", phone: "919-555-0890", cadence: 7, lastVisit: 4, nextAppt: "Mar 1, 10:00 AM", status: "upcoming", avatar: "JP", revenue: 40 },
];

const slots = ["Tomorrow 9:00 AM", "Tomorrow 11:00 AM", "Tomorrow 2:00 PM", "Tomorrow 4:00 PM", "Mar 2, 10:00 AM", "Mar 2, 1:00 PM"];

const SMS_TEMPLATES = {
  overdue: (name, days, slot) =>
    `Hey ${name}, it's been ${days} days! Mark has an opening ${slot}. Reply YES to grab it 💈`,
  vip: (name, slot) =>
    `Hey ${name}! Your usual spot is open — ${slot}. Reply YES to lock it in 💈`,
};

const LOG_MESSAGES = [
  { time: "10:02 AM", client: "Jordan Webb", type: "Retention", msg: "Sent 14-day nudge" },
  { time: "10:02 AM", client: "Devon Carter", type: "Retention", msg: "Sent 21-day nudge" },
  { time: "10:02 AM", client: "Khalil Reyes", type: "Retention", msg: "Sent 7-day nudge" },
  { time: "9:45 AM", client: "Marcus Hill", type: "Confirmation", msg: "Replied YES → Booked Mar 1 2:00 PM" },
  { time: "9:30 AM", client: "Jamal Pierce", type: "VIP Invite", msg: "Secure your spot sent" },
];

export default function BarberDash() {
  const [view, setView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [smsModal, setSmsModal] = useState(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [logs, setLogs] = useState(LOG_MESSAGES);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTicker(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const overdue = clients.filter(c => c.status === "overdue");
  const upcoming = clients.filter(c => c.status === "upcoming");
  const revenueAtRisk = overdue.reduce((s, c) => s + c.revenue, 0);

  function openSMS(client) {
    setSmsModal({ client, slot: slots[0], template: "overdue", message: SMS_TEMPLATES.overdue(client.name, client.lastVisit, slots[0]) });
  }

  function sendSMS() {
    const entry = { time: "Now", client: smsModal.client.name, type: "Retention", msg: `Sent nudge → ${smsModal.slot}` };
    setLogs(l => [entry, ...l]);
    setSentMessages(s => [...s, smsModal.client.id]);
    setSmsModal(null);
  }

  function simulateReply() {
    setBookedSlot(smsModal?.slot || slots[0]);
    setShowConfirm(true);
    setSmsModal(null);
  }

  const statusColor = {
    overdue: "#FF4D4D",
    upcoming: "#00E5A0",
    safe: "#FFB800",
  };

  const statusLabel = {
    overdue: "OVERDUE",
    upcoming: "BOOKED",
    safe: "ON TRACK",
  };

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", background: "#0A0A0A", minHeight: "100vh", color: "#F0EDE6" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; }
        .body-text { font-family: 'DM Sans', sans-serif; }
        .card { background: #141414; border: 1px solid #222; border-radius: 2px; }
        .btn { cursor: pointer; border: none; font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; transition: all 0.15s; }
        .btn:hover { transform: translateY(-1px); }
        .nav-btn { background: transparent; color: #888; padding: 8px 20px; font-size: 16px; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .nav-btn.active { color: #F0EDE6; border-bottom: 2px solid #D4A853; }
        .client-row { transition: background 0.15s; cursor: pointer; }
        .client-row:hover { background: #1C1C1C; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .slide-in { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 1.5px; padding: 2px 8px; border-radius: 2px; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1E1E1E", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 0" }}>
          <div style={{ fontSize: 28, color: "#D4A853" }}>💈</div>
          <div>
            <div style={{ fontSize: 26, letterSpacing: 3 }}>MARK'S CUTS</div>
            <div className="body-text" style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginTop: -4 }}>RETENTION ENGINE v1.0</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["dashboard", "clients", "sms log"].map(v => (
            <button key={v} className={`btn nav-btn ${view === v ? "active" : ""}`} style={{ textTransform: "uppercase", fontSize: 14 }} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
        <div className="body-text" style={{ fontSize: 13, color: "#555" }}>
          Fri Feb 27 • 10:02 AM
        </div>
      </div>

      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div className="slide-in">
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "OVERDUE CLIENTS", value: overdue.length, color: "#FF4D4D", sub: "Need a nudge" },
                { label: "REVENUE AT RISK", value: `$${revenueAtRisk}`, color: "#D4A853", sub: "This week" },
                { label: "UPCOMING APPTS", value: upcoming.length, color: "#00E5A0", sub: "Next 7 days" },
                { label: "SMS SENT TODAY", value: logs.filter(l => l.time.includes("AM") || l.time.includes("PM")).length, color: "#6B8CFF", sub: "Automated" },
              ].map(stat => (
                <div key={stat.label} className="card" style={{ padding: "24px 20px" }}>
                  <div className="body-text" style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 42, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div className="body-text" style={{ fontSize: 12, color: "#444", marginTop: 6 }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue at Risk Banner */}
            <div className="card" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: "3px solid #FF4D4D" }}>
              <div>
                <div className="body-text" style={{ fontWeight: 500, fontSize: 15, color: "#F0EDE6" }}>
                  {overdue.length} clients overdue — <span style={{ color: "#FF4D4D" }}>${revenueAtRisk} in potential revenue sitting on the table.</span>
                </div>
                <div className="body-text" style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Daily retention engine ran at 10:00 AM • All nudges queued</div>
              </div>
              <button className="btn body-text" style={{ background: "#FF4D4D", color: "#fff", padding: "10px 24px", fontSize: 13, fontWeight: 500, borderRadius: 2 }}
                onClick={() => setView("clients")}>
                Send All Nudges →
              </button>
            </div>

            {/* Overdue Clients */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 18, letterSpacing: 2 }}>OVERDUE</div>
                  <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4D4D" }} />
                </div>
                {overdue.map(c => (
                  <div key={c.id} className="client-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderBottom: "1px solid #1A1A1A" }}
                    onClick={() => openSMS(c)}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#D4A853", flexShrink: 0, border: "1px solid #2A2A2A" }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="body-text" style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                      <div className="body-text" style={{ fontSize: 12, color: "#555" }}>{c.lastVisit} days ago • every {c.cadence} days</div>
                    </div>
                    <div>
                      <div className="body-text" style={{ fontSize: 11, color: "#FF4D4D", textAlign: "right" }}>+{c.lastVisit - c.cadence}d late</div>
                      <div className="body-text" style={{ fontSize: 11, color: "#444", textAlign: "right" }}>${c.revenue}</div>
                    </div>
                    {sentMessages.includes(c.id)
                      ? <span className="tag" style={{ background: "#1A2E1A", color: "#00E5A0" }}>SENT</span>
                      : <span className="tag" style={{ background: "#2E1A1A", color: "#FF4D4D" }}>NUDGE →</span>
                    }
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 18, letterSpacing: 2, marginBottom: 20 }}>UPCOMING</div>
                {upcoming.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderBottom: "1px solid #1A1A1A" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1A2E1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#00E5A0", flexShrink: 0, border: "1px solid #223322" }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="body-text" style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                      <div className="body-text" style={{ fontSize: 12, color: "#555" }}>{c.nextAppt}</div>
                    </div>
                    <span className="tag" style={{ background: "#1A2E1A", color: "#00E5A0" }}>BOOKED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS VIEW */}
        {view === "clients" && (
          <div className="slide-in">
            <div style={{ fontSize: 22, letterSpacing: 3, marginBottom: 24 }}>ALL CLIENTS</div>
            <div className="card">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #222" }}>
                    {["Client", "Phone", "Cadence", "Last Visit", "Status", "Action"].map(h => (
                      <th key={h} className="body-text" style={{ padding: "14px 20px", textAlign: "left", fontSize: 10, color: "#444", letterSpacing: 2, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} className="client-row" style={{ borderBottom: "1px solid #161616" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}33` }}>
                            {c.avatar}
                          </div>
                          <span className="body-text" style={{ fontWeight: 500 }}>{c.name}</span>
                        </div>
                      </td>
                      <td className="body-text" style={{ padding: "14px 20px", color: "#555", fontSize: 13 }}>{c.phone}</td>
                      <td className="body-text" style={{ padding: "14px 20px", color: "#666", fontSize: 13 }}>Every {c.cadence}d</td>
                      <td className="body-text" style={{ padding: "14px 20px", fontSize: 13, color: c.lastVisit > c.cadence ? "#FF4D4D" : "#888" }}>
                        {c.lastVisit} days ago
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className="tag" style={{ background: statusColor[c.status] + "22", color: statusColor[c.status] }}>
                          {statusLabel[c.status]}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {c.status === "overdue" && (
                          sentMessages.includes(c.id)
                            ? <span className="body-text" style={{ fontSize: 12, color: "#00E5A0" }}>✓ Nudge sent</span>
                            : <button className="btn body-text" style={{ background: "#FF4D4D22", color: "#FF4D4D", padding: "6px 14px", fontSize: 12, borderRadius: 2, border: "1px solid #FF4D4D44" }}
                                onClick={() => openSMS(c)}>
                                Send Nudge
                              </button>
                        )}
                        {c.status === "upcoming" && (
                          <span className="body-text" style={{ fontSize: 12, color: "#444" }}>{c.nextAppt}</span>
                        )}
                        {c.status === "safe" && (
                          <span className="body-text" style={{ fontSize: 12, color: "#444" }}>Due in {c.cadence - c.lastVisit}d</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SMS LOG VIEW */}
        {view === "sms log" && (
          <div className="slide-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div style={{ fontSize: 22, letterSpacing: 3 }}>AUTOMATION LOG</div>
              <div className="body-text" style={{ fontSize: 12, color: "#444" }}>Today • Feb 27</div>
            </div>
            <div className="card">
              {logs.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 24px", borderBottom: "1px solid #161616" }}>
                  <div className="body-text" style={{ fontSize: 12, color: "#444", minWidth: 70, marginTop: 2 }}>{l.time}</div>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#D4A853", flexShrink: 0 }}>
                    {clients.find(c => c.name === l.client)?.avatar || "??"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="body-text" style={{ fontWeight: 500, fontSize: 14 }}>{l.client}</div>
                    <div className="body-text" style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{l.msg}</div>
                  </div>
                  <span className="tag" style={{
                    background: l.type === "Confirmation" ? "#1A2E1A" : l.type === "VIP Invite" ? "#1A1E2E" : "#2A1E0A",
                    color: l.type === "Confirmation" ? "#00E5A0" : l.type === "VIP Invite" ? "#6B8CFF" : "#D4A853",
                  }}>{l.type.toUpperCase()}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="body-text" style={{ padding: 40, textAlign: "center", color: "#444" }}>No messages sent yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SMS COMPOSE MODAL */}
      {smsModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000CC", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card slide-in" style={{ width: 500, padding: 32, border: "1px solid #2A2A2A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 22, letterSpacing: 2 }}>COMPOSE NUDGE</div>
              <button className="btn body-text" style={{ background: "transparent", color: "#555", fontSize: 20 }} onClick={() => setSmsModal(null)}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "14px 16px", background: "#0D0D0D", borderRadius: 2 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1E1E1E", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4A853", fontSize: 13, border: "1px solid #2A2A2A" }}>
                {smsModal.client.avatar}
              </div>
              <div>
                <div className="body-text" style={{ fontWeight: 500 }}>{smsModal.client.name}</div>
                <div className="body-text" style={{ fontSize: 12, color: "#555" }}>{smsModal.client.phone} • Last visit {smsModal.client.lastVisit} days ago</div>
              </div>
            </div>

            <div className="body-text" style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>AVAILABLE SLOT</div>
            <select className="body-text" style={{ width: "100%", background: "#0D0D0D", color: "#F0EDE6", border: "1px solid #2A2A2A", padding: "10px 12px", fontSize: 14, marginBottom: 20, borderRadius: 2 }}
              value={smsModal.slot}
              onChange={e => setSmsModal(m => ({ ...m, slot: e.target.value, message: SMS_TEMPLATES.overdue(m.client.name, m.client.lastVisit, e.target.value) }))}>
              {slots.map(s => <option key={s}>{s}</option>)}
            </select>

            <div className="body-text" style={{ fontSize: 11, color: "#444", letterSpacing: 2, marginBottom: 8 }}>PREVIEW</div>
            <div style={{ background: "#0D0D0D", padding: 16, borderRadius: 2, border: "1px solid #1E1E1E", marginBottom: 24 }}>
              <div style={{ background: "#1C2E1C", borderRadius: "12px 12px 12px 2px", padding: "12px 14px", display: "inline-block", maxWidth: "80%" }}>
                <div className="body-text" style={{ fontSize: 13, lineHeight: 1.5, color: "#C8F0C8" }}>{smsModal.message}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn body-text" style={{ flex: 1, background: "#FF4D4D", color: "#fff", padding: "12px 0", fontSize: 14, fontWeight: 500, borderRadius: 2 }}
                onClick={sendSMS}>
                Send SMS
              </button>
              <button className="btn body-text" style={{ flex: 1, background: "#1A2A1A", color: "#00E5A0", padding: "12px 0", fontSize: 14, fontWeight: 500, borderRadius: 2, border: "1px solid #224422" }}
                onClick={simulateReply}>
                Simulate "YES" Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000CC", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="card slide-in" style={{ width: 400, padding: 40, textAlign: "center", border: "1px solid #224422" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 24, letterSpacing: 2, marginBottom: 12, color: "#00E5A0" }}>BOOKED!</div>
            <div className="body-text" style={{ color: "#888", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Client replied YES.<br />
              Appointment auto-confirmed for <strong style={{ color: "#F0EDE6" }}>{bookedSlot}</strong>.<br />
              Calendar updated. Confirmation SMS sent. 💈
            </div>
            <button className="btn body-text" style={{ background: "#00E5A0", color: "#000", padding: "12px 32px", fontSize: 14, fontWeight: 600, borderRadius: 2 }}
              onClick={() => { setShowConfirm(false); setView("sms log"); }}>
              View Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
