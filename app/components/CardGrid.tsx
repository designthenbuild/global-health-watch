'use client';

import { useState, useEffect } from 'react';

const VARIANT_COLORS: Record<string, string> = {
  THREATS: '#E63946',
  DISCOVERIES: '#00B4D8',
  'MENTAL HEALTH': '#7C3AED',
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  ECONOMY: '#D97706',
};

const HIGH_ALERT_KEYWORDS = ['death', 'deaths', 'fatal', 'fatality', 'outbreak', 'surge', 'alert', 'emergency', 'epidemic', 'pandemic', 'kills', 'killed', 'confirmed cases', 'spreading'];

function isHighAlert(headline: string, ageMinutes: number): boolean {
  if (ageMinutes > 240) return false; // older than 4h = never high alert
  const lower = headline.toLowerCase();
  return HIGH_ALERT_KEYWORDS.some(k => lower.includes(k));
}

function parseAgeMinutes(time: string): number {
  const m = time.match(/(\d+)\s*(min|hour|h|day|d|week|w)/i);
  if (!m) return 9999;
  const n = parseInt(m[1]);
  const u = m[2].toLowerCase()[0];
  if (u === 'm') return n;
  if (u === 'h') return n * 60;
  if (u === 'd') return n * 1440;
  if (u === 'w') return n * 10080;
  return 9999;
}

// ── STATIC CARD DATA (non-THREATS) ──────────────────────────────────────────

const DISCOVERIES_CARDS = [
  { category: 'Cancer', headlines: [
    { text: 'CAR-T therapy achieves complete remission in 54% of lymphoma patients', source: 'NEJM', time: '1d ago' },
    { text: 'Liquid biopsy detects pancreatic cancer 2 years before symptoms', source: 'Nature', time: '2d ago' },
    { text: 'New KRAS inhibitor shows activity in untreatable lung cancer', source: 'FDA', time: '3d ago' },
  ]},
  { category: 'Cardiovascular', headlines: [
    { text: 'GLP-1 reduces heart attack risk by 20% in non-diabetics', source: 'NEJM', time: '2d ago' },
    { text: 'Gene therapy corrects inherited heart condition in single dose', source: 'The Lancet', time: '4d ago' },
    { text: 'New statin alternative with fewer side effects enters trial', source: 'JAMA', time: '5d ago' },
  ]},
  { category: 'Brain & Neurology', headlines: [
    { text: 'Lecanemab slows Alzheimer\'s progression by 35% at 18 months', source: 'NEJM', time: '3d ago' },
    { text: 'Deep brain stimulation shows promise for treatment-resistant OCD', source: 'Nature Med', time: '4d ago' },
    { text: 'Blood test detects Parkinson\'s 7 years before motor symptoms', source: 'The Lancet', time: '1w ago' },
  ]},
  { category: 'Diabetes & Metabolic', headlines: [
    { text: 'Once-weekly insulin injection enters Phase 3', source: 'FDA', time: '2d ago' },
    { text: 'GLP-1 drugs show benefit in addiction and depression', source: 'NEJM', time: '3d ago' },
    { text: 'Artificial pancreas approved for Type 1 diabetes in under-7s', source: 'FDA', time: '5d ago' },
  ]},
  { category: 'Psychedelic Therapy', headlines: [
    { text: 'Psilocybin achieves 67% remission in treatment-resistant depression', source: 'The Lancet', time: '6h ago' },
    { text: 'MDMA-assisted therapy for PTSD: FDA resubmission underway', source: 'MAPS', time: '2d ago' },
    { text: 'Ketamine shows sustained 6-month benefit in suicidal ideation', source: 'NIMH', time: '4d ago' },
  ]},
  { category: 'Rare Diseases', headlines: [
    { text: 'Gene therapy cures sickle cell disease in 95% of participants', source: 'NEJM', time: '1w ago' },
    { text: 'First treatment approved for progeria', source: 'FDA', time: '1w ago' },
    { text: 'RNA therapy halts progression of fatal prion disease', source: 'NEJM', time: '2w ago' },
  ]},
  { category: 'Vaccine Pipeline', headlines: [
    { text: 'mRNA malaria vaccine shows 77% efficacy in Phase 3', source: 'The Lancet', time: '3d ago' },
    { text: 'Universal flu vaccine enters human trials', source: 'NIH', time: '5d ago' },
    { text: 'HIV vaccine candidate generates broadly neutralising antibodies', source: 'Nature', time: '1w ago' },
  ]},
  { category: 'Gene Therapy', headlines: [
    { text: 'CRISPR base editing corrects haemophilia B in single infusion', source: 'NEJM', time: '4d ago' },
    { text: 'In-vivo gene editing repairs liver disease without removing cells', source: 'Nature', time: '6d ago' },
    { text: 'Prime editing achieves 89% correction rate in muscular dystrophy', source: 'Science', time: '1w ago' },
  ]},
  { category: 'Long COVID', headlines: [
    { text: 'Anticoagulant therapy reduces long COVID symptoms by 40%', source: 'The Lancet', time: '2d ago' },
    { text: 'Viral persistence confirmed in 60% of long COVID cases', source: 'Nature', time: '5d ago' },
    { text: 'Low-dose naltrexone shows benefit for long COVID fatigue', source: 'NEJM', time: '1w ago' },
  ]},
];

