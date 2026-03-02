import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/clients', label: 'Clients', icon: '👤' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-barber-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💈</span>
            <span className="text-xl font-bold tracking-tight">Barber APP</span>
          </div>
          <div className="flex gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-barber-accent text-white'
                    : 'text-gray-300 hover:bg-barber-mid hover:text-white'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
