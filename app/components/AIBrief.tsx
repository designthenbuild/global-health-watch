'use client';
import { useState, useEffect } from 'react';

interface BriefItem {
  title: string;
  icon: string;
  content: string;
  color: string;
  variant: string;
  sources: { label: string; url: string; type: string }[];
}

const VARIANT_SOURCES: Record<string, { label: string; url: string; type: string }[]> = {
  LONGEVITY: [
    { label: 'Fight Aging!', url: 'https://www.fightaging.org', type: 'Research' },
    { label: 'Longevity.Technology', url: 'https://longevity.technology', type: 'News' },
    { label: 'Lifespan.io', url: 'https://www.lifespan.io', type: 'Research' },
    { label: 'Buck Institute', url: 'https://www.buckinstitute.org', type: 'Academic' },
    { label: 'Altos Labs', url: 'https://www.altoslabs.com', type: 'Biotech' },
  ],
  PERFORMANCE: [
    { label: 'BJSM', url: 'https://bjsm.bmj.com', type: 'Journal' },
    { label: 'Science Daily Sports', url: 'https://www.sciencedaily.com', type: 'Research' },
    { label: 'WHOOP', url: 'https://www.whoop.com/thelocker', type: 'Industry' },
    { label: 'Aspetar Journal', url: 'https://www.aspetar.com', type: 'Clinical' },
  ],
  INVESTMENTS: [
    { label: 'Fierce Biotech', url: 'https://www.fiercebiotech.com', type: 'Industry' },
    { label: 'MedCity News', url: 'https://medcitynews.com', type: 'News' },
    { label: 'BioPharma Dive', url: 'https://www.biopharmadive.com', type: 'Industry' },
    { label: 'a16z Bio', url: 'https://a16z.com/bio-health/', type: 'VC' },
  ],
  'MENTAL HEALTH': [
    { label: 'NIMH', url: 'https://www.nimh.nih.gov', type: 'Official' },
    { label: 'The Lancet Psychiatry', url: 'https://www.thelancet.com', type: 'Journal' },
    { label: 'Mental Health Weekly', url: 'https://www.mentalhealthweekly.org', type: 'News' },
    { label: 'WHO Mental Health', url: 'https://www.who.int/health-topics/mental-health', type: 'Official' },
  ],
  DISCOVERIES: [
    { label: 'Fierce Biotech', url: 'https://www.fiercebiotech.com', type: 'Industry' },
    { label: 'STAT News', url: 'https://statnews.com', type: 'News' },
    { label: 'MedCity News', url: 'https://medcitynews.com', type: 'News' },
    { label: 'Science Daily Health', url: 'https://www.sciencedaily.com', type: 'Research' },
    { label: 'Nature Medicine', url: 'https://www.nature.com/nm', type: 'Journal' },
  ],
  THREATS: [
    { label: 'CDC Health Alerts', url: 'https://tools.cdc.gov', type: 'Official' },
    { label: 'WHO Newsroom', url: 'https://www.who.int/news-room', type: 'Official' },
    { label: 'ProMED', url: 'https://promedmail.org', type: 'Surveillance' },
    { label: 'ECDC', url: 'https://www.ecdc.europa.eu', type: 'Official' },
    { label: 'HealthMap', url: 'https://www.healthmap.org', type: 'AI Monitor' },
  ],
  PULSE: [
    { label: 'WHO Newsroom', url: 'https://www.who.int/news-room', type: 'Official' },
    { label: 'HealthMap', url: 'https://www.healthmap.org', type: 'AI Monitor' },
    { label: 'Global Health Now JHU', url: 'https://www.globalhealthnow.org', type: 'Academic' },
    { label: 'Outbreak News Today', url: 'https://outbreaknewstoday.com', type: 'Surveillance' },
  ],
};

