'use client';

import { useState, useEffect } from 'react';

const NUMBERS = [
  { label: 'Heart disease deaths this year', value: '4,812,447', trend: '↑', source: 'WHO GHO' },
  { label: 'Cancer diagnoses this year', value: '3,241,890', trend: '↑', source: 'WHO' },
  { label: 'New dengue cases this week', value: '284,000', trend: '↑', source: 'WHO/ECDC' },
  { label: 'TB infections this year', value: '891,230', trend: '→', source: 'WHO' },
  { label: 'Diabetes diagnoses today', value: '22,841', trend: '↑', source: 'IDF' },
  { label: 'Suicide deaths this year', value: '192,447', trend: '→', source: 'WHO' },
  { label: "Alzheimer's new cases this year", value: '1,102,334', trend: '↑', source: 'ADI' },
  { label: 'Malaria cases this year', value: '14,882,001', trend: '↑', source: 'WHO' },
  { label: 'FDA drug approvals this month', value: '4', trend: '→', source: 'FDA' },
  { label: 'Active clinical trials globally', value: '421,883', trend: '↑', source: 'ClinicalTrials.gov' },
];

const COMMUNITY = [
  { source: 'Reuters Health', headline: 'WHO declares end to mpox emergency in DRC as cases plateau' },
  { source: 'STAT News', headline: 'Biotech funding rebounds in Q1 2026 — AI drug discovery leads' },
  { source: 'The Lancet', headline: 'Global burden of antimicrobial resistance now exceeds HIV and malaria combined' },
  { source: 'Al Jazeera Health', headline: 'GCC countries launch joint pandemic preparedness framework' },
  { source: 'BBC Health', headline: 'Ultra-processed food linked to 32 health conditions in landmark study' },
  { source: 'ProMED', headline: 'Novel orthopoxvirus detected in rodents — monitoring underway' },
  { source: 'Fierce Biotech', headline: 'Pfizer acquires longevity biotech for $4.2B in gene therapy push' },
  { source: 'Gulf News Health', headline: 'UAE launches national mental health strategy targeting 1M residents' },
  { source: 'Reddit r/medicine', headline: 'Physicians report surge in long COVID cognitive complaints in under-40s' },
];

const FALLBACK_BRIEF = [
  { title: 'THREAT OF THE DAY', content: 'Monitoring active global health signals across WHO, CDC, and ProMED networks. No critical alerts at this time.', color: '#E63946', variant: 'THREATS' },
  { title: 'DISCOVERY OF THE DAY', content: 'Clinical trial activity remains high globally. Multiple Phase 3 trials in oncology and neurology publishing results this week.', color: '#00B4D8', variant: 'DISCOVERIES' },
  { title: 'MENTAL HEALTH SIGNAL', content: 'Psychedelic-assisted therapy continues to advance through regulatory pipelines in the US and EU.', color: '#7C3AED', variant: 'MENTAL HEALTH' },
  { title: 'LONGEVITY SIGNAL', content: 'Senolytics and NAD+ research remain the most active areas in longevity science. Watch for new rapamycin trial data.', color: '#059669', variant: 'LONGEVITY' },
  { title: 'PERFORMANCE SIGNAL', content: 'Cold and heat therapy protocols gaining mainstream clinical validation. VO2 max emerging as strongest longevity biomarker.', color: '#2563EB', variant: 'PERFORMANCE' },
  { title: 'ECONOMY SIGNAL', content: 'Biotech funding remains strong in Q1 2026. Drug pricing reform under active Congressional debate.', color: '#D97706', variant: 'ECONOMY' },
  { title: 'HEALTH PULSE EXPLAINED', content: 'Global health signals are at Watch level. Multiple threats being monitored, no critical escalations. Stay informed.', color: '#00C9A7', variant: 'PULSE' },
];

interface BriefItem {
  title: string;
  content: string;
  color: string;
  variant: string;
}

interface FeedItem {
  source: string;
  headline: string;
  time: string;
  tag: string;
  region: string;
  link: string;
}

