'use client';

import { useState, useEffect, useRef } from 'react';

const NUMBERS = [
  { label: 'Heart disease deaths this year', value: '4,812,447', trend: '↑', source: 'WHO GHO', url: 'https://www.who.int/health-topics/cardiovascular-diseases' },
  { label: 'Cancer diagnoses this year', value: '3,241,890', trend: '↑', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/cancer' },
  { label: 'New dengue cases this week', value: '284,000', trend: '↑', source: 'WHO/ECDC', url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue' },
  { label: 'TB infections this year', value: '891,230', trend: '→', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/tuberculosis' },
  { label: 'Diabetes diagnoses today', value: '22,841', trend: '↑', source: 'IDF', url: 'https://idf.org/about-diabetes/diabetes-facts-figures/' },
  { label: 'Suicide deaths this year', value: '192,447', trend: '→', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/suicide' },
  { label: "Alzheimer's new cases this year", value: '1,102,334', trend: '↑', source: 'ADI', url: 'https://www.alzint.org/about/dementia-facts-figures/' },
  { label: 'Malaria cases this year', value: '14,882,001', trend: '↑', source: 'WHO', url: 'https://www.who.int/news-room/fact-sheets/detail/malaria' },
  { label: 'Active clinical trials globally', value: '421,883', trend: '↑', source: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
];

const COMMUNITY = [
  { source: 'Reuters Health', headline: 'WHO declares end to mpox emergency in DRC as cases plateau', url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/' },
  { source: 'STAT News', headline: 'Biotech funding rebounds in Q1 2026 — AI drug discovery leads', url: 'https://statnews.com' },
  { source: 'The Lancet', headline: 'Global burden of antimicrobial resistance now exceeds HIV and malaria combined', url: 'https://www.thelancet.com' },
  { source: 'Al Jazeera Health', headline: 'GCC countries launch joint pandemic preparedness framework', url: 'https://www.aljazeera.com/tag/health/' },
  { source: 'BBC Health', headline: 'Ultra-processed food linked to 32 health conditions in landmark study', url: 'https://www.bbc.com/news/health' },
  { source: 'ProMED', headline: 'Novel orthopoxvirus detected in rodents — monitoring underway', url: 'https://promedmail.org' },
  { source: 'FierceBiotech', headline: 'Pfizer acquires longevity biotech for $4.2B in gene therapy push', url: 'https://www.fiercebiotech.com' },
  { source: 'Gulf News Health', headline: 'UAE launches national mental health strategy targeting 1M residents', url: 'https://gulfnews.com/uae/health' },
  { source: 'Reddit r/medicine', headline: 'Physicians report surge in long COVID cognitive complaints in under-40s', url: 'https://www.reddit.com/r/medicine/' },
];

const SUGGESTED = [
  'Are eggs healthy to eat daily? How many is too many?',
  'What is the beetroot transit time test and what does it reveal?',
  'How does saliva health affect your immune system?',
  'Are home gut microbiome tests like Zoe actually reliable?',
  'What is a safe colon flush and how does castor oil work?',
  'Why should you rotate foods and not eat ginger every day?',
  'What does your stool colour and shape tell you about your health?',
  'Raw honey vs regular honey — does the source actually matter?',
  'What is VO2 max and why does it predict lifespan?',
  'What does elevated skin temperature at night mean on a wearable?',
  'How does fear of death develop and how to manage it?',
  'What are the top longevity biomarkers to track in 2026?',
  'Cold therapy protocols — what actually has clinical evidence?',
  'How does sleep affect biological aging markers?',
  'What MedTech investments are growing fastest in 2026?',
];

interface FeedItem {
  source: string;
  headline: string;
  time: string;
  tag: string;
  region: string;
  link: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function BottomPanels() {
  const [feedTab, setFeedTab] = useState('ALL');
  const [numbersTab, setNumbersTab] = useState('NUMBERS');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Ask the Watch state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function askWatch(question: string) {
    if (!question.trim() || asking) return;
    const q = question.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setAsking(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer ?? 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }]);
    } finally {
      setAsking(false);
    }
  }

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
    ALL: '#00C9A7', OUTBREAKS: '#E63946', DISCOVERIES: '#00B4D8',
    'MENTAL HEALTH': '#7C3AED', LONGEVITY: '#059669',
    PERFORMANCE: '#2563EB', ECONOMY: '#D97706', RECALLS: '#E63946',
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
    <div className="bottom-panels" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px 24px 24px', backgroundColor: 'var(--bg-primary)' }}>

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
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
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
            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{n.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-teal)', opacity: 0.7 }}>{n.source} ↗</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-teal)' }}>{n.value}</div>
                  <div style={{ fontSize: '12px', color: n.trend === '↑' ? '#E63946' : 'var(--text-secondary)' }}>{n.trend}</div>
                </div>
              </div>
            </a>
          )) : COMMUNITY.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ color: 'var(--accent-teal)', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>{c.source} ↗</div>
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{c.headline}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* RIGHT — Ask the Watch */}
      <div style={panelStyle}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🔭</span>
            <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--accent-teal)' }}>ASK THE WATCH</div>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', opacity: 0.7 }}>
            Health intelligence · food · body · longevity · performance
          </div>
        </div>

        {/* Chat messages */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {messages.length === 0 ? (
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '10px', letterSpacing: '0.06em' }}>
                TRY ASKING
              </div>
              {[...SUGGESTED].sort(() => Math.random() - 0.5).slice(0, 6).map((s, i) => (
                <button
                  key={i}
                  onClick={() => askWatch(s)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    backgroundColor: 'rgba(0,201,167,0.06)',
                    border: '1px solid rgba(0,201,167,0.15)',
                    borderRadius: '6px', padding: '7px 10px',
                    fontSize: '11px', color: 'var(--text-secondary)',
                    cursor: 'pointer', marginBottom: '5px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,201,167,0.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,201,167,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  backgroundColor: m.role === 'user' ? 'rgba(0,201,167,0.15)' : 'rgba(255,255,255,0.05)',
                  border: m.role === 'user' ? '1px solid rgba(0,201,167,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: m.role === 'user' ? '#00C9A7' : 'var(--text-primary)',
                }}>
                  {m.content}
                </div>
              ))}
              {asking && (
                <div style={{ alignSelf: 'flex-start', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 2px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') askWatch(input); }}
            placeholder="Ask anything about health..."
            style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', padding: '7px 10px',
              fontSize: '12px', color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            onClick={() => askWatch(input)}
            disabled={asking || !input.trim()}
            style={{
              backgroundColor: asking ? 'rgba(0,201,167,0.3)' : '#00C9A7',
              border: 'none', borderRadius: '6px',
              padding: '7px 12px', fontSize: '12px',
              fontWeight: '700', color: '#000',
              cursor: asking ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
          >
            {asking ? '...' : '↑'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .bottom-panels { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .bottom-panels { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}