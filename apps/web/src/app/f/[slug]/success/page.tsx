'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= 30) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.12), transparent), var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkDraw {
          from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div
        style={{
          textAlign: 'center',
          maxWidth: '480px',
          width: '100%',
          animation: 'fadeUp 0.5s ease forwards',
        }}
      >
        {/* Floating emoji */}
        <div
          style={{
            fontSize: '5rem',
            marginBottom: '1.5rem',
            display: 'inline-block',
            animation: 'float 2.5s ease-in-out infinite',
          }}
        >
          🎉
        </div>

        {/* Check circle */}
        <div
          style={{
            margin: '0 auto 1.5rem',
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            border: '3px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            animation: 'checkDraw 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
            boxShadow: '0 0 30px rgba(16,185,129,0.25)',
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            fontFamily: 'Poppins, sans-serif',
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          Thank You!
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            marginBottom: '0.75rem',
          }}
        >
          Your response has been submitted successfully.
          <br />
          We appreciate your time!
        </p>

        {/* Animated counter */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '100px',
            marginBottom: '2rem',
            color: '#10b981',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {count}+
          </span>
          responses collected today
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href={`/f/${slug}`}>
            <button
              style={{
                padding: '0.875rem 1.5rem',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(255,255,255,0.25)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  'rgba(255,255,255,0.1)')
              }
            >
              ↩ Submit Another
            </button>
          </Link>

          <Link href="/">
            <button
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 6px 20px rgba(249,115,22,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 4px 16px rgba(249,115,22,0.35)';
              }}
            >
              ☕ ChaiForms
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
