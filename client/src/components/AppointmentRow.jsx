import React from 'react';

const statusStyles = {
  Proposed: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  Completed: 'bg-gray-100 text-gray-800',
  'No-show': 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-500',
};

export default function AppointmentRow({ appt, onStatusChange }) {
  const start = new Date(appt.start_time);
  const dateStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[60px]">
          <div className="text-xs text-gray-500">{dateStr.split(',')[0]}</div>
          <div className="text-lg font-bold text-gray-900">{start.getDate()}</div>
        </div>
        <div>
          <div className="font-medium text-gray-900">{appt.client_name}</div>
          <div className="text-sm text-gray-500">{timeStr} with {appt.barber_name}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[appt.status]}`}>
          {appt.status}
        </span>
        {appt.status === 'Proposed' && (
          <button
            onClick={() => onStatusChange(appt.id, 'Confirmed')}
            className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Confirm
          </button>
        )}
        {appt.status === 'Confirmed' && (
          <button
            onClick={() => onStatusChange(appt.id, 'Completed')}
            className="text-xs px-3 py-1 bg-barber-dark text-white rounded hover:bg-gray-800"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
