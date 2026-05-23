import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@shared/firebase/config';
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

type Page = 'dashboard' | 'drivers' | 'passengers' | 'rides' | 'pricing' | 'events' | 'activities' | 'analytics';

const PAGE_MAP: Record<Page, React.ComponentType> = {
  dashboard:   Dashboard,
  drivers:     DriversPage,
  passengers:  PassengersPage,
  rides:       RidesPage,
  pricing:     PricingPage,
  events:      EventsPage,
  activities:  ActivitiesPage,
  analytics:   AnalyticsPage,
};

export default function App() {
  const [user, setUser]   = useState<User | null | undefined>(undefined);
  const [page, setPage]   = useState<Page>('dashboard');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Loading state while auth resolves
  if (user === undefined) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#64748B' }}>
        Loading...
      </div>
    );
  }

  // Not logged in → show login
  if (!user) return <LoginPage />;

  const PageComponent = PAGE_MAP[page];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Sidebar activePage={page} onNavigate={(p) => setPage(p as Page)} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <PageComponent />
      </main>
    </div>
  );
}
