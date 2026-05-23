import React, { useState } from 'react';
import { collection, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@shared/firebase/config';

interface Ride {
  id: string;
  passengerId: string;
  passengerName: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: number;
  commission: number;
  status: string;
  createdAt: any;
  completedAt: any;
  acceptedAt: any;
}

const C = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', green: '#2F855A', dark: '#0F172A',
  gray: '#64748B', light: '#F1F5F9', white: '#FFFFFF',
  amber: '#F59E0B', purple: '#7C3AED',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  searching:      { label: 'Searching',     color: C.amber,  bg: '#FFF8E7' },
  accepted:       { label: 'Accepted',      color: C.ocean,  bg: '#EFF9FB' },
  driver_arrived: { label: 'Driver Arrived',color: C.purple, bg: '#F5F0FF' },
  in_progress:    { label: 'In Progress',   color: C.teal,   bg: '#F0FFFE' },
  completed:      { label: 'Completed',     color: C.green,  bg: '#F0FFF4' },
  cancelled:      { label: 'Cancelled',     color: C.coral,  bg: '#FFF5F5' },
};

const VEHICLE_EMOJI: Record<string, string> = {
  motorcycle: '🛵',
  buggy_6: '🚐',
  buggy_12: '🚌',
  buggy: '🚐',
};

