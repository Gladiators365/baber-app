import React, { useState, useEffect } from 'react';
import ClientCard from '../components/ClientCard';
import { getClients, createClient, updateClient, deleteClient, sendReminder } from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone_number: '', preferred_cadence: 14, avg_ticket: 35 });
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      setClients(await getClients());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone_number: '', preferred_cadence: 14, avg_ticket: 35 });
    setError('');
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.name,
      phone_number: client.phone_number,
      preferred_cadence: client.preferred_cadence,
      avg_ticket: client.avg_ticket,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateClient(editing.id, form);
      } else {
        await createClient(form);
      }
      setShowModal(false);
      fetchClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this client?')) return;
    try {
      await deleteClient(id);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReminder = async (clientId) => {
    try {
      await sendReminder(clientId);
      alert('Reminder sent!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading clients...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">{clients.length} total clients</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-barber-dark text-white rounded-lg hover:bg-gray-800">
          + Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onSendReminder={handleReminder}
            onEdit={openEdit}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Client' : 'Add New Client'}</h2>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent focus:border-transparent outline-none"
                  placeholder="John Davis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel" required value={form.phone_number}
                  onChange={e => setForm({ ...form, phone_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent focus:border-transparent outline-none"
                  placeholder="+15551234567"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cadence (days)</label>
                  <input
                    type="number" min="1" value={form.preferred_cadence}
                    onChange={e => setForm({ ...form, preferred_cadence: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avg. Ticket ($)</label>
                  <input
                    type="number" min="0" step="0.01" value={form.avg_ticket}
                    onChange={e => setForm({ ...form, avg_ticket: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-barber-accent focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-barber-accent text-white rounded-lg hover:bg-red-600">
                  {editing ? 'Save Changes' : 'Add Client'}
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
