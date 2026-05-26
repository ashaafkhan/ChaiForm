'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc.tsx';
import { setToken, setStoredUser } from '@/lib/auth';

const DEMO_ACCOUNTS = [
  { label: 'Demo User', email: 'demo@chaiforms.dev', password: 'demo123' },
  { label: 'Admin',     email: 'admin@chaiforms.dev', password: 'Admin123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.token) {
        setToken(data.token);
        setStoredUser({
          id:    data.user.id,
          email: data.user.email,
          name:  data.user.name ?? '',
        });
        router.push('/dashboard');
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    loginMutation.mutate({
      email: email.toLowerCase().trim(),
      password,
    });
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.875rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'var(--text-primary)',
    fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.15), transparent), var(--bg-base)',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☕</div>
            <div style={{
              fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, #f97316, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ChaiForms</div>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(22,22,31,0.9)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
              color: '#ef4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
                onBlur={e =>  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPwd ? 'text' : 'password'} autoComplete="current-password" required
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)')}
                  onBlur={e =>  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '0.85rem', padding: 0,
                }}>{showPwd ? '🙈' : '👁'}</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              style={{
                width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                border: 'none', borderRadius: '10px', color: '#fff',
                cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: loginMutation.isPending ? 0.7 : 1,
                transition: 'all 0.25s', marginTop: '0.25rem',
                boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
              }}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)', fontSize: '0.875rem',
          }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--chai-orange)', textDecoration: 'none', fontWeight: 500 }}>
              Sign up free
            </Link>
          </div>
        </div>

        {/* Demo quick-fill */}
        <div style={{
          marginTop: '1.25rem', padding: '1rem',
          background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: '10px', fontSize: '0.8rem',
        }}>
          <div style={{ color: 'var(--chai-orange)', fontWeight: 600, marginBottom: '0.6rem' }}>
            🔑 Quick Demo Login
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                style={{
                  flex: 1, padding: '0.45rem 0.75rem',
                  background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.12)')}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Click above to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  );
}