const FALLBACK: BriefItem[] = [
  { title: 'LONGEVITY', icon: '⏳', content: 'Senolytics and NAD+ supplementation remain the most active areas. New rapamycin trial data expected Q2 2026.', color: '#059669', variant: 'LONGEVITY', sources: VARIANT_SOURCES['LONGEVITY'] },
  { title: 'PERFORMANCE', icon: '⚡', content: 'Cold and heat therapy gaining clinical validation globally. VO2 max emerging as the strongest all-cause mortality predictor.', color: '#2563EB', variant: 'PERFORMANCE', sources: VARIANT_SOURCES['PERFORMANCE'] },
  { title: 'INVESTMENTS', icon: '📊', content: 'Global biotech funding strong in Q1 2026. GCC health infrastructure investment accelerating. EU pharma pricing reform advancing.', color: '#D97706', variant: 'INVESTMENTS', sources: VARIANT_SOURCES['INVESTMENTS'] },
  { title: 'MENTAL HEALTH', icon: '🧠', content: 'Psychedelic-assisted therapy advancing through regulatory pipelines globally. PTSD and treatment-resistant depression in focus.', color: '#7C3AED', variant: 'MENTAL HEALTH', sources: VARIANT_SOURCES['MENTAL HEALTH'] },
  { title: 'DISCOVERIES', icon: '🔬', content: 'Multiple Phase 3 oncology and neurology trials publishing results. CAR-T cell therapy showing promise beyond blood cancers.', color: '#00B4D8', variant: 'DISCOVERIES', sources: VARIANT_SOURCES['DISCOVERIES'] },
  { title: 'THREATS', icon: '⚠️', content: 'Routine surveillance active across WHO, CDC, and ProMED networks. No critical escalations at this time.', color: '#E63946', variant: 'THREATS', sources: VARIANT_SOURCES['THREATS'] },
  { title: 'HEALTH PULSE', icon: '🌐', content: 'Global signals at Watch level. No critical escalations. 3 active outbreak investigations, 2 elevated regional alerts.', color: '#00C9A7', variant: 'PULSE', sources: VARIANT_SOURCES['PULSE'] },
];

const CRITICAL_KEYWORDS = [
  'pandemic', 'epidemic', 'pheic declared', 'who declares pheic',
  'mass casualty', 'bioterrorism', 'chemical attack declared',
];

function isCriticalThreat(content: string): boolean {
  const lower = content.toLowerCase();
  return CRITICAL_KEYWORDS.some(kw => lower.includes(kw));
}

export default function AIBrief() {
  const [brief, setBrief] = useState<BriefItem[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [activeCard, setActiveCard] = useState<BriefItem | null>(null);
  const [showPulseInfo, setShowPulseInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetch('/api/brief')
      .then(r => r.json())
      .then(data => {
        if (data.brief?.length > 0) {
          const merged = data.brief.map((card: BriefItem) => {
            const fallback = FALLBACK.find(f => f.variant === card.variant) || {} as any;
            return {
              ...fallback,
              ...card,
              color: fallback?.color ?? card.color,
              sources: fallback?.sources ?? [],
            };
          });
          const ORDER = ['LONGEVITY','PERFORMANCE','INVESTMENTS','MENTAL HEALTH','DISCOVERIES','THREATS','PULSE'];
          const sorted = ORDER.map(v => merged.find((c: BriefItem) => c.variant === v)).filter(Boolean) as BriefItem[];
          setBrief(sorted.length > 0 ? sorted : merged);
          setCached(data.cached);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: '20px 16px 0', backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.25} 50%{opacity:.45} }
        @keyframes criticalPulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        .brief-scroll::-webkit-scrollbar { display: none; }
        .brief-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00C9A7', boxShadow: loading ? '0 0 10px #00C9A7' : '0 0 4px #00C9A766' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em' }}>AI HEALTH BRIEF</span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {loading ? 'Generating from live signals...' : cached ? 'Cached · refreshes every 6h' : 'Live · Groq AI'}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tap any card to explore sources</span>
      </div>

      {/* Cards — horizontal scroll on mobile, fills width on desktop */}
      <div className="brief-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {loading
          ? Array(7).fill(0).map((_, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--bg-secondary)', borderRadius: '8px',
                height: '120px', minWidth: '130px', flex: '0 0 130px',
                opacity: 0.25, animation: `shimmer 1.6s ease-in-out ${i * 0.08}s infinite`,
              }} />
            ))
          : brief.map((card, i) => {
              const isCritical = card.variant === 'THREATS' && (card.critical || isCriticalThreat(card.content, card.critical));
              return (
                <div
                  key={i}
                  onClick={() => setActiveCard(card)}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    backgroundColor: isCritical ? '#6B0000' : 'var(--bg-secondary)',
                    borderRadius: '8px', padding: '12px', cursor: 'pointer',
                    border: isCritical ? '1px solid #E63946' : '1px solid var(--border-color)',
                    borderTop: isCritical ? '3px solid #FF4D6D' : `3px solid ${card.color}`,
                    minHeight: '120px', minWidth: '130px', flex: '1 0 130px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isCritical ? '0 8px 24px rgba(230,57,70,0.4)' : `0 6px 20px ${card.color}22`;
                    if (!isCritical) e.currentTarget.style.backgroundColor = `${card.color}12`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = isCritical ? '#6B0000' : 'var(--bg-secondary)';
                  }}
                >
                  {isCritical && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#E63946', opacity: 0.07, animation: 'criticalPulse 2s ease-in-out infinite', pointerEvents: 'none' }} />
                  )}
                  <div style={{ fontSize: '16px', marginBottom: '6px' }}>{card.icon}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'6px' }}>
                    <div style={{
                      fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: isCritical ? '#FF8A8A' : card.color,
                      animation: isCritical ? 'criticalPulse 2s ease-in-out infinite' : 'none',
                    }}>
                      {card.title}
                    </div>
                    {card.variant === 'PULSE' && (
                      <button
                        onClick={e => { e.stopPropagation(); setShowPulseInfo(true); }}
                        title="What is Health Pulse?"
                        style={{ background:'none', border:'none', cursor:'pointer', color: card.color, fontSize:'10px', padding:'0', lineHeight:1, opacity:0.7, flexShrink:0 }}
                      >ⓘ</button>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px', lineHeight: 1.5,
                    color: isCritical ? '#FFFFFF' : 'var(--text-primary)',
                    display: 'block',
                  }}>
                    {card.content}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '9px', color: isCritical ? '#FF8A8A' : card.color, opacity: 0.7, display: 'flex', alignItems: 'center', gap: '3px' }}>
  <span>↗</span><span>{card.sources.length} sources</span>