const MENTAL_HEALTH_CARDS = [
  { category: 'Depression & Anxiety', headlines: [
    { text: 'Psilocybin Phase 3: 67% remission in treatment-resistant depression', source: 'The Lancet', time: '6h ago' },
    { text: 'Ketamine sustained benefit confirmed at 6 months', source: 'NIMH', time: '2d ago' },
    { text: 'New SSRI class shows faster onset with fewer side effects', source: 'NEJM', time: '5d ago' },
  ]},
  { category: 'Trauma & PTSD', headlines: [
    { text: 'MDMA-assisted therapy: 67% no longer meet PTSD criteria', source: 'Nature Med', time: '3d ago' },
    { text: 'Prolonged exposure therapy enhanced by propranolol', source: 'JAMA', time: '1w ago' },
    { text: 'Eye movement desensitisation gains new meta-analysis support', source: 'The Lancet', time: '2w ago' },
  ]},
  { category: 'Loneliness & Social', headlines: [
    { text: 'Loneliness increases cardiovascular risk by 29% — UK Biobank', source: 'The Lancet', time: '4d ago' },
    { text: 'WHO launches global commission on social connection', source: 'WHO', time: '1w ago' },
    { text: 'Social prescribing reduces GP visits by 28% in UK trial', source: 'BMJ', time: '2w ago' },
  ]},
  { category: 'Youth Mental Health', headlines: [
    { text: 'Smartphone restrictions in schools reduce anxiety by 17%', source: 'Nature', time: '3d ago' },
    { text: 'CBT-based app shows efficacy in adolescent depression', source: 'JAMA', time: '1w ago' },
    { text: 'Youth mental health crisis declared in 34 countries — WHO', source: 'WHO', time: '2w ago' },
  ]},
];

