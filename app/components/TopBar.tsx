'use client';

import { useState } from 'react';

const regions = ['Global', 'Europe', 'GCC·MENA', 'North America', 'SE Asia', 'LATAM', 'Africa', 'ANZ'];

interface TopBarProps {
  variant: string;
  setVariant: (v: string) => void;
  region: string;
  setRegion: (r: string) => void;
}

export default function TopBar({ variant, setVariant, region, setRegion }: TopBarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
        <span style={{ fontSize: '20px' }}>🌐</span>
        <span style={{ color: 'var(--accent-teal)', fontWeight: '700', fontSize: '14px', letterSpacing: '0.05em' }}>
          GLOBAL HEALTH WATCH
        </span>
      </div>

      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
        Updated today at 07:00 UTC
      </span>

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

      <div style={{
        backgroundColor: 'var(--alert-gold)',
        color: '#000',
        borderRadius: '6px',
        padding: '4px 10px',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
      }}>
        PULSE 2
      </div>

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

      <div style={{ flex: 1 }} />

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