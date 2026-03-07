'use client';
import { useState, useEffect } from 'react';

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
  onShare: () => void;
  isDark?: boolean;
  onThemeChange?: (isDark: boolean) => void;
}

function getPulseExplanation(score: number): string {
  if (score <= 2) return 'Global health signals are calm. Routine monitoring is in place across all regions.';
  if (score <= 4) return 'Low-level health activity detected. A small number of threats are being monitored, but none indicate widespread risk.';
  if (score <= 6) return 'Moderate threat burden globally. Multiple active signals across regions suggest elevated vigilance is warranted.';
  if (score <= 8) return 'High activity across multiple health domains. Significant events are unfolding — stay informed and monitor developments.';
  return 'Critical alert level. Severe health events are active globally. Immediate attention to official health advisories is recommended.';
}

const variants = ['LONGEVITY', 'PERFORMANCE', 'INVESTMENTS', 'MENTAL HEALTH', 'DISCOVERIES', 'THREATS']; // already correct order

const TOPIC_COLORS: Record<string, string> = {
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  INVESTMENTS: '#D97706',
  'MENTAL HEALTH': '#7C3AED',
  DISCOVERIES: '#00B4D8',
  THREATS: '#E63946',
};

const regions = ['Global', 'Europe', 'GCC·MENA', 'North America', 'SE Asia', 'LATAM', 'Africa', 'ANZ'];

export default function TopBar({ activeVariants = [], toggleVariant, region, setRegion, onMyHealth, pulse, onShare, isDark = false, onThemeChange }: TopBarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const [showPulse, setShowPulse] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const [dismissedMobile, setDismissedMobile] = useState(false);

  const dismissMobileWarning = (permanent: boolean) => {
    setShowMobileWarning(false);
    if (permanent) setDismissedMobile(true);
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    if (newIsDark) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    onThemeChange?.(newIsDark);
  };

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      {/* Mobile warning — only on actual mobile */}
      {isMobile && showMobileWarning && !dismissedMobile && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px', padding: '28px 24px', maxWidth: '320px', width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌐</div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '8px' }}>
              Best on Desktop
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              Global Health Watch is optimized for larger screens. You can still browse on mobile, but the experience is better on desktop or tablet.
            </div>
            <button
              style={{ width: '100%', backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }}
              onClick={() => dismissMobileWarning(true)}
            >
              Got it, continue anyway
            </button>
            <button
              style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '13px', cursor: 'pointer' }}
              onClick={() => dismissMobileWarning(false)}
            >
              Dismiss for now
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: 'sticky', top: 0, zIndex: 1000,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', height: '48px', gap: '12px',
        overflowX: 'auto',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>🌐</span>
            <span style={{ color: 'var(--accent-teal)', fontWeight: '800', fontSize: '13px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>GLOBAL HEALTH WATCH</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '9px', whiteSpace: 'nowrap' }}>What matters in health. Every day.</span>
            <a href="https://it.linkedin.com/in/mariamatloub" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '9px', textDecoration: 'none' }}>@mariamatloub</a>
            <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>v0.7</span>
          </div>
        </div>

        {/* Region selector */}
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', flexShrink: 0 }}
        >
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Pulse score */}
        <button
          onClick={() => setShowPulse(true)}
          style={{ color: pulse.color, border: `1.5px solid ${pulse.color}`, backgroundColor: 'transparent', borderRadius: '6px', padding: '4px 10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pulse.color, animation: 'pulseDot 2s infinite' }} />
          {pulse.label}
        </button>

        {/* Topic toggles */}
        {variants.map(v => {
          const isActive = activeVariants.includes(v);
          const color = TOPIC_COLORS[v] ?? '#888';
          return (
            <button
              key={v}
              onClick={() => toggleVariant(v)}
              style={{
                backgroundColor: isActive ? color : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? color : 'var(--border-color)'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {v}
            </button>
          );
        })}

        {/* Right actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={onMyHealth}
            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            My Health
          </button>
          <button
            onClick={onShare}
            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
          >
            Share
          </button>
          <button
            onClick={toggleTheme}
            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }}
            title="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Pulse modal */}
      {showPulse && (
        <div onClick={() => setShowPulse(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'var(--modal-bg)',
            border: `1px solid ${pulse.color}44`,
            borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '90%',
            boxShadow: `0 0 60px ${pulse.color}22`,
            position: 'relative',
          }}>
            <button onClick={() => setShowPulse(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pulse.color, boxShadow: `0 0 8px ${pulse.color}`, animation: 'pulseDot 2s infinite' }} />
              <span style={{ fontWeight: '800', fontSize: '18px', color: pulse.color }}>{pulse.label}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '12px' }}>
              {getPulseExplanation(pulse.score)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pulse.reason}</p>
          </div>
        </div>
      )}
    </>
  );
}
