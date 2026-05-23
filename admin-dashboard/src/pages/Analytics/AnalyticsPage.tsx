import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// Mock data — replace with real Firestore aggregations
const WEEKLY_EARNINGS = [
  { day: 'Mon', gross: 420, net: 357, rides: 12 },
  { day: 'Tue', gross: 580, net: 493, rides: 17 },
  { day: 'Wed', gross: 340, net: 289, rides: 10 },
  { day: 'Thu', gross: 720, net: 612, rides: 21 },
  { day: 'Fri', gross: 960, net: 816, rides: 28 },
  { day: 'Sat', gross: 1200, net: 1020, rides: 34 },
  { day: 'Sun', gross: 880, net: 748, rides: 25 },
];

const VEHICLE_SPLIT = [
  { name: 'Buggy 6-seat',  value: 45, color: '#1CC7C1' },
  { name: 'Buggy 12-seat', value: 20, color: '#0E7490' },
  { name: 'Motorcycle',    value: 35, color: '#FF7A59' },
];

const HOURLY_DEMAND = [
  { hour: '6AM', rides: 2 },  { hour: '7AM', rides: 5 },
  { hour: '8AM', rides: 8 },  { hour: '9AM', rides: 6 },
  { hour: '10AM', rides: 7 }, { hour: '11AM', rides: 9 },
  { hour: '12PM', rides: 11 },{ hour: '1PM', rides: 13 },
  { hour: '2PM', rides: 10 }, { hour: '3PM', rides: 8 },
  { hour: '4PM', rides: 12 }, { hour: '5PM', rides: 15 },
  { hour: '6PM', rides: 18 }, { hour: '7PM', rides: 22 },
  { hour: '8PM', rides: 25 }, { hour: '9PM', rides: 20 },
  { hour: '10PM', rides: 14 },{ hour: '11PM', rides: 8 },
];

const PERIODS = ['This Week', 'This Month', 'Last 3 Months'];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('This Week');

  const totalRides    = WEEKLY_EARNINGS.reduce((s, d) => s + d.rides, 0);
  const totalGross    = WEEKLY_EARNINGS.reduce((s, d) => s + d.gross, 0);
  const totalNet      = WEEKLY_EARNINGS.reduce((s, d) => s + d.net, 0);
  const commission    = totalGross - totalNet;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Platform performance overview</p>
        </div>
        <div style={styles.periodRow}>
          {PERIODS.map((p) => (
            <button
              key={p}
              style={{ ...styles.periodBtn, ...(period === p ? styles.periodBtnActive : {}) }}
              onClick={() => setPeriod(p)}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiRow}>
        <KPICard label="Total Rides"        value={totalRides}                color="#0E7490" emoji="🚐" trend="+12%" />
        <KPICard label="Platform Revenue"   value={`MVR ${commission}`}       color="#2F855A" emoji="💰" trend="+8%" />
        <KPICard label="Driver Payouts"     value={`MVR ${totalNet}`}         color="#FF7A59" emoji="👨‍💼" trend="+10%" />
        <KPICard label="Gross Fares"        value={`MVR ${totalGross}`}       color="#805AD5" emoji="📊" trend="+11%" />
      </div>

      {/* Charts row */}
      <div style={styles.chartsRow}>

        {/* Earnings bar chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Earnings by Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_EARNINGS} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(v) => [`MVR ${v}`, '']} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              <Bar dataKey="gross" fill="#1CC7C1" radius={[6, 6, 0, 0]} name="Gross" />
              <Bar dataKey="net"   fill="#0E7490" radius={[6, 6, 0, 0]} name="Net" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rides line chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Daily Ride Count</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WEEKLY_EARNINGS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              <Line type="monotone" dataKey="rides" stroke="#FF7A59" strokeWidth={3} dot={{ fill: '#FF7A59', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row */}
      <div style={styles.chartsRow}>

        {/* Hourly demand */}
        <div style={{ ...styles.chartCard, flex: 2 }}>
          <h3 style={styles.chartTitle}>Hourly Demand (Today)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={HOURLY_DEMAND} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="rides" fill="#1CC7C1" radius={[4, 4, 0, 0]} name="Rides" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle split pie */}
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h3 style={styles.chartTitle}>Vehicle Split</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={VEHICLE_SPLIT} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {VEHICLE_SPLIT.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>} />
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}

function KPICard({ label, value, color, emoji, trend }: any) {
  const isPositive = trend?.startsWith('+');
  return (
    <div style={{ ...styles.kpiCard, borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{value}</div>
        </div>
        <span style={{ fontSize: 28 }}>{emoji}</span>
      </div>
      {trend && (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: isPositive ? '#16a34a' : '#dc2626' }}>
          {trend} vs last period
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page:       { padding: '32px 40px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:      { margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' },
  subtitle:   { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  periodRow:  { display: 'flex', gap: 8 },
  periodBtn:  { padding: '8px 16px', borderRadius: 20, border: '1.5px solid #E2E8F0', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#64748b' },
  periodBtnActive: { background: '#0E7490', color: '#fff', borderColor: '#0E7490' },

  kpiRow:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  kpiCard:    { background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },

  chartsRow:  { display: 'flex', gap: 20, marginBottom: 20 },
  chartCard:  { flex: 1, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#0f172a' },
};