const LONGEVITY_CARDS = [
  { category: 'Senolytics', headlines: [
    { text: 'Senolytic combo clears 70% of senescent cells in Phase 2', source: 'Nature Aging', time: '3d ago' },
    { text: 'Dasatinib + quercetin improves mobility in adults 65+', source: 'The Lancet', time: '1w ago' },
    { text: 'Unity Biotechnology senolytic shows cartilage regeneration', source: 'NEJM', time: '2w ago' },
  ]},
  { category: 'HBOT & Oxygen', headlines: [
    { text: 'HBOT reverses biological aging hallmarks in adults 64+', source: 'Aging', time: '2d ago' },
    { text: 'Hypobaric oxygen protocol shows cognitive enhancement', source: 'Nature', time: '1w ago' },
    { text: 'HBOT 60-session protocol improves telomere length by 20%', source: 'Aging', time: '3w ago' },
  ]},
  { category: 'Red Light & PBM', headlines: [
    { text: 'Near-infrared improves mitochondrial function by 25%', source: 'Nature Aging', time: '1w ago' },
    { text: 'Red light therapy reduces joint inflammation in 8-week trial', source: 'JAMA', time: '2w ago' },
    { text: 'Photobiomodulation shows neuroprotective effects in Parkinson\'s', source: 'Nature', time: '3w ago' },
  ]},
  { category: 'NAD+ & Supplements', headlines: [
    { text: 'NMN supplementation reverses vascular aging by 10 years', source: 'Science', time: '1w ago' },
    { text: 'Rapamycin shows 18% reduction in biological age markers', source: 'Nature Aging', time: '2w ago' },
    { text: 'Resveratrol + NMN combo shows synergistic effect in trial', source: 'Cell', time: '3w ago' },
  ]},
  { category: 'Exosomes & Peptides', headlines: [
    { text: 'Exosome therapy shows tissue regeneration in Phase 1', source: 'Nature Med', time: '5d ago' },
    { text: 'BPC-157 accelerates tendon healing by 40% in human trial', source: 'JAMA', time: '2w ago' },
    { text: 'Thymosin alpha-1 shows immune restoration in aging adults', source: 'The Lancet', time: '3w ago' },
  ]},
  { category: 'EBOO & Ozone', headlines: [
    { text: 'EBOO therapy shows mitochondrial enhancement in 12-week trial', source: 'Aging', time: '1w ago' },
    { text: 'Ozone therapy reduces inflammatory markers by 35%', source: 'Nature', time: '2w ago' },
    { text: 'Major autohemotherapy gains clinical guideline support in EU', source: 'ECDC', time: '1m ago' },
  ]},
];

const PERFORMANCE_CARDS = [
  { category: 'Cold & Heat Therapy', headlines: [
    { text: 'Cold immersion 3x/week reduces inflammation markers by 40%', source: 'Cell Metabolism', time: '1w ago' },
    { text: 'Sauna 4x/week linked to 40% lower cardiovascular mortality', source: 'JAMA', time: '2w ago' },
    { text: 'Combined cold-heat protocol accelerates recovery by 60%', source: 'Nature', time: '3w ago' },
  ]},
  { category: 'VO2 Max & Fitness', headlines: [
    { text: 'Top VO2 max quintile has 5x lower mortality risk', source: 'JAMA', time: '1w ago' },
    { text: 'Zone 2 training 3h/week reverses metabolic syndrome markers', source: 'Cell', time: '2w ago' },
    { text: 'HIIT shown superior to steady-state for longevity biomarkers', source: 'NEJM', time: '3w ago' },
  ]},
  { category: 'Sleep Optimisation', headlines: [
    { text: 'Consistent sleep timing more important than duration — Stanford', source: 'Nature', time: '5d ago' },
    { text: 'Sleep tracking accuracy of consumer wearables validated', source: 'JAMA', time: '2w ago' },
    { text: 'Magnesium glycinate improves deep sleep by 15% in trial', source: 'Sleep', time: '3w ago' },
  ]},
  { category: 'Nutrition & Biohacking', headlines: [
    { text: 'Time-restricted eating 8h window shows metabolic benefits', source: 'Cell', time: '1w ago' },
    { text: 'Creatine supplementation shows cognitive benefit beyond muscle', source: 'Nature', time: '2w ago' },
    { text: 'Mediterranean diet reduces biological age by 1.5 years', source: 'The Lancet', time: '3w ago' },
  ]},
];

