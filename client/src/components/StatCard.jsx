import React from 'react';

export default function StatCard({ icon, label, value, subtext, color = 'bg-white', onClick }) {
  return (
    <div
      className={`${color} rounded-xl shadow-sm border border-gray-100 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {subtext && <span className="text-xs text-gray-500">{subtext}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
