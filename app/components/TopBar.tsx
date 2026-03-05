'use client';

import { useState } from 'react';

const regions = ['Global', 'Europe', 'GCC·MENA', 'North America', 'SE Asia', 'LATAM', 'Africa', 'ANZ'];

interface PulseData {
  score: number;
  label: string;
  color: string;
  reason: string;
}

interface TopBarProps {
  activeVariants: string[];
  toggleVariant: (v: string) => void;
  region: string;
  setRegion: (r: string) => void;
  onMyHealth: () => void;
  pulse: PulseData;
}

function getPulseExplanation(score: number): string {
  if (score <= 2) return 'Global health signals are calm. Routine monitoring is in place across all regions. No significant outbreaks or emerging threats require immediate attention.';
  if (score <= 4) return 'Low-level health activity detected. A small number of threats are being monitored, but none indicate widespread risk. Standard public health vigilance applies.';
  if (score <= 6) return 'Moderate threat burden globally. Multiple active signals across regions suggest elevated vigilance is warranted. Follow developments in the Intelligence Feed.';
  if (score <= 8) return 'Significant health threat activity detected. Several high-alert signals are active simultaneously. Public health systems in affected regions are responding.';
  return 'Critical global health tension. Multiple simultaneous high-alert events are active. This level indicates potential for rapid escalation — monitor all feeds closely.';
}

const scaleItems = [
  { range: '1-3', label: 'Calm', color: '#00C9A7' },
  { range: '4-6', label: 'Watch', color: '#FFD166' },
  { range: '7-8', label: 'Elevated', color: '#FFB347' },
  { range: '9-10', label: 'Critical', color: '#FF4D6D' },
];

const variants = ['THREATS', 'DISCOVERIES', 'LONGEVITY'];

export default function TopBar({ activeVariants, toggleVariant, region, setRegion, onMyHealth, pulse }: TopBarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showPulse, setShowPulse] = useState(false);

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
    <>
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '18px' }}>🌐</span>
          <span style={{ color: 'var(--accent-teal)', fontWeight: '700', fontSize: '13px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            GLOBAL HEALTH WATCH
          </span>
        </div>

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
            flexShrink: 0,
          }}
        >
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div
          onClick={() => setShowPulse(true)}
          style={{
            backgroundColor: pulse.color,
            color: '#000',
            borderRadius: '6px',
            padding: '4px 10px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background-color 0.5s ease',
            flexShrink: 0,
          }}
        >
          {pulse.label}
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {variants.map(v => (
            <button
              key={v}
              onClick={() => toggleVariant(v)}
              style={{
                backgroundColor: activeVariants.includes(v) ? 'var(--accent-teal)' : 'transparent',
                color: activeVariants.includes(v) ? '#000' : 'var(--text-secondary)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: v === 'LONGEVITY' && !activeVariants.includes(v) ? 0.5 : 1,
              }}
            >
              {v}
            </button>
          ))}
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
            width: '180px',
            flexShrink: 0,
          }}
        />

        <button
          onClick={onMyHealth}
          style={{
            backgroundColor: 'var(--accent-teal)',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          MY HEALTH
        </button>

        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '14px',
            cursor: 'pointer',
            flexShrink: 0,
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
          flexShrink: 0,
        }}>
          Share
        </button>
      </header>

      {showPulse && (
        <div
          onClick={() => setShowPulse(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#0D1B2A',
              border: `1px solid ${pulse.color}`,
              borderRadius: '12px',
              padding: '32px',
              width: '480px',
              maxWidth: '90vw',
              color: '#fff',
              boxShadow: `0 0 40px ${pulse.color}33`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: pulse.color, letterSpacing: '0.1em', marginBottom: '8px' }}>
                  GLOBAL HEALTH PULSE
                </div>
                <div style={{ fontSize: '64px', fontWeight: '800', color: pulse.color, lineHeight: '1' }}>
                  {pulse.score}
                </div>
                <div style={{ fontSize: '13px', color: '#8892A4', marginTop: '4px' }}>out of 10</div>
              </div>
              <button
                onClick={() => setShowPulse(false)}
                style={{ background: 'transparent', border: 'none', color: '#8892A4', cursor: 'pointer', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div
                    key={n}
                    style={{
                      flex: 1,
                      backgroundColor: n <= pulse.score
                        ? (pulse.score >= 8 ? '#FF4D6D' : pulse.score >= 6 ? '#FFB347' : pulse.score >= 4 ? '#FFD166' : '#00C9A7')
                        : 'rgba(255,255,255,0.1)',
                      marginRight: n < 10 ? '2px' : 0,
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8892A4' }}>
                <span>CALM</span>
                <span>WATCH</span>
                <span>ELEVATED</span>
                <span>CRITICAL</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#8892A4', marginBottom: '12px' }}>SIGNAL BREAKDOWN</div>
              <div style={{ fontSize: '13px', color: '#fff' }}>{pulse.reason}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: pulse.color, marginBottom: '8px' }}>WHAT THIS MEANS</div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#CBD5E1' }}>
                {getPulseExplanation(pulse.score)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {scaleItems.map(s => (
                <div key={s.range} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ color: s.color, fontWeight: '700' }}>{s.range}</span>
                  <span style={{ color: '#8892A4' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}