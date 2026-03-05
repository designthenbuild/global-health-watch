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

const AI_BRIEF = [
  {
    title: 'THREAT OF THE DAY',
    content: 'Nipah virus in Kerala demands attention. With 40–75% fatality and no approved vaccine, even 14 cases represents a significant public health event. Fruit bat exposure season peaks in March.',
    color: '#E63946',
    variant: 'THREATS',
  },
  {
    title: 'DISCOVERY OF THE DAY',
    content: 'Imperial College psilocybin trial reports 67% remission in treatment-resistant depression. This is Phase 3 data — the highest evidence tier. FDA Breakthrough Therapy designation already granted.',
    color: '#00B4D8',
    variant: 'DISCOVERIES',
  },
  {
    title: 'MENTAL HEALTH SIGNAL',
    content: 'Three converging signals this week: psilocybin Phase 3 results, ketamine 6-month data, and a new meta-analysis on loneliness as cardiovascular risk factor. Psychedelic therapy is becoming mainstream medicine.',
    color: '#7C3AED',
    variant: 'MENTAL HEALTH',
  },
  {
    title: 'LONGEVITY SIGNAL',
    content: 'New data on rapamycin in non-diabetic adults shows 18% reduction in biological age markers at 12 months. Small trial (n=84) but well-designed. Watch for replication.',
    color: '#059669',
    variant: 'LONGEVITY',
  },
  {
    title: 'PERFORMANCE SIGNAL',
    content: 'Cold immersion 3x/week shown to reduce inflammatory markers by 40% in new Amsterdam UMC trial. Combined with sauna protocol, cardiovascular adaptation occurs 60% faster.',
    color: '#2563EB',
    variant: 'PERFORMANCE',
  },
  {
    title: 'ECONOMY SIGNAL',
    content: 'Ozempic costs $900/month in the USA vs $60 in Germany. Congressional hearing this week on pharma pricing. Biotech VC funding hit $4.2B in Q1 2026 — longevity startups lead.',
    color: '#D97706',
    variant: 'ECONOMY',
  },
  {
    title: 'HEALTH PULSE EXPLAINED',
    content: 'Pulse is at 3 — Watch. Nipah and H5N1 are being monitored but neither shows sustained human-to-human transmission. The psilocybin breakthrough offsets threat burden. No reason for alarm.',
    color: '#00C9A7',
    variant: 'PULSE',
  },
  {
    title: 'GCC ALERT',
    content: 'MERS-CoV: 2 new cases in Riyadh this week. Standard precautions for camel exposure. No evidence of human-to-human transmission. Saudi MOH monitoring closely.',
    color: '#E63946',
    variant: 'THREATS',
  },
];

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
            <div style={{ padding: '24px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>Loading...</div>
          ) : feedItems.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
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
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Updated every 6 hours · Powered by Claude</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {AI_BRIEF.map((card, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderLeft: `3px solid ${card.color}` }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: card.color, marginBottom: '6px', letterSpacing: '0.05em' }}>{card.title}</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)' }}>{card.content}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}