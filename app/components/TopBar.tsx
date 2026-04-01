'use client';
import { useState, useEffect, useRef } from 'react';

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

const variants = ['LONGEVITY', 'PERFORMANCE', 'INVESTMENTS', 'MENTAL HEALTH', 'DISCOVERIES', 'THREATS'];

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
  const [showPulse, setShowPulse] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const [dismissedMobile, setDismissedMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close menu on outside tap
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

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

  const fadeColor = isDark ? '#0f1923' : '#ffffff';

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .topic-strip::-webkit-scrollbar { display: none; }
        .topic-strip { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Mobile warning */}
      {isMobile && showMobileWarning && !dismissedMobile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px 24px', maxWidth: '320px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌐</div>
            <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Best on Desktop</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              Global Health Watch is optimized for larger screens. You can still browse on mobile, but the experience is better on desktop or tablet.
            </div>
            <button style={{ width: '100%', backgroundColor: '#00C9A7', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' }} onClick={() => dismissMobileWarning(true)}>
              Got it, continue anyway
            </button>
            <button style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', fontSize: '13px', cursor: 'pointer' }} onClick={() => dismissMobileWarning(false)}>
              Dismiss for now
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP — unchanged single row ── */}
      {!isMobile && (
        <div style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px', height: '48px', gap: '12px', overflowX: 'auto' }}>
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
          <select value={region} onChange={e => setRegion(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', flexShrink: 0 }}>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={() => setShowPulse(true)} style={{ color: pulse.color, border: `1.5px solid ${pulse.color}`, backgroundColor: 'transparent', borderRadius: '6px', padding: '4px 10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pulse.color, animation: 'pulseDot 2s infinite' }} />
            {pulse.label}
          </button>
          {variants.map(v => {
            const isActive = activeVariants.includes(v);
            const color = TOPIC_COLORS[v] ?? '#888';
            return (
              <button key={v} onClick={() => toggleVariant(v)} style={{ backgroundColor: isActive ? color : 'transparent', color: isActive ? '#fff' : 'var(--text-secondary)', border: `1px solid ${isActive ? color : 'var(--border-color)'}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: isActive ? '700' : '500', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s' }}>
                {v}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={onMyHealth} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>My Health</button>
            <button onClick={onShare} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>Share</button>
            <button onClick={toggleTheme} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '13px', cursor: 'pointer' }} title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE — two rows ── */}
      {isMobile && (
        <div style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>

          {/* Row 1: logo · region · pulse · theme · ⋯ */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: '52px', gap: '8px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <span style={{ fontSize: '14px' }}>🌐</span>
              <span style={{ color: '#00C9A7', fontWeight: '800', fontSize: '11px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>GHW</span>
            </div>

            {/* Region */}
            <select value={region} onChange={e => setRegion(e.target.value)} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 8px', fontSize: '11px', flexShrink: 0 }}>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Pulse */}
            <button onClick={() => setShowPulse(true)} style={{ color: pulse.color, border: `1.5px solid ${pulse.color}`, backgroundColor: 'transparent', borderRadius: '8px', padding: '6px 10px', fontWeight: '700', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pulse.color, animation: 'pulseDot 2s infinite', flexShrink: 0 }} />
              {pulse.label}
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 10px', fontSize: '14px', cursor: 'pointer', flexShrink: 0 }}>
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* ⋯ menu */}
            <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{ backgroundColor: showMenu ? 'rgba(0,201,167,0.1)' : 'transparent', color: 'var(--text-secondary)', border: `1px solid ${showMenu ? '#00C9A7' : 'var(--border-color)'}`, borderRadius: '8px', padding: '6px 12px', fontSize: '16px', cursor: 'pointer', lineHeight: 1, transition: 'all 0.15s' }}
              >
                ···
              </button>
              {showMenu && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: '160px', zIndex: 100 }}>
                  <button
                    onClick={() => { onMyHealth(); setShowMenu(false); }}
                    style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>🫀</span> My Health
                  </button>
                  <button
                    onClick={() => { onShare(); setShowMenu(false); }}
                    style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>↗</span> Share app
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: topic pills — fade affordance signals scrollability */}
          <div style={{ position: 'relative', borderTop: '1px solid var(--border-color)' }}>
            <div className="topic-strip" style={{ display: 'flex', gap: '8px', padding: '8px 12px', paddingRight: '52px', overflowX: 'auto' }}>
              {variants.map(v => {
                const isActive = activeVariants.includes(v);
                const color = TOPIC_COLORS[v] ?? '#888';
                return (
                  <button key={v} onClick={() => toggleVariant(v)} style={{
                    backgroundColor: isActive ? color : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    border: `1.5px solid ${isActive ? color : 'var(--border-color)'}`,
                    borderRadius: '20px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: isActive ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                    minHeight: '36px',
                  }}>
                    {v}
                  </button>
                );
              })}
            </div>
            {/* Gradient fade — signals more content to the right */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60px', background: `linear-gradient(to right, transparent, ${fadeColor})`, pointerEvents: 'none' }} />
          </div>

        </div>
      )}

      {/* Pulse modal */}
      {showPulse && (
        <div onClick={() => setShowPulse(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--modal-bg)', border: `1px solid ${pulse.color}44`, borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%', boxShadow: `0 0 60px ${pulse.color}22`, position: 'relative' }}>
            <button onClick={() => setShowPulse(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pulse.color, boxShadow: `0 0 8px ${pulse.color}`, animation: 'pulseDot 2s infinite' }} />
              <span style={{ fontWeight: '800', fontSize: '18px', color: pulse.color }}>{pulse.label}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '12px' }}>{getPulseExplanation(pulse.score)}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{pulse.reason}</p>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>What is Health Pulse?</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>A real-time AI snapshot of global health — synthesized from live signals across threats, discoveries, longevity, mental health, performance, and investments. Updated every hour.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
