import React, { useState } from 'react';
import {
  collection, query, orderBy, updateDoc, doc, where,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '@shared/firebase/config';

interface Passenger {
  id: string;
  name: string;
  phone: string;
  language: string;
  totalRides: number;
  isSuspended: boolean;
  createdAt: any;
  lastRideAt: any;
}

const C = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', green: '#2F855A', dark: '#0F172A',
  gray: '#64748B', light: '#F1F5F9', white: '#FFFFFF',
  amber: '#F59E0B',
};

const s: Record<string, React.CSSProperties> = {
  page:       { padding: 32, fontFamily: 'Inter, sans-serif', color: C.dark },
  topRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  h1:         { fontSize: 26, fontWeight: 800, margin: 0 },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard:   { background: C.white, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  statVal:    { fontSize: 28, fontWeight: 800 },
  statLbl:    { fontSize: 13, color: C.gray, marginTop: 2 },
  searchRow:  { display: 'flex', gap: 12, marginBottom: 20 },
  searchBox:  { flex: 1, padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.light}`, fontSize: 14, outline: 'none' },
  filterSel:  { padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${C.light}`, fontSize: 14, background: C.white, outline: 'none' },
  table:      { width: '100%', borderCollapse: 'collapse' as const, background: C.white, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' },
  th:         { padding: '13px 16px', textAlign: 'left' as const, fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase' as const, letterSpacing: 0.6, background: C.light, borderBottom: `1px solid #E2E8F0` },
  td:         { padding: '14px 16px', fontSize: 14, borderBottom: `1px solid #F1F5F9`, verticalAlign: 'middle' as const },
  avatar:     { width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.ocean})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 },
  badge:      { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeGreen: { background: C.green + '15', color: C.green },
  badgeRed:   { background: C.coral + '15', color: C.coral },
  badgeGray:  { background: C.light, color: C.gray },
  actionBtn:  { padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  viewBtn:    { background: C.ocean + '15', color: C.ocean },
  suspBtn:    { background: C.coral + '15', color: C.coral },
  unsuspBtn:  { background: C.green + '15', color: C.green },
  overlay:    { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  drawer:     { background: C.white, borderRadius: 20, padding: 32, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' as const },
  drawerTitle:{ fontSize: 18, fontWeight: 800, marginBottom: 20 },
  infoRow:    { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.light}`, fontSize: 14 },
  infoLabel:  { color: C.gray, fontWeight: 500 },
  infoVal:    { fontWeight: 600 },
  emptyState: { textAlign: 'center' as const, padding: 60, color: C.gray },
};

export default function PassengersPage() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [selected, setSelected]   = useState<Passenger | null>(null);
  const [confirming, setConfirming] = useState<{ action: 'suspend' | 'unsuspend'; id: string } | null>(null);

  const q = query(collection(db, 'passengers'), orderBy('createdAt', 'desc'));
  const [passengers = [], loading] = useCollectionData(q, { idField: 'id' }) as [Passenger[], boolean, any];

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSuspend = async (id: string, suspend: boolean) => {
    await updateDoc(doc(db, 'passengers', id), { isSuspended: suspend });
    setConfirming(null);
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, isSuspended: suspend } : null);
  };

  const filtered = passengers.filter((p) => {
    const matchSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && !p.isSuspended) ||
      (filter === 'suspended' && p.isSuspended);
    return matchSearch && matchFilter;
  });

  const totalRides = passengers.reduce((s, p) => s + (p.totalRides || 0), 0);
  const suspended  = passengers.filter(p => p.isSuspended).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.topRow}>
        <div>
          <h1 style={s.h1}>👥 Passengers</h1>
          <p style={{ margin: '4px 0 0', color: C.gray, fontSize: 14 }}>
            {passengers.length} registered users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Passengers', val: passengers.length, color: C.teal },
          { label: 'Total Rides Taken', val: totalRides, color: C.ocean },
          { label: 'Active Users', val: passengers.length - suspended, color: C.green },
          { label: 'Suspended', val: suspended, color: C.coral },
        ].map((st) => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statVal, color: st.color }}>{st.val}</div>
            <div style={s.statLbl}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={s.searchRow}>
        <input
          style={s.searchBox}
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.filterSel} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.emptyState}>Loading passengers...</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>No passengers found</div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              {['Passenger', 'Phone', 'Language', 'Total Rides', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = C.light)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={s.avatar}>{(p.name || 'U')[0].toUpperCase()}</div>
                    <span style={{ fontWeight: 600 }}>{p.name || 'Unknown'}</span>
                  </div>
                </td>
                <td style={s.td}>{p.phone}</td>
                <td style={s.td}>{p.language === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'}</td>
                <td style={{ ...s.td, fontWeight: 700, color: C.ocean }}>{p.totalRides || 0}</td>
                <td style={{ ...s.td, color: C.gray }}>{formatDate(p.createdAt)}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(p.isSuspended ? s.badgeRed : s.badgeGreen) }}>
                    {p.isSuspended ? '🚫 Suspended' : '✓ Active'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ ...s.actionBtn, ...s.viewBtn }} onClick={() => setSelected(p)}>View</button>
                    {p.isSuspended ? (
                      <button style={{ ...s.actionBtn, ...s.unsuspBtn }} onClick={() => setConfirming({ action: 'unsuspend', id: p.id })}>Restore</button>
                    ) : (
                      <button style={{ ...s.actionBtn, ...s.suspBtn }} onClick={() => setConfirming({ action: 'suspend', id: p.id })}>Suspend</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Detail drawer */}
      {selected && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={s.drawer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={s.drawerTitle}>Passenger Profile</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.gray }}>✕</button>
            </div>
            <div style={{ ...s.avatar, width: 64, height: 64, fontSize: 24, marginBottom: 16 }}>
              {(selected.name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selected.name || 'Unknown'}</div>
            <span style={{ ...s.badge, ...(selected.isSuspended ? s.badgeRed : s.badgeGreen) }}>
              {selected.isSuspended ? '🚫 Suspended' : '✓ Active'}
            </span>
            <div style={{ marginTop: 20 }}>
              {[
                ['Phone', selected.phone],
                ['Language', selected.language === 'ru' ? 'Russian' : 'English'],
                ['Total Rides', selected.totalRides || 0],
                ['Joined', formatDate(selected.createdAt)],
                ['Last Ride', formatDate(selected.lastRideAt)],
                ['Passenger ID', selected.id?.slice(0, 12) + '...'],
              ].map(([label, val]) => (
                <div key={String(label)} style={s.infoRow}>
                  <span style={s.infoLabel}>{label}</span>
                  <span style={s.infoVal}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              {selected.isSuspended ? (
                <button
                  style={{ ...s.actionBtn, ...s.unsuspBtn, width: '100%', padding: '12px 0', borderRadius: 12, fontSize: 14 }}
                  onClick={() => handleSuspend(selected.id, false)}
                >✓ Restore Account</button>
              ) : (
                <button
                  style={{ ...s.actionBtn, ...s.suspBtn, width: '100%', padding: '12px 0', borderRadius: 12, fontSize: 14 }}
                  onClick={() => setConfirming({ action: 'suspend', id: selected.id })}
                >🚫 Suspend Account</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirming && (
        <div style={{ ...s.overlay, zIndex: 1100 }}>
          <div style={{ background: C.white, borderRadius: 16, padding: 28, width: 320, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {confirming.action === 'suspend' ? '🚫' : '✓'}
            </div>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {confirming.action === 'suspend' ? 'Suspend Passenger?' : 'Restore Passenger?'}
            </div>
            <div style={{ color: C.gray, fontSize: 13, marginBottom: 20 }}>
              {confirming.action === 'suspend'
                ? 'They will not be able to book rides.'
                : 'Their account will be restored.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ flex: 1, background: C.light, border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setConfirming(null)}
              >Cancel</button>
              <button
                style={{ flex: 1, background: confirming.action === 'suspend' ? C.coral : C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleSuspend(confirming.id, confirming.action === 'suspend')}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