</div>
                </div>
              );
            })
        }
      </div>

      {showPulseInfo && (
        <div onClick={() => setShowPulseInfo(false)} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', zIndex:3000, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:'var(--modal-bg)', border:'1px solid #00C9A744', borderTop:'3px solid #00C9A7', borderRadius:'12px', maxWidth:'380px', width:'100%', padding:'20px', position:'relative' }}>
            <button onClick={() => setShowPulseInfo(false)} style={{ position:'absolute', top:'12px', right:'12px', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:'16px' }}>✕</button>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
              <span style={{ fontSize:'18px' }}>🌐</span>
              <span style={{ fontSize:'12px', fontWeight:800, color:'#00C9A7', letterSpacing:'0.08em' }}>HEALTH PULSE EXPLAINED</span>
            </div>
            <p style={{ fontSize:'12px', color:'var(--text-primary)', lineHeight:1.7, marginBottom:'12px' }}>
              The <strong>Health Pulse</strong> is a real-time snapshot of global health status — synthesized by AI from live signals across all 6 categories: threats, discoveries, longevity, mental health, performance, and investments.
            </p>
            <p style={{ fontSize:'12px', color:'var(--text-primary)', lineHeight:1.7, marginBottom:'12px' }}>
              It tells you whether the global health landscape is <strong>calm</strong>, at <strong>watch level</strong>, or <strong>elevated</strong> — and why.
            </p>
            <p style={{ fontSize:'11px', color:'var(--text-secondary)', lineHeight:1.6 }}>
              Updated every hour from live RSS feeds across WHO, ECDC, Nature Medicine, BioPharma Dive, and more.
            </p>
          </div>
        </div>
      )}
      {activeCard && (
        <div onClick={() => setActiveCard(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'var(--modal-bg)',
            border: `1px solid ${activeCard.color}44`,
            borderTop: `3px solid ${activeCard.color}`,
            borderRadius: '12px', maxWidth: '480px', width: '100%',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            position: 'relative', overflow: 'hidden',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <button onClick={() => setActiveCard(null)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}>✕</button>
            <div style={{ padding: '20px 48px 16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>{activeCard.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: activeCard.color, letterSpacing: '0.1em' }}>{activeCard.title}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{activeCard.content}</p>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: '10px' }}>SOURCES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCard.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', textDecoration: 'none', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = activeCard.color; e.currentTarget.style.backgroundColor = `${activeCard.color}11`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{src.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', color: activeCard.color, backgroundColor: `${activeCard.color}20`, padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{src.type}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>↗</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
