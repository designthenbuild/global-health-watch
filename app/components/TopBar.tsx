'use client';

import { useState, useEffect } from 'react';

const regions = ['Global', 'Europe', 'GCC·MENA', 'North America', 'SE Asia', 'LATAM', 'Africa', 'ANZ'];

const VARIANT_COLORS: Record<string, string> = {
  THREATS: '#E63946',
  DISCOVERIES: '#00B4D8',
  'MENTAL HEALTH': '#7C3AED',
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  INVESTMENTS: '#D97706',
};

interface PulseData {
  score: number;
  label: string;
  color: string;
  reason: string;
}

interface TopBarProps {
  activeVariants: string[];
  toggleVariant: (v: string) => void;
  focusedTopic?: string | null;
  setFocusedTopic?: (t: string | null) => void;
  region: string;
  setRegion: (r: string) => void;
  onMyHealth: () => void;
  pulse: PulseData;
  onShare: () => void;
  isDark?: boolean;
  onThemeChange?: (isDark: boolean) => void;
}

function getPulseExplanation(score: number): string {
  if (score <= 2) return 'Global health signals are calm. Routine monitoring is in place across all regions.';
  if (score <= 4) return 'Low-level health activity detected. A small number of threats are being monitored, but none indicate widespread risk.';
  if (score <= 6) return 'Moderate threat burden globally. Multiple active signals across regions suggest elevated vigilance is warranted.';
  if (score <= 8) return 'Significant health threat activity detected. Several high-alert signals are active simultaneously.';
  return 'Critical global health tension. Multiple simultaneous high-alert events are active.';
}

const scaleItems = [
  { range: '1-3', label: 'Calm', color: '#00C9A7' },
  { range: '4-6', label: 'Watch', color: '#FFD166' },
  { range: '7-8', label: 'Elevated', color: '#FFB347' },
  { range: '9-10', label: 'Critical', color: '#E63946' },
];

const variants = ['LONGEVITY', 'PERFORMANCE', 'INVESTMENTS', 'MENTAL HEALTH', 'DISCOVERIES', 'THREATS'];

export default function TopBar({ activeVariants = [], toggleVariant, focusedTopic = null, setFocusedTopic, region, setRegion, onMyHealth, pulse, onShare, isDark = false, onThemeChange }: TopBarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(isDark ? 'dark' : 'light');
  const [showPulse, setShowPulse] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('light');
    if (window.innerWidth < 768) {
      const dismissed = localStorage.getItem('mobileWarningDismissed');
      if (!dismissed) setShowMobileWarning(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    onThemeChange?.(newTheme === 'dark');
  };

  const dismissMobileWarning = (dontShow: boolean) => {
    if (dontShow) localStorage.setItem('mobileWarningDismissed', 'true');
    setShowMobileWarning(false);
  };

  const isLight = theme === 'light';

  return (
    <>
      {/* Mobile Warning */}
      {showMobileWarning && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '32px 28px',
            width: '100%',
            maxWidth: '360px',
            border: '1px solid rgba(0,201,167,0.3)',
            boxShadow: '0 0 40px rgba(0,201,167,0.15)',
          }}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '16px' }}>🔭</div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '8px' }}>
              Better on Desktop
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.6', marginBottom: '8px' }}>
              Global Health Watch is a live intelligence dashboard — maps, feeds, counters, and AI are best experienced on a larger screen.
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent-teal)', textAlign: 'center', marginBottom: '24px' }}>
              What matters in health. Every day.
            </div>
            <button
              onClick={() => dismissMobileWarning(false)}
              style={{ width: '100%', backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}
            >
              Continue Anyway
            </button>
            <button
              onClick={() => dismissMobileWarning(true)}
              style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '13px', cursor: 'pointer' }}
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      )}

      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, gap: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🌐</span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '13px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>GLOBAL HEALTH WATCH</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '22px' }}>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.04em', opacity: 0.7 }}>
              What matters in health. Every day.
            </div>
            <div style={{ fontSize: '9px', color: 'var(--border-color)', opacity: 0.5 }}>·</div>
            <a href="https://x.com/MariaMatloub" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '9px', color: 'var(--text-secondary)', opacity: 0.5, textDecoration: 'none', letterSpacing: '0.04em', transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
              @mariamatloub
            </a>
            <div style={{ fontSize: '9px', color: 'var(--border-color)', opacity: 0.5 }}>·</div>
            <div style={{ fontSize: '8px', color: 'var(--text-secondary)', opacity: 0.35, letterSpacing: '0.06em' }}>v0.6</div>
          </div>
        </div>

        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', flexShrink: 0 }}
        >
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div
          onClick={() => setShowPulse(true)}
          style={{ color: pulse.color, border: `1.5px solid ${pulse.color}`, backgroundColor: 'transparent', borderRadius: '6px', padding: '4px 10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pulse.color, animation: 'pulseDot 2s infinite' }} />
          {pulse.label}
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, flexWrap: 'nowrap' }}>
          {variants.map(v => {
            const isActive = activeVariants.includes(v);
            const isFocused = focusedTopic === v;
            const color = VARIANT_COLORS[v];
            return (
              <button
                key={v}
                onClick={() => { if (activeVariants.includes(v)) { setFocusedTopic?.(focusedTopic === v ? null : v); } else { toggleVariant(v); } }}
                style={{
                  backgroundColor: isActive ? color : 'transparent',
                  outline: isFocused ? '2px solid #fff' : 'none',
                  outlineOffset: '2px',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? color : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {v}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={onMyHealth}
          style={{ backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          MY HEALTH
        </button>

        <button
          onClick={onShare}
          style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          ↑ SHARE
        </button>

        <button
          onClick={toggleTheme}
          style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}
          title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLight ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Pulse Modal */}
      {showPulse && (
        <div onClick={() => setShowPulse(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${pulse.color}`,
            borderRadius: '12px',
            padding: '32px',
            width: '480px',
            maxWidth: '90vw',
            boxShadow: `0 0 40px ${pulse.color}33`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-teal)', letterSpacing: '0.1em', marginBottom: '8px' }}>GLOBAL HEALTH PULSE</div>
                <div style={{ fontSize: '64px', fontWeight: '800', color: pulse.color, lineHeight: '1' }}>{pulse.score}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>out of 10</div>
              </div>
              <button onClick={() => setShowPulse(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div key={n} style={{
                    flex: 1,
                    backgroundColor: n <= pulse.score
                      ? (pulse.score >= 8 ? '#E63946' : pulse.score >= 6 ? '#FFB347' : pulse.score >= 4 ? '#FFD166' : '#00C9A7')
                      : 'var(--border-color)',
                    marginRight: n < 10 ? '2px' : 0,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                <span>CALM</span><span>WATCH</span><span>ELEVATED</span><span>CRITICAL</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>SIGNAL BREAKDOWN</div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{pulse.reason}</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '8px' }}>WHAT THIS MEANS</div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{getPulseExplanation(pulse.score)}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {scaleItems.map(s => (
                <div key={s.range} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ color: s.color, fontWeight: '700' }}>{s.range}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </>
  );
}
