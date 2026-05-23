// admin-dashboard/src/pages/Drivers/DriversPage.tsx
// ============================================================
// DRIVERS PAGE — Manage, approve, suspend drivers
// ============================================================

import { useState } from 'react';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

const MOCK_DRIVERS = [
  {
    id: '1', name: 'Jamaal Ibrahim', driverCode: 'THD-4022',
    phone: '+9601234567', nationality: 'Maldivian', status: 'approved',
    vehicle: 'Buggy 6-Seat', rating: 4.8, rides: 340, earnings: 12500,
    appliedAt: '2025-01-10', approvedAt: '2025-01-11',
  },
  {
    id: '2', name: 'Mohamed Ali', driverCode: 'THD-4023',
    phone: '+9607654321', nationality: 'Maldivian', status: 'pending',
    vehicle: 'Motorcycle', rating: null, rides: 0, earnings: 0,
    appliedAt: '2025-01-18', approvedAt: null,
  },
  {
    id: '3', name: 'Sergei Petrov', driverCode: 'THD-4024',
    phone: '+7912345678', nationality: 'Foreign', status: 'pending',
    vehicle: 'Buggy 12-Seat', rating: null, rides: 0, earnings: 0,
    appliedAt: '2025-01-17', approvedAt: null,
  },
  {
    id: '4', name: 'Ahmed Rasheed', driverCode: 'THD-4019',
    phone: '+9609876543', nationality: 'Maldivian', status: 'suspended',
    vehicle: 'Buggy 6-Seat', rating: 3.2, rides: 45, earnings: 1800,
    appliedAt: '2025-01-02', approvedAt: '2025-01-03',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700' },
  suspended: { label: 'Suspended', bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function DriversPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchesFilter = filter === 'all' || d.status === filter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.driverCode.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = MOCK_DRIVERS.filter(d => d.status === 'pending').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ocean-900">Drivers 🚐</h1>
          <p className="text-ocean-600 mt-1">{MOCK_DRIVERS.length} total drivers</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold">
            ⏳ {pendingCount} awaiting approval
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2.5 bg-white border border-teal-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        {(['all', 'pending', 'approved', 'suspended'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-teal-100 text-ocean-600 hover:bg-teal-50'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-ocean-50 border-b border-teal-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Driver</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Vehicle</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Stats</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Applied</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-ocean-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-50">
            {filtered.map((driver) => {
              const statusCfg = STATUS_CONFIG[driver.status as keyof typeof STATUS_CONFIG];
              return (
                <tr key={driver.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-ocean-600 rounded-full flex items-center justify-center text-white font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-ocean-900">{driver.name}</div>
                        <div className="text-sm text-ocean-500">{driver.phone} · {driver.driverCode}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          driver.nationality === 'Maldivian'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {driver.nationality}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-ocean-700">{driver.vehicle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {driver.rating ? (
                      <div className="text-sm">
                        <div>⭐ {driver.rating} · {driver.rides} rides</div>
                        <div className="text-ocean-500">MVR {driver.earnings}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-ocean-400">Not yet started</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-ocean-500">
                    {driver.appliedAt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {driver.status === 'pending' && (
                        <>
                          <button className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium">
                            ✓ Approve
                          </button>
                          <button className="bg-red-100 text-red-700 text-sm px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium">
                            ✗ Reject
                          </button>
                        </>
                      )}
                      {driver.status === 'approved' && (
                        <button className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          Suspend
                        </button>
                      )}
                      {driver.status === 'suspended' && (
                        <button className="bg-teal-100 text-teal-700 text-sm px-3 py-1.5 rounded-lg hover:bg-teal-200 transition-colors font-medium">
                          Reinstate
                        </button>
                      )}
                      <button className="text-ocean-400 hover:text-ocean-600 text-sm px-2 py-1.5">
                        View →
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
