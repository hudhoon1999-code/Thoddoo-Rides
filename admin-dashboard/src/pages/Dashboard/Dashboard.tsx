// admin-dashboard/src/pages/Dashboard/Dashboard.tsx
// ============================================================
// ADMIN DASHBOARD — Overview metrics
// ============================================================

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MOCK_STATS = {
  todayRides: 47,
  activeDrivers: 8,
  totalPassengers: 234,
  pendingApprovals: 3,
  todayRevenue: 1880,
  weekRevenue: 11240,
};

const RIDE_DATA = [
  { day: 'Mon', rides: 32, revenue: 1280 },
  { day: 'Tue', rides: 41, revenue: 1640 },
  { day: 'Wed', rides: 38, revenue: 1520 },
  { day: 'Thu', rides: 55, revenue: 2200 },
  { day: 'Fri', rides: 62, revenue: 2480 },
  { day: 'Sat', rides: 78, revenue: 3120 },
  { day: 'Sun', rides: 47, revenue: 1880 },
];

const PENDING_DRIVERS = [
  { id: '1', name: 'Mohamed Ali', phone: '+9601234567', type: 'Maldivian', vehicle: 'Buggy 6-Seat', appliedAt: '2h ago' },
  { id: '2', name: 'Sergei Petrov', phone: '+7912345678', type: 'Foreign', vehicle: 'Motorcycle', appliedAt: '5h ago' },
  { id: '3', name: 'Ibrahim Hassan', phone: '+9607654321', type: 'Maldivian', vehicle: 'Buggy 12-Seat', appliedAt: '1d ago' },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-900">Dashboard 🏝</h1>
        <p className="text-ocean-600 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard emoji="🚐" label="Today's Rides" value={MOCK_STATS.todayRides} color="teal" />
        <StatCard emoji="🟢" label="Active Drivers" value={MOCK_STATS.activeDrivers} color="green" />
        <StatCard emoji="👥" label="Passengers" value={MOCK_STATS.totalPassengers} color="blue" />
        <StatCard emoji="⏳" label="Pending Approvals" value={MOCK_STATS.pendingApprovals} color="orange" urgent />
        <StatCard emoji="💰" label="Today Revenue" value={`MVR ${MOCK_STATS.todayRevenue}`} color="teal" />
        <StatCard emoji="📈" label="Week Revenue" value={`MVR ${MOCK_STATS.weekRevenue}`} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rides chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
          <h2 className="text-lg font-semibold text-ocean-900 mb-4">Rides This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={RIDE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#0E7490' }} />
              <YAxis tick={{ fontSize: 12, fill: '#0E7490' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #1CC7C1' }}
              />
              <Bar dataKey="rides" fill="#1CC7C1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
          <h2 className="text-lg font-semibold text-ocean-900 mb-4">Revenue (MVR)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={RIDE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#0E7490' }} />
              <YAxis tick={{ fontSize: 12, fill: '#0E7490' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #FF7A59' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF7A59"
                strokeWidth={3}
                dot={{ fill: '#FF7A59', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ocean-900">
            ⏳ Pending Driver Approvals
            <span className="ml-2 bg-orange-100 text-orange-700 text-sm font-bold px-2 py-0.5 rounded-full">
              {MOCK_STATS.pendingApprovals}
            </span>
          </h2>
          <a href="/drivers" className="text-teal-600 text-sm font-semibold hover:underline">
            View All →
          </a>
        </div>

        <div className="space-y-3">
          {PENDING_DRIVERS.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center justify-between p-4 bg-sand-50 rounded-xl border border-sand-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">
                  {driver.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-ocean-900">{driver.name}</div>
                  <div className="text-sm text-ocean-500">{driver.phone} · {driver.vehicle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  driver.type === 'Maldivian'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {driver.type}
                </span>
                <span className="text-xs text-ocean-400">{driver.appliedAt}</span>
                <button className="bg-teal-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  emoji: string;
  label: string;
  value: string | number;
  color: 'teal' | 'green' | 'blue' | 'orange';
  urgent?: boolean;
}

function StatCard({ emoji, label, value, color, urgent }: StatCardProps) {
  const colorMap = {
    teal: 'from-teal-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-amber-600',
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${
      urgent ? 'border-orange-200' : 'border-teal-100'
    }`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className={`text-xl font-bold bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-xs text-ocean-500 mt-1 font-medium">{label}</div>
    </div>
  );
}
