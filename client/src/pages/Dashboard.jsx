import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import AppointmentRow from '../components/AppointmentRow';
import { getDashboardStats, runRetention, sendReminder, updateAppointment } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningRetention, setRunningRetention] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleRunRetention = async () => {
    setRunningRetention(true);
    try {
      await runRetention();
      await fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningRetention(false);
    }
  };

  const handleSendReminder = async (clientId) => {
    try {
      await sendReminder(clientId);
      await fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (apptId, newStatus) => {
    try {
      await updateAppointment(apptId, { status: newStatus });
      await fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your shop at a glance</p>
        </div>
        <button
          onClick={handleRunRetention}
          disabled={runningRetention}
          className="px-4 py-2 bg-barber-accent text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {runningRetention ? 'Running...' : 'Run Retention Scan'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="⚠️"
          label="Clients Overdue"
          value={stats.overdueCount}
          subtext="Need a nudge"
          color={stats.overdueCount > 0 ? 'bg-red-50' : 'bg-white'}
        />
        <StatCard
          icon="💰"
          label="Revenue at Risk"
          value={`$${stats.revenueAtRisk.toFixed(0)}`}
          subtext="Potential loss"
          color={stats.revenueAtRisk > 0 ? 'bg-yellow-50' : 'bg-white'}
        />
        <StatCard
          icon="📅"
          label="Today's Bookings"
          value={stats.todayCount}
          subtext={new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        />
        <StatCard
          icon="👤"
          label="Total Clients"
          value={stats.totalClients}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Clients */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Clients</h2>
          {stats.overdueClients.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center text-green-700">
              All clients are on track! No overdue reminders needed.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.overdueClients.map(client => {
                const daysSince = Math.floor(
                  (Date.now() - new Date(client.last_visit_date).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={client.id} className="bg-white rounded-lg border border-red-100 p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">
                        {daysSince} days since last visit · Usually every {client.preferred_cadence}d
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendReminder(client.id)}
                      className="text-xs px-3 py-1.5 bg-barber-accent text-white rounded-lg hover:bg-red-600"
                    >
                      Send Reminder
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Appointments */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h2>
          {stats.todayAppointments.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.todayAppointments.map(appt => (
                <AppointmentRow key={appt.id} appt={appt} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
