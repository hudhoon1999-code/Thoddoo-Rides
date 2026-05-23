import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@shared/firebase/config';

const NAV_ITEMS = [
  { id: 'dashboard',  emoji: '📊', label: 'Dashboard'  },
  { id: 'drivers',    emoji: '🚐', label: 'Drivers'     },
  { id: 'passengers', emoji: '👥', label: 'Passengers'  },
  { id: 'rides',      emoji: '🗺', label: 'Rides'       },
  { id: 'pricing',    emoji: '💰', label: 'Pricing'     },
  { id: 'events',     emoji: '🎉', label: 'Events'      },
  { id: 'activities', emoji: '🏄', label: 'Activities'  },
  { id: 'analytics',  emoji: '📈', label: 'Analytics'   },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={{ fontSize: 28 }}>🏝</span>
        <div>
          <div style={styles.logoTitle}>Thoddoo Rides</div>
          <div style={styles.logoSub}>Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            style={{ ...styles.navBtn, ...(activePage === item.id ? styles.navBtnActive : {}) }}
            onClick={() => onNavigate(item.id)}
          >
            <span style={styles.navEmoji}>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerBadge}>🟢 Live</div>
        <div style={styles.footerText}>Thoddoo Rides v1.0</div>
        <button
          style={styles.signOutBtn}
          onClick={() => signOut(auth)}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar:     { width: 220, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '24px 0' },
  logo:        { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  logoTitle:   { fontWeight: 800, fontSize: 15, color: '#fff' },
  logoSub:     { fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  nav:         { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navBtn:      { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' },
  navBtnActive:{ background: 'rgba(28,199,193,0.15)', color: '#1CC7C1' },
  navEmoji:    { fontSize: 18, width: 24 },
  footer:      { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' },
  footerBadge: { fontSize: 12, color: '#22c55e', marginBottom: 4 },
  footerText:  { fontSize: 11, color: '#475569', marginBottom: 10 },
  signOutBtn:  { width: '100%', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