const ECONOMY_CARDS = [
  { category: 'Drug Pricing', headlines: [
    { text: 'Ozempic costs $900/month in USA vs $60 in Germany', source: 'Reuters', time: '3d ago' },
    { text: 'Medicare drug pricing negotiations cut costs for 10 drugs', source: 'CMS', time: '1w ago' },
    { text: 'EU pharma reform targets excessive pricing — 14 countries sign', source: 'EU Commission', time: '2w ago' },
  ]},
  { category: 'Biotech Funding', headlines: [
    { text: '$4.2B raised in longevity biotech Q1 2026 — record quarter', source: 'Nature Biotech', time: '5d ago' },
    { text: 'AI drug discovery startups attract $2.1B in new rounds', source: 'STAT News', time: '1w ago' },
    { text: 'GCC sovereign wealth funds increase health tech allocation', source: 'Reuters', time: '2w ago' },
  ]},
  { category: 'Health Policy', headlines: [
    { text: 'WHO pandemic treaty negotiations resume — 3 key disputes remain', source: 'WHO', time: '2d ago' },
    { text: 'UK NHS AI diagnostics rollout reaches 50 hospitals', source: 'BMJ', time: '1w ago' },
    { text: 'UAE launches $2B health AI initiative — 5-year plan', source: 'Gulf News', time: '2w ago' },
  ]},
  { category: 'Pharma M&A', headlines: [
    { text: 'Pfizer acquires longevity biotech for $4.2B', source: 'Fierce Biotech', time: '3d ago' },
    { text: 'Novo Nordisk expands GLP-1 manufacturing — $6B investment', source: 'Reuters', time: '1w ago' },
    { text: 'Johnson & Johnson spins off consumer health entity', source: 'WSJ', time: '2w ago' },
  ]},
];

// ── TYPES ────────────────────────────────────────────────────────────────────

interface CardData {
  category: string;
  headlines: { text: string; source: string; time: string; link?: string; alert?: boolean }[];
  isLive?: boolean;
}

interface CardRowProps {
  title: string;
  cards: CardData[];
  color: string;
  variant: string;
  loading?: boolean;
}

// ── CARD ROW ─────────────────────────────────────────────────────────────────

