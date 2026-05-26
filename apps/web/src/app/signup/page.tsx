'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc.tsx';
import { setToken, setStoredUser } from '@/lib/auth';

// ─── Client-side password strength (mirrors API Zod rules) ───────────────────
function getPasswordStrength(pwd: string) {
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { checks, score } = useMemo(() => getPasswordStrength(password), [password]);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      setStoredUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name ?? '',
      });
      router.push('/dashboard');
    },
    onError: (err) => {
      // Parse Zod field errors from tRPC BAD_REQUEST
      try {
        const issues = JSON.parse(err.message) as { path: string[]; message: string }[];
        const map: Record<string, string> = {};
        issues.forEach(i => { if (i.path[0]) map[i.path[0]] = i.message; });
        if (Object.keys(map).length > 0) {
          setFieldErrors(map);
          return;
        }
      } catch { /* not JSON — fall through */ }
      setError(err.message);
    },
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2)  errs.name     = 'Name must be at least 2 characters';
    if (!email.includes('@'))     errs.email    = 'Enter a valid email address';
    if (!checks.length)           errs.password = 'Password must be at least 8 characters';
    if (!checks.uppercase)        errs.password = errs.password ?? 'Must contain an uppercase letter';
    if (!checks.lowercase)        errs.password = errs.password ?? 'Must contain a lowercase letter';
    if (!checks.number)           errs.password = errs.password ?? 'Must contain a number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    registerMutation.mutate({ name: name.trim(), email: email.toLowerCase().trim(), password });
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '0.65rem 0.875rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${fieldErrors[field] ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.15), transparent), var(--bg-base)',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

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
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(22,22,31,0.9)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Global error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
              color: '#ef4444', fontSize: '0.875rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                id="name" type="text" autoComplete="name" required
                placeholder="Your name"
                value={name} onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                style={inputStyle('name')}
              />
              {fieldErrors.name && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Email Address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                style={inputStyle('email')}
              />
              {fieldErrors.email && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" required
                  placeholder="Min. 8 chars · uppercase · number"
                  value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  style={{ ...inputStyle('password'), paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '0.85rem', padding: 0,
                }}>{showPwd ? '🙈' : '👁'}</button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= score ? strengthColor[score] : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                    <span style={{ fontSize: '0.72rem', color: strengthColor[score], marginLeft: '6px', fontWeight: 600 }}>
                      {strengthLabel[score]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {([
                      ['length',    '8+ chars'],
                      ['uppercase', 'A–Z'],
                      ['lowercase', 'a–z'],
                      ['number',    '0–9'],
                    ] as [keyof typeof checks, string][]).map(([k, label]) => (
                      <span key={k} style={{
                        fontSize: '0.7rem', padding: '0.15rem 0.5rem',
                        borderRadius: '20px', fontWeight: 500,
                        background: checks[k] ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                        color: checks[k] ? '#22c55e' : 'var(--text-muted)',
                        border: `1px solid ${checks[k] ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.2s',
                      }}>
                        {checks[k] ? '✓' : '·'} {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {fieldErrors.password && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.3rem' }}>{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || score < 4}
              style={{
                width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 700,
                background: score >= 4 ? 'linear-gradient(135deg, #f97316, #f59e0b)' : 'rgba(249,115,22,0.4)',
                border: 'none', borderRadius: '10px', color: '#fff',
                cursor: score >= 4 && !registerMutation.isPending ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s', marginTop: '0.25rem',
                boxShadow: score >= 4 ? '0 4px 20px rgba(249,115,22,0.35)' : 'none',
              }}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{
            textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            color: 'var(--text-secondary)', fontSize: '0.875rem',
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--chai-orange)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          By signing up, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
