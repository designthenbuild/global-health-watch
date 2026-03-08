'use client';

import { useState, useEffect, useRef } from 'react';

const COUNTER_TABS = {
  THREATS: {
    color: '#E63946',
    items: [
      { label: 'Heart disease deaths this year', annualRate: 17900000, source: 'WHO', url: 'https://www.who.int/health-topics/cardiovascular-diseases' },
      { label: 'Cancer deaths this year', annualRate: 9700000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/cancer' },
      { label: 'Air pollution deaths this year', annualRate: 7000000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/ambient-air-quality-and-health' },
      { label: 'Malaria cases this year', annualRate: 249000000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/malaria' },
      { label: 'TB infections this year', annualRate: 10600000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis' },
      { label: 'Suicide deaths this year', annualRate: 720000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/suicide' },
      { label: 'Diabetes deaths this year', annualRate: 2000000, source: 'IDF', url: 'https://idf.org/about-diabetes/diabetes-facts-figures/' },
      { label: 'Children dying of hunger this year', annualRate: 3650000, source: 'UNICEF', url: 'https://www.unicef.org/nutrition' },
    ],
  },
  DISCOVERIES: {
    color: '#00B4D8',
    items: [
      { label: 'Active clinical trials globally', annualRate: 0, fixed: '421,000+', source: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
      { label: 'New drug approvals this year', annualRate: 55, source: 'FDA', url: 'https://www.fda.gov/patients/drug-development-process/step-4-fda-drug-review' },
      { label: 'Medical papers published this year', annualRate: 3000000, source: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
      { label: 'Cancer survivors globally', annualRate: 0, fixed: '53,800,000+', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/cancer' },
      { label: 'CRISPR studies published this year', annualRate: 4000, source: 'Nature', url: 'https://www.nature.com' },
      { label: 'mRNA therapy trials active', annualRate: 0, fixed: '200+', source: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
    ],
  },
  'MENTAL HEALTH': {
    color: '#7C3AED',
    items: [
      { label: 'New depression cases this year', annualRate: 48000000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/depression' },
      { label: 'New anxiety cases this year', annualRate: 40000000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/mental-disorders' },
      { label: 'Burnout cases reported this year', annualRate: 67000000, source: 'Gallup', url: 'https://www.gallup.com/workplace/231587/employee-burnout.aspx' },
      { label: 'Suicide deaths this year', annualRate: 720000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/suicide' },
      { label: 'People with untreated mental illness', annualRate: 0, fixed: '970,000,000+', source: 'WHO', url: 'https://www.who.int/health-topics/mental-health' },
      { label: 'Opioid overdose deaths this year', annualRate: 500000, source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/opioid-overdose' },
    ],
  },
  LONGEVITY: {
    color: '#059669',
    items: [
      { label: 'Active longevity clinical trials', annualRate: 0, fixed: '4,200+', source: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
      { label: 'Longevity biotech funding this year ($)', annualRate: 8000000000, source: 'Lifespan.io', url: 'https://www.lifespan.io' },
      { label: 'People over 100 years old globally', annualRate: 0, fixed: '722,000+', source: 'UN', url: 'https://www.who.int/news-room/fact-sheets/detail/ageing-and-health' },
      { label: 'Alzheimer new cases this year', annualRate: 10000000, source: 'ADI', url: 'https://www.alzint.org' },
      { label: 'Senolytic trials active globally', annualRate: 0, fixed: '40+', source: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
      { label: 'NMN/NAD+ studies published this year', annualRate: 800, source: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    ],
  },
  PERFORMANCE: {
    color: '#2563EB',
    items: [
      { label: 'Wearable device users globally', annualRate: 0, fixed: '1,100,000,000+', source: 'Statista', url: 'https://www.statista.com' },
      { label: 'Sports injuries treated this year', annualRate: 8600000, source: 'BJSM', url: 'https://bjsm.bmj.com' },
      { label: 'Sleep deprivation cases globally', annualRate: 0, fixed: '2,000,000,000+', source: 'WHO', url: 'https://www.who.int' },
      { label: 'HBOT sessions performed this year', annualRate: 15000000, source: 'UHMS', url: 'https://www.uhms.org' },
      { label: 'Elite athletes using biometrics', annualRate: 0, fixed: '90%+', source: 'BJSM', url: 'https://bjsm.bmj.com' },
      { label: 'Cold therapy studies published this year', annualRate: 1200, source: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    ],
  },
  INVESTMENTS: {
    color: '#D97706',
    items: [
      { label: 'Global health spending this year ($)', annualRate: 9800000000000, source: 'WHO', url: 'https://www.who.int/health-topics/health-financing' },
      { label: 'Health tech VC funding this year ($)', annualRate: 45000000000, source: 'Rock Health', url: 'https://rockhealth.com' },
      { label: 'Pharma M&A deals this year ($)', annualRate: 200000000000, source: 'BioPharma Dive', url: 'https://www.biopharmadive.com' },
      { label: 'Digital health startups funded this year', annualRate: 1500, source: 'Crunchbase', url: 'https://www.crunchbase.com' },
      { label: 'Longevity biotech companies globally', annualRate: 0, fixed: '700+', source: 'Longevity.Technology', url: 'https://longevity.technology' },
      { label: 'GCC health investment this year ($)', annualRate: 25000000000, source: 'Gulf News', url: 'https://gulfnews.com/uae/health' },
    ],
  },
};

const SUGGESTED = [
  'Are eggs healthy to eat daily?',
  'How does saliva health affect immunity?',
  'Are gut microbiome tests like Zoe reliable?',
  'What is VO2 max and why does it predict lifespan?',
  'Why rotate foods and not eat ginger every day?',
  'What do longevity biomarkers tell us in 2026?',
  'Cold therapy protocols — what has clinical evidence?',
  'How does sleep affect biological aging markers?',
  'What MedTech investments are growing fastest?',
  'How does hyperbaric oxygen therapy affect recovery?',
  'What does Altos Labs research mean for aging?',
  'What is the GCC investing in health tech?',
];

interface FeedItem {
  source: string;
  headline: string;
  time: string;
  tag: string;
  region: string;
  link: string;
  image?: string;
  summary?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CounterItem {
  label: string;
  annualRate: number;
  fixed?: string;
  source: string;
  url: string;
}

interface ModalItem {
  headline: string;
  source: string;
  time: string;
  link: string;
  image?: string;
  summary?: string;
}

function useCounter(annualRate: number): string {
  const [count, setCount] = useState(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const secondsElapsed = (now.getTime() - startOfYear.getTime()) / 1000;
    const secondsInYear = 365.25 * 24 * 60 * 60;
    return Math.floor((annualRate / secondsInYear) * secondsElapsed);
  });
  useEffect(() => {
    if (!annualRate) return;
    const secondsInYear = 365.25 * 24 * 60 * 60;
    const perSecond = annualRate / secondsInYear;
    const interval = setInterval(() => setCount(c => c + Math.round(perSecond)), 1000);
    return () => clearInterval(interval);
  }, [annualRate]);
  return count.toLocaleString();
}

function useTypewriter(phrases: string[], typingSpeed = 45, pauseDuration = 2200, deletingSpeed = 22): string {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pausing, setPausing] = useState(false);
  useEffect(() => {
    if (pausing) {
      const t = setTimeout(() => { setPausing(false); setDeleting(true); }, pauseDuration);
      return () => clearTimeout(t);
    }
    if (!deleting) {
      if (charIdx < phrases[phraseIdx].length) {
        const t = setTimeout(() => { setDisplayed(phrases[phraseIdx].slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, typingSpeed);
        return () => clearTimeout(t);
      } else { setPausing(true); }
    } else {
      if (charIdx > 0) {
        const t = setTimeout(() => { setDisplayed(phrases[phraseIdx].slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, deletingSpeed);
        return () => clearTimeout(t);
      } else { setDeleting(false); setPhraseIdx(i => (i + 1) % phrases.length); }
    }
  }, [charIdx, deleting, pausing, phraseIdx, phrases, typingSpeed, pauseDuration, deletingSpeed]);
  return displayed;
}

function CounterRow({ item, color }: { item: CounterItem; color: string }) {
  const value = useCounter(item.annualRate);
  const display = item.fixed ?? value;
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{item.label}</div>
          <div style={{ fontSize: '10px', color, opacity: 0.7 }}>{item.source} ↗</div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '110px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color, fontVariantNumeric: 'tabular-nums' }}>{display}</div>
          {!item.fixed && <div style={{ fontSize: '9px', color: 'var(--text-secondary)', opacity: 0.5 }}>live estimate</div>}
        </div>
      </div>
    </a>
  );
}

function StoryModal({ item, topicColor, topicLabel, onClose }: { item: ModalItem; topicColor: string; topicLabel: string; onClose: () => void; }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: `1px solid ${topicColor}55`, borderRadius: '16px', maxWidth: '560px', width: '100%', overflow: 'hidden', boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px ${topicColor}22`, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {item.image && (
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>×</button>
            </div>
          </div>
        )}
        <div style={{ padding: '20px 24px 24px' }}>
          {!item.image && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          )}
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ color: topicColor, fontWeight: 700 }}>{topicLabel.toUpperCase()}</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{item.source}</span>
            <span style={{ opacity: 0.3 }}>·</span>
            <span>{item.time}</span>
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '14px' }}>{item.headline}</div>
          {item.summary && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '20px', borderLeft: `3px solid ${topicColor}55`, paddingLeft: '12px' }}>{item.summary}</p>}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: topicColor, color: '#000', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Read full article ↗
            </a>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topicId, label, color }: { topicId: string; label: string; color: string; }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState<ModalItem | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/feed?tab=${topicId}`)
      .then(r => r.json())
      .then(data => { setItems(data.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [topicId]);

  const lead = items[0];
  const rest = items.slice(1);
  const visible = expanded ? rest : rest.slice(0, 2);
  const hasMore = rest.length > 2;

  return (
    <>
      {modal && <StoryModal item={modal} topicColor={color} topicLabel={label} onClose={() => setModal(null)} />}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s', height: '420px' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = `${color}55`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: `linear-gradient(90deg, ${color}12 0%, transparent 100%)` }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.1em' }}>{label.toUpperCase()}</span>
          {!loading && (
            <span onClick={expanded ? () => setExpanded(false) : undefined}
              style={{ marginLeft: 'auto', fontSize: '10px', color: expanded ? color : 'var(--text-secondary)', opacity: expanded ? 0.9 : 0.4, cursor: expanded ? 'pointer' : 'default', letterSpacing: '0.06em', fontWeight: expanded ? 700 : 400, userSelect: 'none' }}>
              {expanded ? '↑ SHOW LESS' : `${items.length} stories`}
            </span>
          )}
        </div>
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ padding: '20px 14px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, animation: 'pulseDot 1s infinite' }} />
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '20px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>No stories right now.</div>
          ) : (
            <>
              {lead.image && (
                <div style={{ height: '130px', overflow: 'hidden', position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={() => setModal(lead)}>
                  <img src={lead.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 5%, transparent 65%)' }} />
                </div>
              )}
              <div onClick={() => setModal(lead)}
                style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color, flexShrink: 0, marginTop: '5px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '4px' }}>{lead.headline}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.5 }}>{lead.source} · {lead.time}</div>
                </div>
              </div>
              {visible.map((item, i) => (
                <div key={i} onClick={() => setModal({ headline: item.headline, source: item.source, time: item.time, link: item.link, image: item.image, summary: item.summary })}
                  style={{ cursor: 'pointer', display: 'block', flexShrink: 0 }}>
                  <div style={{ padding: '9px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-start', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color, flexShrink: 0, marginTop: '6px', opacity: 0.5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '3px' }}>{item.headline}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.45 }}>{item.source} · {item.time}</div>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && !expanded && (
                <button onClick={() => setExpanded(true)}
                  style={{ width: '100%', padding: '8px 14px', backgroundColor: 'transparent', border: 'none', borderTop: '1px solid var(--border-color)', color, fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em', textAlign: 'left', transition: 'background 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${color}10`)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  + {rest.length - 2} MORE
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ShareButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const clean = content.replace(/\*\*(.*?)\*\*/g, '*$1*').replace(/^[-•*]\s/gm, '• ').trim();
    navigator.clipboard.writeText(`${clean}\n\nvia Global Health Watch\nglobal-health-watch.vercel.app`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function handleTwitter() {
    const first = content.split('\n')[0].replace(/\*\*/g, '');
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${first}\n\nvia Global Health Watch\nglobal-health-watch.vercel.app`)}`, '_blank');
  }
  function handleWhatsApp() {
    const wa = `*Global Health Watch*\n\n${content.replace(/\*\*(.*?)\*\*/g, '*$1*')}\n\nglobal-health-watch.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(wa)}`, '_blank');
  }
  return (
    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.45, letterSpacing: '0.08em', flexShrink: 0 }}>SHARE</span>
      <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: copied ? 'rgba(0,201,167,0.15)' : 'rgba(0,201,167,0.07)', border: `1px solid ${copied ? 'rgba(0,201,167,0.5)' : 'rgba(0,201,167,0.2)'}`, borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: copied ? '#00C9A7' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
        {copied ? '✓ Copied!' : '⎘ Copy'}
      </button>
      <button onClick={handleTwitter} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(29,161,242,0.07)', border: '1px solid rgba(29,161,242,0.2)', borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1DA1F2'; e.currentTarget.style.borderColor = 'rgba(29,161,242,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(29,161,242,0.2)'; }}>
        𝕏 Post
      </button>
      <button onClick={handleWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(37,211,102,0.07)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#25D366'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.2)'; }}>
        💬 WhatsApp
      </button>
    </div>
  );
}

function formatMessage(content: string) {
  const lines = content.split('\n').filter((l, i, arr) => !(l.trim() === '' && arr[i - 1]?.trim() === ''));
  let inSources = false;
  return lines.map((line, j) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={j} style={{ height: '8px' }} />;
    if (trimmed.match(/^sources?:/i) || trimmed.match(/^\*\*sources/i) || trimmed.match(/^sources to explore/i)) {
      inSources = true;
      return <div key={j} style={{ marginTop: '14px', marginBottom: '8px', fontSize: '10px', fontWeight: 700, color: '#00C9A7', letterSpacing: '0.12em', borderTop: '1px solid rgba(0,201,167,0.2)', paddingTop: '10px' }}>SOURCES</div>;
    }
    if (trimmed.match(/^key points?:/i) || trimmed.match(/^\*\*key/i)) {
      inSources = false;
      return <div key={j} style={{ marginTop: '12px', marginBottom: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.12em' }}>KEY POINTS</div>;
    }
    const isListItem = trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/);
    const text = trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1');
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (inSources || (isListItem && urlMatch)) {
      const colonIdx = text.indexOf(': http');
      let name = colonIdx > -1 ? text.slice(0, colonIdx).trim() : text.replace(/https?:\/\/[^\s]+/g, '').trim();
      if (!name && urlMatch) {
        try {
          const hostname = new URL(urlMatch[0]).hostname.replace('www.', '');
          name = hostname.split('.')[0];
          name = name.charAt(0).toUpperCase() + name.slice(1);
          if (hostname.includes('pubmed') || hostname.includes('ncbi')) name = 'PubMed';
          if (hostname.includes('who.int')) name = 'WHO';
          if (hostname.includes('mayoclinic')) name = 'Mayo Clinic';
          if (hostname.includes('healthline')) name = 'Healthline';
          if (hostname.includes('bmj')) name = 'BMJ';
          if (hostname.includes('nature')) name = 'Nature';
          if (hostname.includes('harvard')) name = 'Harvard Health';
          if (hostname.includes('stanford')) name = 'Stanford Medicine';
          if (hostname.includes('examine')) name = 'Examine.com';
          if (hostname.includes('fightaging')) name = 'FightAging!';
          if (hostname.includes('statnews')) name = 'STAT News';
          if (hostname.includes('a16z')) name = 'a16z';
        } catch { name = 'Source'; }
      }
      if (!name) name = 'Source';
      return (
        <a key={j} href={urlMatch ? urlMatch[0] : '#'} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', marginRight: '6px', color: '#00C9A7', fontSize: '11px', textDecoration: 'none', padding: '4px 10px', backgroundColor: 'rgba(0,201,167,0.08)', borderRadius: '20px', border: '1px solid rgba(0,201,167,0.2)', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,201,167,0.18)'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,201,167,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.2)'; }}>
          ↗ {name}
        </a>
      );
    }
    if (isListItem) {
      return <div key={j} style={{ display: 'flex', gap: '8px', marginTop: '6px', paddingLeft: '2px', lineHeight: '1.6' }}>
        <span style={{ color: '#00C9A7', flexShrink: 0, marginTop: '1px' }}>·</span>
        <span style={{ color: 'var(--text-primary)' }}>{text}</span>
      </div>;
    }
    return <p key={j} style={{ margin: '0 0 8px 0', lineHeight: '1.7', color: 'var(--text-primary)' }}>{text}</p>;
  });
}

function AskTheWatch() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typewriter = useTypewriter(SUGGESTED);
  const [chips] = useState(() => [...SUGGESTED].sort(() => Math.random() - 0.5).slice(0, 8));

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function askWatch(question: string) {
    if (!question.trim() || asking) return;
    const q = question.trim();
    setInput('');
    setExpanded(true);
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setAsking(true);
    try {
      const res = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, history: messages }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again.' }]);
    } finally { setAsking(false); }
  }

  function handleReset() {
    setMessages([]); setExpanded(false); setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  return (
    <div className="atw-hero" style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      border: '1px solid rgba(0,201,167,0.25)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: '0 0 0 1px rgba(0,201,167,0.08), 0 4px 24px rgba(0,201,167,0.06)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px',
        background: 'linear-gradient(135deg, rgba(0,201,167,0.07) 0%, rgba(0,201,167,0.02) 50%, transparent 100%)',
        borderBottom: expanded ? '1px solid var(--border-color)' : 'none',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '10px', height: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00C9A7', position: 'absolute' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00C9A7', position: 'absolute', animation: 'pingPulse 2s infinite', opacity: 0.4 }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: '16px', color: '#00C9A7', letterSpacing: '0.08em' }}>ASK THE WATCH</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7', display: 'inline-block', opacity: 0.6 }} />
              Powered by Groq AI · Live RSS context
            </span>
          </div>
          {messages.length > 0 && (
            <button onClick={handleReset} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C9A7'; e.currentTarget.style.color = '#00C9A7'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              ↺ Reset
            </button>
          )}
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
            border: `1.5px solid ${focused ? '#00C9A7' : 'rgba(0,201,167,0.2)'}`,
            borderRadius: '12px',
            padding: '0 16px',
            gap: '10px',
            transition: 'all 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(0,201,167,0.12)' : 'none',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') askWatch(input); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused || input ? 'Ask anything about health, longevity, performance, investments...' : typewriter}
              style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', padding: '16px 0', minWidth: 0 }}
            />
            {input && (
              <button onClick={() => setInput('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0', opacity: 0.35, flexShrink: 0 }}>×</button>
            )}
          </div>
          <button
            onClick={() => askWatch(input)}
            disabled={asking || !input.trim()}
            style={{
              backgroundColor: asking || !input.trim() ? 'rgba(0,201,167,0.12)' : '#00C9A7',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 28px',
              fontSize: '14px',
              fontWeight: '800',
              color: asking || !input.trim() ? 'rgba(0,201,167,0.4)' : '#000',
              cursor: asking || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
            {asking ? '···' : '↑ Ask'}
          </button>
        </div>

        {/* Topic pills */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
          {['health', 'food', 'longevity', 'performance', 'mental health', 'investments'].map(t => (
            <span key={t} style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.4, backgroundColor: 'rgba(128,128,128,0.08)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2px 10px', letterSpacing: '0.04em' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Suggestion chips — only when not expanded */}
      {!expanded && (
        <div style={{ padding: '14px 28px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.35, letterSpacing: '0.1em', flexShrink: 0, alignSelf: 'center' }}>TRY →</span>
            {chips.map((s, i) => (
              <button key={i} onClick={() => askWatch(s)}
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,201,167,0.1)'; e.currentTarget.style.color = '#00C9A7'; e.currentTarget.style.borderColor = 'rgba(0,201,167,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      {expanded && (
        <div style={{ maxHeight: '480px', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: m.role === 'user' ? '60%' : '90%',
              backgroundColor: m.role === 'user' ? 'rgba(0,201,167,0.1)' : 'var(--bg-primary)',
              border: m.role === 'user' ? '1px solid rgba(0,201,167,0.3)' : '1px solid var(--border-color)',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: m.role === 'user' ? '10px 16px' : '16px 20px',
              fontSize: '13px',
              lineHeight: '1.7',
              color: m.role === 'user' ? '#00C9A7' : 'var(--text-primary)',
            }}>
              {m.role === 'assistant' ? <div>{formatMessage(m.content)}<ShareButton content={m.content} /></div> : m.content}
            </div>
          ))}
          {asking && (
            <div style={{ alignSelf: 'flex-start', padding: '14px 18px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px 18px 18px 18px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: `pulseDot 1.2s ${delay}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
}

function LiveCounters() {
  const [counterTab, setCounterTab] = useState('THREATS');
  const activeCounterData = COUNTER_TABS[counterTab as keyof typeof COUNTER_TABS];
  const counterTabKeys = ['THREATS', 'DISCOVERIES', 'MENTAL HEALTH', 'LONGEVITY', 'PERFORMANCE', 'INVESTMENTS'];
  const tabStyle = (active: boolean, color: string) => ({
    backgroundColor: active ? color : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: `1px solid ${active ? color : 'var(--border-color)'}`,
    padding: '4px 10px', fontSize: '10px', fontWeight: '600' as const,
    cursor: 'pointer', borderRadius: '5px', whiteSpace: 'nowrap' as const, transition: 'all 0.15s',
  });
  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gridColumn: 'span 2', height: '420px' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: activeCounterData.color, animation: 'pulseDot 2s infinite' }} />
          <div style={{ fontWeight: '700', fontSize: '13px', color: activeCounterData.color }}>LIVE COUNTERS</div>
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', opacity: 0.45, marginLeft: 'auto' }}>est. from annual data</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {counterTabKeys.map(t => <button key={t} style={tabStyle(counterTab === t, COUNTER_TABS[t as keyof typeof COUNTER_TABS].color)} onClick={() => setCounterTab(t)}>{t}</button>)}
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {activeCounterData.items.map((item, i) => <CounterRow key={`${counterTab}-${i}`} item={item} color={activeCounterData.color} />)}
      </div>
    </div>
  );
}

export default function BottomPanels() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0 24px 32px' }}>
      {/* Ask the Watch — hero */}
      <div style={{ marginBottom: '20px' }}>
        <AskTheWatch />
      </div>
      {/* Feed cards grid */}
      <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        <TopicCard topicId="LONGEVITY" label="Longevity" color="#059669" />
        <TopicCard topicId="PERFORMANCE" label="Performance" color="#2563EB" />
        <TopicCard topicId="INVESTMENTS" label="Investments" color="#D97706" />
        <TopicCard topicId="MENTAL HEALTH" label="Mental Health" color="#7C3AED" />
        <TopicCard topicId="DISCOVERIES" label="Discoveries" color="#00B4D8" />
        <TopicCard topicId="THREATS" label="Threats" color="#E63946" />
        <TopicCard topicId="RECALLS" label="Recalls" color="#F97316" />
        <LiveCounters />
      </div>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.65); }
        }
        @keyframes pingPulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .atw-hero:focus-within {
          box-shadow: 0 0 0 1px rgba(0,201,167,0.15), 0 8px 32px rgba(0,201,167,0.1) !important;
          border-color: rgba(0,201,167,0.4) !important;
        }
        /* Hide scrollbar for chips row */
        .atw-hero div::-webkit-scrollbar { display: none; }

        /* Responsive: tablet */
        @media (max-width: 1024px) {
          .feed-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .feed-grid > div:last-child {
            grid-column: span 2 !important;
          }
        }

        /* Responsive: mobile */
        @media (max-width: 640px) {
          .feed-grid {
            grid-template-columns: 1fr !important;
          }
          .feed-grid > div:last-child {
            grid-column: span 1 !important;
          }
          .atw-hero > div:first-child {
            padding: 16px !important;
          }
          .atw-hero > div:first-child > div:nth-child(2) {
            flex-direction: column !important;
          }
          .atw-hero > div:first-child > div:nth-child(2) > button {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}
