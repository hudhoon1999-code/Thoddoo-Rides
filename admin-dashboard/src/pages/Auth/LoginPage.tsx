import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@shared/firebase/config';

const C = {
  teal: '#1CC7C1', ocean: '#0E7490', coral: '#FF7A59',
  sand: '#F8F4EC', green: '#2F855A', dark: '#0F172A',
  gray: '#64748B', light: '#F1F5F9', white: '#FFFFFF',
};

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${C.ocean} 0%, ${C.teal} 50%, #2F855A 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: 20,
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      <div style={{
        background: C.white,
        borderRadius: 24,
        padding: '40px 44px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${C.ocean}, ${C.teal})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 14px',
            boxShadow: `0 8px 24px ${C.teal}50`,
          }}>🚐</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.dark }}>Thoddoo Rides</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 3 }}>Admin Dashboard</div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@thoddoorides.mv"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: `1.5px solid ${error ? C.coral : C.light}`,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                color: C.dark,
              }}
              onFocus={e => (e.target.style.borderColor = C.teal)}
              onBlur={e => (e.target.style.borderColor = error ? C.coral : C.light)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  borderRadius: 12,
                  border: `1.5px solid ${error ? C.coral : C.light}`,
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: C.dark,
                }}
                onFocus={e => (e.target.style.borderColor = C.teal)}
                onBlur={e => (e.target.style.borderColor = error ? C.coral : C.light)}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: C.gray,
                }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF5F5',
              border: `1px solid ${C.coral}30`,
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: C.coral,
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading
                ? C.light
                : `linear-gradient(135deg, ${C.ocean}, ${C.teal})`,
              color: loading ? C.gray : C.white,
              border: 'none',
              borderRadius: 14,
              padding: '14px 0',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              boxShadow: loading ? 'none' : `0 6px 20px ${C.teal}45`,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: C.gray }}>
          🏝 Thoddoo Island, North Ari Atoll · Maldives
        </div>
      </div>
    </div>
  );
}
