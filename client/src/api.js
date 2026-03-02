const API_BASE = process.env.REACT_APP_API_URL || '/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
          headers: { 'Content-Type': 'application/json', ...options.headers },
          ...options,
    });
    if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

// Dashboard
export const getDashboardStats = () => request('/dashboard/stats');

// Clients
export const getClients = () => request('/clients');
export const getClient = (id) => request(`/clients/${id}`);
export const createClient = (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteClient = (id) => request(`/clients/${id}`, { method: 'DELETE' });

// Appointments
export const getAppointments = (params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/appointments${query}`);
};
export const createAppointment = (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const updateAppointment = (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: 'DELETE' });

// Slots
export const getSlots = (date) => request(`/appointments/slots/${date}`);

// SMS
export const sendReminder = (clientId) => request('/sms/send-reminder', { method: 'POST', body: JSON.stringify({ clientId }) });
export const runRetention = () => request('/sms/run-retention', { method: 'POST' });
