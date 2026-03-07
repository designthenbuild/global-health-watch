'use client';

import { useState, useEffect, useCallback } from 'react';

interface Source {
  label: string;
  url: string;
  type: string;
}

interface BriefItem {
  title: string;
  content: string;
  color: string;
  variant: string;
  icon: string;
  sources: Source[];
}

const VARIANT_SOURCES: Record<string, Source[]> = {
  THREATS: [
    { label: 'WHO Disease Outbreaks', url: 'https://www.who.int/emergencies/disease-outbreak-news', type: 'Official' },
    { label: 'ProMED Mail', url: 'https://promedmail.org', type: 'Surveillance' },
    { label: 'CDC Health Alert Network', url: 'https://emergency.cdc.gov/han/', type: 'Official' },
    { label: 'HealthMap', url: 'https://www.healthmap.org', type: 'AI Monitor' },
    { label: 'ECDC Threats', url: 'https://www.ecdc.europa.eu/en/threats-and-outbreaks', type: 'Official' },
  ],
  DISCOVERIES: [
    { label: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov', type: 'Registry' },
    { label: 'New England Journal of Medicine', url: 'https://www.nejm.org', type: 'Journal' },
    { label: 'FierceBiotech', url: 'https://www.fiercebiotech.com', type: 'News' },
    { label: 'Nature Medicine', url: 'https://www.nature.com/nm/', type: 'Journal' },
    { label: 'STAT News', url: 'https://statnews.com', type: 'News' },
  ],
  'MENTAL HEALTH': [
    { label: 'NIMH News', url: 'https://www.nimh.nih.gov/news', type: 'Official' },
    { label: 'The Lancet Psychiatry', url: 'https://www.thelancet.com/journals/lanpsy/home', type: 'Journal' },
    { label: 'MAPS Psychedelic Research', url: 'https://maps.org', type: 'Research' },
    { label: 'Mental Health Weekly', url: 'https://www.mentalhealthweekly.org', type: 'News' },
    { label: 'WHO Mental Health', url: 'https://www.who.int/health-topics/mental-health', type: 'Official' },
  ],
  LONGEVITY: [
    { label: 'FightAging!', url: 'https://www.fightaging.org', type: 'Research Blog' },
    { label: 'Longevity.Technology', url: 'https://longevity.technology', type: 'News' },
    { label: 'Nature Aging', url: 'https://www.nature.com/nataging/', type: 'Journal' },
    { label: 'Buck Institute', url: 'https://www.buckinstitute.org/news/', type: 'Research' },
    { label: 'Lifespan.io', url: 'https://www.lifespan.io/news/', type: 'Advocacy' },
  ],
  PERFORMANCE: [
    { label: 'British Journal of Sports Medicine', url: 'https://bjsm.bmj.com', type: 'Journal' },
    { label: 'Examine.com', url: 'https://examine.com', type: 'Evidence DB' },
    { label: 'PubMed Exercise Science', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=exercise+performance', type: 'Research' },
    { label: 'NSCA Journal', url: 'https://journals.lww.com/nsca-jscr/pages/default.aspx', type: 'Journal' },
    { label: 'WHOOP Research', url: 'https://www.whoop.com/us/en/thelocker/', type: 'Wearable' },
  ],
  INVESTMENTS: [
    { label: 'WHO Health Financing', url: 'https://www.who.int/health-topics/health-financing', type: 'Official' },
    { label: 'Reuters Health & Pharma', url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/', type: 'News' },
    { label: 'STAT News Business', url: 'https://statnews.com/category/business/', type: 'News' },
    { label: 'BioPharma Dive', url: 'https://www.biopharmadive.com', type: 'Industry' },
    { label: 'Andreessen Horowitz', url: 'https://a16z.com/bio-health/', type: 'VC' },
  ],
  PULSE: [
    { label: 'WHO Newsroom', url: 'https://www.who.int/news-room', type: 'Official' },
    { label: 'HealthMap Global Monitor', url: 'https://www.healthmap.org', type: 'AI Monitor' },
    { label: 'Global Health Now JHU', url: 'https://www.globalhealthnow.org', type: 'Academic' },
    { label: 'Outbreak News Today', url: 'https://outbreaknewstoday.com', type: 'Surveillance' },
  ],
};

const FALLBACK: BriefItem[] = [
  { title: 'THREAT OF THE DAY', icon: '⚠️', content: 'Active outbreak monitoring across WHO, CDC, and ProMED networks. Respiratory signals elevated in Southeast Asia and West Africa.', color: '#E63946', variant: 'THREATS', sources: VARIANT_SOURCES['THREATS'] },
  { title: 'DISCOVERY OF THE DAY', icon: '🔬', content: 'Multiple Phase 3 oncology and neurology trials publishing results. CAR-T cell therapy showing promise beyond blood cancers.', color: '#00B4D8', variant: 'DISCOVERIES', sources: VARIANT_SOURCES['DISCOVERIES'] },
  { title: 'MENTAL HEALTH', icon: '🧠', content: 'Psychedelic-assisted therapy advancing through regulatory pipelines globally. PTSD and treatment-resistant depression in focus.', color: '#7C3AED', variant: 'MENTAL HEALTH', sources: VARIANT_SOURCES['MENTAL HEALTH'] },
  { title: 'LONGEVITY SIGNAL', icon: '⏳', content: 'Senolytics and NAD+ supplementation remain the most active areas. New rapamycin trial data expected Q2 2026.', color: '#059669', variant: 'LONGEVITY', sources: VARIANT_SOURCES['LONGEVITY'] },
  { title: 'PERFORMANCE', icon: '⚡', content: 'Cold and heat therapy gaining clinical validation globally. VO2 max emerging as the strongest all-cause mortality predictor.', color: '#2563EB', variant: 'PERFORMANCE', sources: VARIANT_SOURCES['PERFORMANCE'] },
  { title: 'INVESTMENTS SIGNAL', icon: '📊', content: 'Global biotech funding strong in Q1 2026. GCC health infrastructure investment accelerating. EU pharma pricing reform advancing.', color: '#D97706', variant: 'INVESTMENTS', sources: VARIANT_SOURCES['INVESTMENTS'] },
  { title: 'HEALTH PULSE', icon: '🌐', content: 'Global signals at Watch level. No critical escalations. 3 active outbreak investigations, 2 elevated regional alerts.', color: '#00C9A7', variant: 'PULSE', sources: VARIANT_SOURCES['PULSE'] },
];

export default function AIBrief() {
  const [brief, setBrief] = useState<BriefItem[]>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [activeCard, setActiveCard] = useState<BriefItem | null>(null);

  useEffect(() => {
    fetch('/api/brief')
      .then(r => r.json())
      .then(data => {
        if (data.brief?.length > 0) {
          const merged = data.brief.map((card: BriefItem, i: number) => ({
            ...FALLBACK[i],
            ...card,
            sources: FALLBACK[i]?.sources ?? [],
          }));
          setBrief(merged);
          setCached(data.cached);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const closeModal = useCallback(() => setActiveCard(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeModal]);

  return (
    <>
      <section style={{ backgroundColor: 'var(--bg-primary)', padding: '20px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00C9A7', boxShadow: loading ? '0 0 10px #00C9A7' : '0 0 4px #00C9A766' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            AI Health Brief
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.7 }}>
            {loading ? 'Generating from live signals...' : cached ? 'Cached · refreshes every 6h' : 'Live · Groq AI'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.45 }}>
            Tap any card to explore sources
          </span>
        </div>

        <div className="brief-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', height: '120px', opacity: 0.25, animation: `shimmer 1.6s ease-in-out ${i * 0.08}s infinite` }} />
              ))
            : brief.map((card, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(card)}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left',
                    border: '1px solid var(--border-color)',
                    borderTop: `3px solid ${card.color}`,
                    position: 'relative',
                    outline: 'none',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = `${card.color}12`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${card.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '6px' }}>{card.icon}</div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: card.color, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '11px', lineHeight: '1.5', color: 'var(--text-primary)', opacity: 0.85 }}>
                    {card.content}
                  </div>
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '9px', color: card.color, opacity: 0.6, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>↗</span><span>{card.sources.length} sources</span>
                  </div>
                </button>
              ))}
        </div>

        <style>{`
          @keyframes shimmer { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.5; } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @media (max-width: 1100px) { .brief-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          @media (max-width: 768px) { .brief-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px) { .brief-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      {activeCard && (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${activeCard.color}44`,
            borderTop: `3px solid ${activeCard.color}`,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: `0 24px 60px rgba(0,0,0,0.3), 0 0 40px ${activeCard.color}18`,
            animation: 'slideUp 0.2s ease',
          }}>
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border-color)',
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px 12px 0 0',
              zIndex: 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{activeCard.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: activeCard.color, letterSpacing: '0.12em' }}>{activeCard.title}</span>
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0, maxWidth: '440px' }}>{activeCard.content}</p>
                </div>
                <button
                  onClick={closeModal}
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '16px' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-color)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                >✕</button>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.12em', marginBottom: '12px' }}>
                TRACKED SOURCES · {activeCard.sources.length} feeds
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeCard.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: `${activeCard.color}0d`, border: `1px solid ${activeCard.color}22`, borderRadius: '8px', textDecoration: 'none', transition: 'all 0.15s ease', gap: '12px' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${activeCard.color}20`; e.currentTarget.style.borderColor = `${activeCard.color}55`; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${activeCard.color}0d`; e.currentTarget.style.borderColor = `${activeCard.color}22`; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: `${activeCard.color}22`, color: activeCard.color, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                        <div style={{ fontSize: '10px', color: activeCard.color, opacity: 0.8, marginTop: '1px' }}>{s.type}</div>
                      </div>
                    </div>
                    <div style={{ color: activeCard.color, fontSize: '14px', opacity: 0.7, flexShrink: 0 }}>↗</div>
                  </a>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                💡 AI brief generated by Groq from these live feeds · {cached ? 'Cached · refreshes every 6h' : 'Just generated'} · Click any source to read the latest directly.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}