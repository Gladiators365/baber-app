import React from 'react';

const statusColors = {
  overdue: 'bg-red-100 text-red-800 border-red-200',
  due_soon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  on_track: 'bg-green-100 text-green-800 border-green-200',
};

const statusLabels = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  on_track: 'On Track',
};

export default function ClientCard({ client, onSendReminder, onEdit }) {
  const status = client.retention_status || 'on_track';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{client.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{client.phone_number}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <span>Every {client.preferred_cadence} days</span>
        <span>·</span>
        <span>{client.days_since_visit != null ? `${client.days_since_visit}d ago` : 'No visits'}</span>
        <span>·</span>
        <span>${client.avg_ticket?.toFixed(2)}</span>
      </div>

      <div className="mt-3 flex gap-2">
        {status === 'overdue' && (
          <button
            onClick={() => onSendReminder(client.id)}
            className="text-xs px-3 py-1.5 bg-barber-accent text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Send Reminder
          </button>
        )}
        <button
          onClick={() => onEdit(client)}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
