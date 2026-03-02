import React, { useState, useEffect } from 'react';
import AppointmentRow from '../components/AppointmentRow';
import { getAppointments, createAppointment, updateAppointment, getClients } from '../api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', start_time: '', barber_name: 'Mark' });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');

  const fetchData = async () => {
    try {
      const [appts, cls] = await Promise.all([getAppointments(), getClients()]);
      setAppointments(appts);
      setClients(cls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (apptId, newStatus) => {
    try {
      await updateAppointment(apptId, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAppointment(form);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = appointments.filter(a => {
    const now = new Date();
    const start = new Date(a.start_time);
    if (filter === 'upcoming') return start >= now && a.status !== 'Cancelled';
    if (filter === 'past') return start < now;
    if (filter === 'proposed') return a.status === 'Proposed';
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading appointments...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">{filtered.length} {filter} appointments</p>
        </div>
        <button onClick={() => { setError(''); setShowModal(true); }} className="px-4 py-2 bg-barber-dark text-white rounded-lg hover:bg-gray-800">
          + Book Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['upcoming', 'proposed', 'past', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
              filter === f
                ? 'bg-barber-dark text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No {filter} appointments found.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(appt => (
            <AppointmentRow key={appt.id} appt={appt} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold mb-4">Book Appointment</h2>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  required value={form.client_id}
                  onChange={e => setForm({ ...form, client_id: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent outline-none"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local" required value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barber</label>
                <input
                  type="text" value={form.barber_name}
                  onChange={e => setForm({ ...form, barber_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-barber-accent text-white rounded-lg hover:bg-red-600">
                  Book It
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
