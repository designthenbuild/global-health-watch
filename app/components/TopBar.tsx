'use client';

import { useState } from 'react';

const regions = ['Global', 'Europe', 'GCC·MENA', 'North America', 'SE Asia', 'LATAM', 'Africa', 'ANZ'];

export default function TopBar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [region, setRegion] = useState('Global');
  const [variant, setVariant] = useState('THREATS');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
        <span style={{ fontSize: '20px' }}>🌐</span>
        <span style={{ color: 'var(--accent-teal)', fontWeight: '700', fontSize: '14px', letterSpacing: '0.05em' }}>
          GLOBAL HEALTH WATCH
        </span>
      </div>

      {/* Timestamp */}
      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        Updated today at 07:00 UTC
      </span>

      {/* Region dropdown */}
      <select
        value={region}
        onChange={e => setRegion(e.target.value)}
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '12px',
        }}
      >
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Pulse Score */}
      <div style={{
        backgroundColor: 'var(--alert-gold)',
        color: '#000',
        borderRadius: '6px',
        padding: '4px 10px',
        fontWeight: '700',
        fontSize: '13px',
      }}>
        PULSE 2
      </div>

      {/* Variant switcher */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {['THREATS', 'DISCOVERIES'].map(v => (
          <button
            key={v}
            onClick={() => setVariant(v)}
            style={{
              backgroundColor: variant === v ? 'var(--accent-teal)' : 'transparent',
              color: variant === v ? '#000' : 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {v}
          </button>
        ))}
        <button style={{
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '12px',
          cursor: 'not-allowed',
          opacity: 0.4,
        }}>
          LONGEVITY
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <input
        placeholder="Search diseases, regions..."
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 12px',
          fontSize: '12px',
          width: '200px',
        }}
      />

      {/* MY HEALTH */}
      <button style={{
        backgroundColor: 'var(--accent-teal)',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
      }}>
        MY HEALTH
      </button>

      {/* Dark/Light toggle */}
      <button
        onClick={toggleTheme}
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Share */}
      <button style={{
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '12px',
        cursor: 'pointer',
      }}>
        Share
      </button>
    </header>
  );
}