const s: Record<string, React.CSSProperties> = {
  page:       { padding: 32, fontFamily: 'Inter, sans-serif', color: C.dark },
  h1:         { fontSize: 26, fontWeight: 800, margin: '0 0 4px' },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 },
  statCard:   { background: C.white, borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  statVal:    { fontSize: 26, fontWeight: 800 },
  statLbl:    { fontSize: 12, color: C.gray, marginTop: 3 },
  controlRow: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const },
  searchBox:  { flex: 2, minWidth: 200, padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.light}`, fontSize: 14, outline: 'none' },
  sel:        { padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${C.light}`, fontSize: 14, background: C.white, outline: 'none' },
  table:      { width: '100%', borderCollapse: 'collapse' as const, background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' },
  th:         { padding: '13px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase' as const, letterSpacing: 0.6, background: C.light, borderBottom: `1px solid #E2E8F0` },
  td:         { padding: '13px 16px', fontSize: 13, borderBottom: `1px solid ${C.light}`, verticalAlign: 'middle' as const },
  badge:      { display: 'inline-block', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  viewBtn:    { background: C.ocean + '15', color: C.ocean, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  overlay:    { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  drawer:     { background: C.white, borderRadius: 20, padding: 32, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' as const },
  infoRow:    { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.light}`, fontSize: 14 },
  infoLabel:  { color: C.gray },
  infoVal:    { fontWeight: 600 },
  empty:      { textAlign: 'center' as const, padding: '60px 20px', color: C.gray },
};

export default function RidesPage() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [vehicleFilter, setVehicle] = useState('all');
  const [selected, setSelected]   = useState<Ride | null>(null);

  const q = query(collection(db, 'rides'), orderBy('createdAt', 'desc'));
  const [rides = [], loading] = useCollectionData(q, { idField: 'id' }) as [Ride[], boolean, any];

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = rides.filter((r) => {
    const matchSearch = !search ||
      r.passengerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      r.id.includes(search);
    const matchStatus  = statusFilter === 'all' || r.status === statusFilter;
    const matchVehicle = vehicleFilter === 'all' || r.vehicleType === vehicleFilter;
    return matchSearch && matchStatus && matchVehicle;
  });

  const completed   = rides.filter(r => r.status === 'completed');
  const totalRevenue = completed.reduce((s, r) => s + (r.fare || 0), 0);
  const totalComm    = completed.reduce((s, r) => s + (r.commission || 0), 0);

  return (
    <div style={s.page}>
      <h1 style={s.h1}>🚐 Rides</h1>
      <p style={{ color: C.gray, fontSize: 14, marginBottom: 24 }}>
        {rides.length} total rides · {completed.length} completed
      </p>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Rides', val: rides.length, color: C.teal },
          { label: 'Completed', val: completed.length, color: C.green },
          { label: 'Cancelled', val: rides.filter(r => r.status === 'cancelled').length, color: C.coral },
          { label: 'Revenue', val: `MVR ${totalRevenue.toFixed(0)}`, color: C.ocean },
          { label: 'Commission', val: `MVR ${totalComm.toFixed(0)}`, color: C.purple },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statVal, color: st.color }}>{st.val}</div>
            <div style={s.statLbl}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={s.controlRow}>
        <input
          style={s.searchBox}
          placeholder="Search by name, driver, or ride ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.sel} value={statusFilter} onChange={e => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select style={s.sel} value={vehicleFilter} onChange={e => setVehicle(e.target.value)}>
          <option value="all">All Vehicles</option>
          <option value="motorcycle">🛵 Motorcycle</option>
          <option value="buggy_6">🚐 Buggy 6-seat</option>
          <option value="buggy_12">🚌 Buggy 12-seat</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.empty}>Loading rides...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚐</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>No rides found</div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['#', 'Vehicle', 'Passenger', 'Driver', 'Route', 'Fare', 'Date', 'Status', ''].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.searching;
              return (
                <tr key={r.id}
                  onMouseEnter={e => (e.currentTarget.style.background = C.light)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...s.td, color: C.gray, fontFamily: 'monospace', fontSize: 11 }}>
                    {r.id.slice(0, 8)}
                  </td>
                  <td style={s.td}>{VEHICLE_EMOJI[r.vehicleType] || '🚐'}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{r.passengerName || '—'}</td>
                  <td style={s.td}>{r.driverName || <span style={{ color: C.gray }}>Unassigned</span>}</td>
                  <td style={{ ...s.td, maxWidth: 200 }}>
                    <div style={{ fontSize: 12, color: C.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.pickupAddress} → {r.dropoffAddress}
                    </div>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: C.ocean }}>
                    {r.fare ? `MVR ${r.fare}` : '—'}
                  </td>
                  <td style={{ ...s.td, color: C.gray, fontSize: 12 }}>{formatDate(r.createdAt)}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </td>
                  <td style={s.td}>
                    <button style={s.viewBtn} onClick={() => setSelected(r)}>Details</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Detail drawer */}
      {selected && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={s.drawer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Ride Details</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.gray }}>✕</button>
            </div>

            {/* Status + vehicle */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <span style={{ ...s.badge, background: STATUS_CONFIG[selected.status]?.bg, color: STATUS_CONFIG[selected.status]?.color, fontSize: 13, padding: '5px 14px' }}>
                {STATUS_CONFIG[selected.status]?.label}
              </span>
              <span style={{ ...s.badge, background: C.light, color: C.dark, fontSize: 13, padding: '5px 14px' }}>
                {VEHICLE_EMOJI[selected.vehicleType]} {selected.vehicleType?.replace('_', '-seat ')}
              </span>
            </div>

            {/* Route card */}
            <div style={{ background: C.light, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.teal, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: 0.6, marginBottom: 2 }}>PICKUP</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.pickupAddress}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.coral, marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, letterSpacing: 0.6, marginBottom: 2 }}>DROP-OFF</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.dropoffAddress}</div>
                </div>
              </div>
            </div>

            {/* Info rows */}
            {[
              ['Ride ID', selected.id],
              ['Passenger', selected.passengerName || '—'],
              ['Driver', selected.driverName || 'Unassigned'],
              ['Fare', selected.fare ? `MVR ${selected.fare}` : '—'],
              ['Commission (15%)', selected.commission ? `MVR ${selected.commission?.toFixed(2)}` : '—'],
              ['Driver Earnings', selected.fare && selected.commission ? `MVR ${(selected.fare - selected.commission).toFixed(2)}` : '—'],
              ['Requested', formatDate(selected.createdAt)],
              ['Accepted', formatDate(selected.acceptedAt)],
              ['Completed', formatDate(selected.completedAt)],
            ].map(([label, val]) => (
              <div key={String(label)} style={s.infoRow}>
                <span style={s.infoLabel}>{label}</span>
                <span style={s.infoVal}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
