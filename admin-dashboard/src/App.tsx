import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@shared/firebase/config';
import Sidebar from './components/Sidebar';
import LoginPage      from './pages/Auth/LoginPage';
import Dashboard      from './pages/Dashboard/Dashboard';
import DriversPage    from './pages/Drivers/DriversPage';
import PassengersPage from './pages/Passengers/PassengersPage';
import RidesPage      from './pages/Rides/RidesPage';
import PricingPage    from './pages/Pricing/PricingPage';
import EventsPage     from './pages/Events/EventsPage';
import ActivitiesPage from './pages/Activities/ActivitiesPage';
import AnalyticsPage  from './pages/Analytics/AnalyticsPage';
import MapPage        from './pages/Map/MapPage';

type Page = 'dashboard' | 'drivers' | 'passengers' | 'rides' | 'pricing' | 'events' | 'activities' | 'analytics' | 'map';

const PAGE_MAP: Record<Page, React.ComponentType> = {
  dashboard:   Dashboard,
  drivers:     DriversPage,
  passengers:  PassengersPage,
  rides:       RidesPage,
  pricing:     PricingPage,
  events:      EventsPage,
  activities:  ActivitiesPage,
  analytics:   AnalyticsPage,
  map:         MapPage,
};

type AuthState = 'loading' | 'unauthenticated' | 'checking' | 'admin' | 'denied';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser]           = useState<User | null>(null);
  const [page, setPage]           = useState<Page>('dashboard');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setAuthState('unauthenticated');
        return;
      }

      setUser(u);
      setAuthState('checking');

      try {
        // Check Firestore admins/{uid}
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        if (adminDoc.exists() && adminDoc.data()?.isAdmin === true) {
          setAuthState('admin');
        } else {
          setAuthState('denied');
        }
      } catch {
        // Firestore read failed (e.g. rules) — fall back to custom claim
        try {
          const token = await u.getIdTokenResult();
          setAuthState(token.claims.admin === true ? 'admin' : 'denied');
        } catch {
          setAuthState('denied');
        }
      }
    });
  }, []);

  if (authState === 'loading' || authState === 'checking') {
    return (
      <div style={center}>
        <div style={spinner} />
        <p style={{ color: '#64748b', marginTop: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {authState === 'checking' ? 'Verifying access…' : 'Loading…'}
        </p>
      </div>
    );
  }

  if (authState === 'unauthenticated') return <LoginPage />;

  if (authState === 'denied') {
    return (
      <div style={center}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <h2 style={{ margin: '0 0 8px', fontFamily: 'Sora, sans-serif', color: '#0f172a' }}>Access Denied</h2>
        <p style={{ color: '#64748b', margin: '0 0 24px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {user?.email} is not authorised as an admin.
        </p>
        <button
          onClick={() => auth.signOut()}
          style={{
            background: '#0E7490', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 24px', fontWeight: 600,
            fontSize: 14, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  const PageComponent = PAGE_MAP[page];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <Sidebar activePage={page} onNavigate={(p) => setPage(p as Page)} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <PageComponent />
      </main>
    </div>
  );
}

const center: React.CSSProperties = {
  height: '100vh', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
};

const spinner: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  border: '3px solid #e2e8f0',
  borderTopColor: '#1CC7C1',
  animation: 'spin 0.7s linear infinite',
};