export default function BottomPanels() {
  const [feedTab, setFeedTab] = useState('ALL');
  const [numbersTab, setNumbersTab] = useState('NUMBERS');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [brief, setBrief] = useState<BriefItem[]>(FALLBACK_BRIEF);
  const [briefLoading, setBriefLoading] = useState(true);
  const [briefCached, setBriefCached] = useState(false);

  useEffect(() => {
    setFeedLoading(true);
    fetch(`/api/feed?tab=${feedTab}`)
      .then(r => r.json())
      .then(data => {
        if (data.items?.length > 0) setFeedItems(data.items);
        setFeedLoading(false);
      })
      .catch(() => setFeedLoading(false));
  }, [feedTab]);

  useEffect(() => {
    setBriefLoading(true);
    fetch('/api/brief')
      .then(r => r.json())
      .then(data => {
        if (data.brief?.length > 0) {
          setBrief(data.brief);
          setBriefCached(data.cached);
        }
        setBriefLoading(false);
      })
      .catch(() => setBriefLoading(false));
  }, []);

  const feedTabs = ['ALL', 'OUTBREAKS', 'DISCOVERIES', 'MENTAL HEALTH', 'LONGEVITY', 'PERFORMANCE', 'ECONOMY', 'RECALLS'];

  const panelStyle = {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    height: '420px',
  };

  const FEED_TAB_COLORS: Record<string, string> = {
    ALL: '#00C9A7',
    OUTBREAKS: '#E63946',
    DISCOVERIES: '#00B4D8',
    'MENTAL HEALTH': '#7C3AED',
    LONGEVITY: '#059669',
    PERFORMANCE: '#2563EB',
    ECONOMY: '#D97706',
    RECALLS: '#E63946',
  };

  const tabStyle = (active: boolean, tab: string) => ({
    backgroundColor: active ? (FEED_TAB_COLORS[tab] || '#00C9A7') : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: `1px solid ${active ? (FEED_TAB_COLORS[tab] || '#00C9A7') : 'rgba(255,255,255,0.12)'}`,
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px 24px', backgroundColor: 'var(--bg-primary)' }}>

      {/* LEFT — Feed */}
      <div style={panelStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: 'var(--accent-teal)' }}>LIVE INTELLIGENCE FEED</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {feedTabs.map(t => (
              <button key={t} style={tabStyle(feedTab === t, t)} onClick={() => setFeedTab(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {feedLoading ? (
            <div style={{ padding: '24px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading feed...</div>
          ) : feedItems.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-teal)', fontSize: '11px', fontWeight: '700' }}>{item.source}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{item.time}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '4px' }}>{item.headline}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>{item.tag}</span>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>{item.region}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CENTRE — Numbers / Community */}
      <div style={panelStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={tabStyle(numbersTab === 'NUMBERS', 'ALL')} onClick={() => setNumbersTab('NUMBERS')}>TODAY&apos;S NUMBERS</button>
            <button style={tabStyle(numbersTab === 'COMMUNITY', 'ALL')} onClick={() => setNumbersTab('COMMUNITY')}>COMMUNITY SIGNALS</button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {numbersTab === 'NUMBERS' ? NUMBERS.map((n, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{n.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>{n.source}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-teal)' }}>{n.value}</div>
                <div style={{ fontSize: '12px', color: n.trend === '↑' ? '#E63946' : 'var(--text-secondary)' }}>{n.trend}</div>
              </div>
            </div>
          )) : COMMUNITY.map((c, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'var(--accent-teal)', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>{c.source}</div>
              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{c.headline}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — AI Brief */}
      <div style={panelStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent-teal)' }}>AI HEALTH BRIEF</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {briefLoading ? 'Generating brief...' : briefCached ? 'Cached · Updates every 6 hours · Groq AI' : 'Just generated · Groq AI'}
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {briefLoading ? (
            <div style={{ padding: '24px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <div>Generating AI brief from live health signals...</div>
              <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.6 }}>This takes 5-10 seconds on first load</div>
            </div>
          ) : brief.map((card, i) => (
            <div
              key={i}
              style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${card.color}`, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ fontSize: '11px', fontWeight: '700', color: card.color, marginBottom: '6px', letterSpacing: '0.05em' }}>{card.title}</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{card.content}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}