function CardRow({ title, cards, color, variant, loading }: CardRowProps) {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{ width: '4px', height: '16px', backgroundColor: color, borderRadius: '2px' }} />
        <span style={{ fontSize: '11px', fontWeight: '800', color, letterSpacing: '0.1em' }}>{title}</span>
        {loading && <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Loading live data…</span>}
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cards.length, 6)}, 1fr)`, gap: '10px' }}
        className="card-row-grid"
      >
        {cards.map((card, i) => {
          const hasAlert = card.headlines.some(h => h.alert);
          const borderColor = hasAlert ? color : `${color}55`;
          const borderStyle = hasAlert ? `2px solid ${color}` : `1px solid ${color}44`;

          return (
            <div
              key={i}
              onClick={() => setSelectedCard(selectedCard?.category === card.category ? null : card)}
              style={{
                backgroundColor: selectedCard?.category === card.category ? `${color}11` : 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '14px',
                borderTop: borderStyle,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hasAlert
                  ? `0 0 12px ${color}33`
                  : selectedCard?.category === card.category ? `0 0 16px ${color}22` : 'none',
                position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = hasAlert ? `0 0 12px ${color}33` : selectedCard?.category === card.category ? `0 0 16px ${color}22` : 'none'; }}
            >
              {/* HIGH ALERT badge — only when genuinely urgent */}
              {hasAlert && (
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  backgroundColor: `${color}22`, border: `1px solid ${color}66`,
                  borderRadius: '4px', padding: '2px 6px',
                  fontSize: '9px', fontWeight: '800', color, letterSpacing: '0.08em',
                }}>
                  ● ALERT
                </div>
              )}

              <div style={{ fontWeight: '700', fontSize: '12px', marginBottom: '3px', color: 'var(--text-primary)', paddingRight: hasAlert ? '52px' : '0' }}>{card.category}</div>
              <div style={{ fontSize: '10px', color, fontWeight: '600', marginBottom: '10px', opacity: 0.8 }}>
                {card.isLive ? '● LIVE' : variant}
              </div>
              {card.headlines.map((h, j) => (
                <div key={j} style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '11px', lineHeight: '1.4', marginBottom: '2px',
                    color: h.alert ? 'var(--text-primary)' : 'var(--text-primary)',
                    fontWeight: h.alert ? '600' : '400',
                  }}>
                    {h.link ? (
                      <a href={h.link} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}
                      >{h.text}</a>
                    ) : h.text}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{h.source} · {h.time}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {selectedCard && (
        <div style={{
          marginTop: '10px',
          backgroundColor: `${color}0D`,
          border: `1px solid ${color}33`,
          borderRadius: '8px',
          padding: '16px',
          animation: 'slideDown 0.2s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '13px', color }}>{selectedCard.category}</span>
            <button onClick={() => setSelectedCard(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          {selectedCard.headlines.map((h, i) => (
            <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < selectedCard.headlines.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '4px', color: 'var(--text-primary)', fontWeight: h.alert ? '600' : '400' }}>
                {h.link ? (
                  <a href={h.link} target="_blank" rel="noopener noreferrer" style={{ color: color, textDecoration: 'none' }}>
                    {h.text} ↗
                  </a>
                ) : h.text}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{h.source} · {h.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LIVE THREATS ROW ──────────────────────────────────────────────────────────

function LiveThreatsRow() {
  const color = VARIANT_COLORS.THREATS;
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feed?tab=THREATS')
      .then(r => r.json())
      .then(data => {
        const items: { headline: string; source: string; time: string; link: string }[] = data.items ?? [];

        // Group items into category buckets by keyword
        const buckets: Record<string, typeof items> = {
          'Outbreaks & Alerts': [],
          'Vector & Zoonotic': [],
          'AMR': [],
          'Food & Product Safety': [],
          'Air & Environment': [],
          'Other': [],
        };

        items.forEach(item => {
          const lower = item.headline.toLowerCase();
          if (['cholera', 'measles', 'nipah', 'ebola', 'mpox', 'monkeypox', 'outbreak', 'surge'].some(k => lower.includes(k))) {
            buckets['Outbreaks & Alerts'].push(item);
          } else if (['h5n1', 'avian', 'mers', 'dengue', 'malaria', 'mosquito', 'zoonot', 'animal'].some(k => lower.includes(k))) {
            buckets['Vector & Zoonotic'].push(item);
          } else if (['antibiotic', 'resistant', 'amr', 'drug-resistant', 'tb ', 'tuberculosis'].some(k => lower.includes(k))) {
            buckets['AMR'].push(item);
          } else if (['recall', 'contamina', 'listeria', 'salmonella', 'fda', 'efsa', 'food safety'].some(k => lower.includes(k))) {
            buckets['Food & Product Safety'].push(item);
          } else if (['air quality', 'pm2.5', 'aqi', 'wildfire', 'smoke', 'pollution'].some(k => lower.includes(k))) {
            buckets['Air & Environment'].push(item);
          } else {
            buckets['Other'].push(item);
          }
        });

        // Build cards from non-empty buckets
        const built: CardData[] = Object.entries(buckets)
          .filter(([, v]) => v.length > 0)
          .slice(0, 6)
          .map(([category, entries]) => ({
            category,
            isLive: true,
            headlines: entries.slice(0, 3).map(e => {
              const age = parseAgeMinutes(e.time);
              const alert = isHighAlert(e.headline, age);
              return { text: e.headline, source: e.source, time: e.time, link: e.link, alert };
            }),
          }));

        // Fallback if feed empty
        if (built.length === 0) {
          setCards(getFallbackThreats());
        } else {
          setCards(built);
        }
        setLoading(false);
      })
      .catch(() => {
        setCards(getFallbackThreats());
        setLoading(false);
      });
  }, []);

  return (
    <CardRow
      title="THREATS"
      cards={cards}
      color={color}
      variant="THREATS"
      loading={loading}
    />
  );
}

function getFallbackThreats(): CardData[] {
  return [
    { category: 'Active Outbreaks', headlines: [
      { text: 'Nipah virus: 14 cases in Kerala, response teams deployed', source: 'WHO', time: '2h ago', alert: true },
      { text: 'Cholera surges in Sudan — 1,200 new cases this week', source: 'ProMED', time: '4h ago', alert: false },
      { text: 'Measles resurgence in Romania — 340 cases, 2 deaths', source: 'ECDC', time: '6h ago', alert: false },
    ]},
    { category: 'Mosquito & Vector', headlines: [
      { text: 'Dengue at record levels in Brazil — 480,000 cases in 2026', source: 'PAHO', time: '3h ago', alert: false },
      { text: 'Chikungunya spreads to southern Europe for first time', source: 'ECDC', time: '8h ago', alert: false },
      { text: 'Yellow fever alert issued for travellers to Angola', source: 'CDC', time: '1d ago', alert: false },
    ]},
    { category: 'AMR', headlines: [
      { text: 'Drug-resistant TB now exceeds 500,000 cases annually', source: 'WHO', time: '1d ago', alert: false },
      { text: 'New carbapenem-resistant organism detected in 12 countries', source: 'ECDC', time: '2d ago', alert: false },
      { text: 'AMR deaths reach 1.27M/year — now exceeds HIV', source: 'The Lancet', time: '3d ago', alert: false },
    ]},
    { category: 'Air Quality', headlines: [
      { text: 'PM2.5 levels critical in Delhi — AQI exceeds 400', source: 'OpenAQ', time: 'Live', alert: false },
      { text: 'Wildfire smoke reaches Mediterranean from North Africa', source: 'NASA FIRMS', time: '5h ago', alert: false },
      { text: 'WHO revises PM2.5 guidelines — 99% of world exceeds safe levels', source: 'WHO', time: '1w ago', alert: false },
    ]},
    { category: 'Zoonotic Risks', headlines: [
      { text: 'H5N1 detected in 3 new US dairy herds — human cases monitored', source: 'CDC', time: '4h ago', alert: false },
      { text: 'MERS-CoV: 2 new cases in Saudi Arabia', source: 'Saudi MOH', time: '6h ago', alert: false },
      { text: 'Novel bat coronavirus identified in Cambodia', source: 'ProMED', time: '2d ago', alert: false },
    ]},
    { category: 'Food Safety', headlines: [
      { text: 'Class I recall: insulin pump software affects 340,000 devices', source: 'FDA', time: '14h ago', alert: false },
      { text: 'Listeria outbreak linked to deli meats — 18 hospitalisations', source: 'CDC', time: '1d ago', alert: false },
      { text: 'EFSA flags contaminated infant formula in 6 EU countries', source: 'EFSA', time: '2d ago', alert: false },
    ]},
  ];
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function CardGrid({ activeVariants }: { activeVariants: string[] }) {
  const showAll = activeVariants.length === 0;

  return (
    <div style={{ padding: '8px 24px 32px', backgroundColor: 'var(--bg-primary)' }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1100px) {
          .card-row-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .card-row-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .card-row-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {(showAll || activeVariants.includes('THREATS')) && <LiveThreatsRow />}

      {(showAll || activeVariants.includes('DISCOVERIES')) && (
        <CardRow title="SCIENCE & DISCOVERIES" cards={DISCOVERIES_CARDS} color={VARIANT_COLORS.DISCOVERIES} variant="DISCOVERIES" />
      )}
      {(showAll || activeVariants.includes('MENTAL HEALTH')) && (
        <CardRow title="MENTAL HEALTH" cards={MENTAL_HEALTH_CARDS} color={VARIANT_COLORS['MENTAL HEALTH']} variant="MENTAL HEALTH" />
      )}
      {(showAll || activeVariants.includes('LONGEVITY')) && (
        <CardRow title="LONGEVITY" cards={LONGEVITY_CARDS} color={VARIANT_COLORS.LONGEVITY} variant="LONGEVITY" />
      )}
      {(showAll || activeVariants.includes('PERFORMANCE')) && (
        <CardRow title="PERFORMANCE" cards={PERFORMANCE_CARDS} color={VARIANT_COLORS.PERFORMANCE} variant="PERFORMANCE" />
      )}
      {(showAll || activeVariants.includes('ECONOMY')) && (
        <CardRow title="ECONOMY" cards={ECONOMY_CARDS} color={VARIANT_COLORS.ECONOMY} variant="ECONOMY" />
      )}
    </div>
  );
}
