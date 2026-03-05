'use client';

const THREATS_CARDS = [
  {
    category: 'Active Outbreaks',
    headlines: [
      { text: 'Nipah virus: 14 cases in Kerala, response teams deployed', source: 'WHO', time: '2h ago' },
      { text: 'Cholera surges in Sudan — 1,200 new cases this week', source: 'ProMED', time: '4h ago' },
      { text: 'Measles resurgence in Romania — 340 cases, 2 deaths', source: 'ECDC', time: '6h ago' },
    ],
  },
  {
    category: 'Mosquito & Vector',
    headlines: [
      { text: 'Dengue at record levels in Brazil — 480,000 cases in 2026', source: 'PAHO', time: '3h ago' },
      { text: 'Chikungunya spreads to southern Europe for first time', source: 'ECDC', time: '8h ago' },
      { text: 'Yellow fever alert issued for travellers to Angola', source: 'CDC', time: '1d ago' },
    ],
  },
  {
    category: 'AMR',
    headlines: [
      { text: 'Drug-resistant TB now exceeds 500,000 cases annually — WHO', source: 'WHO', time: '1d ago' },
      { text: 'New carbapenem-resistant organism detected in 12 countries', source: 'ECDC', time: '2d ago' },
      { text: 'AMR deaths reach 1.27M/year — now exceeds HIV', source: 'The Lancet', time: '3d ago' },
    ],
  },
  {
    category: 'Air Quality',
    headlines: [
      { text: 'PM2.5 levels critical in Delhi — AQI exceeds 400', source: 'OpenAQ', time: 'Live' },
      { text: 'Wildfire smoke reaches Mediterranean from North Africa', source: 'NASA FIRMS', time: '5h ago' },
      { text: 'WHO revises PM2.5 guidelines — 99% of world exceeds safe levels', source: 'WHO', time: '1w ago' },
    ],
  },
  {
    category: 'Zoonotic Risks',
    headlines: [
      { text: 'H5N1 detected in 3 new US dairy herds — human cases monitored', source: 'CDC', time: '4h ago' },
      { text: 'MERS-CoV: 2 new cases in Saudi Arabia linked to camel exposure', source: 'Saudi MOH', time: '6h ago' },
      { text: 'Novel bat coronavirus identified in Cambodia — low human risk', source: 'ProMED', time: '2d ago' },
    ],
  },
  {
    category: 'Food Safety',
    headlines: [
      { text: 'Class I recall: insulin pump software affects 340,000 devices', source: 'FDA', time: '14h ago' },
      { text: 'Listeria outbreak linked to deli meats — 18 hospitalisations', source: 'CDC', time: '1d ago' },
      { text: 'EFSA flags contaminated infant formula batch in 6 EU countries', source: 'EFSA', time: '2d ago' },
    ],
  },
];

const DISCOVERIES_CARDS = [
  {
    category: 'Cancer',
    headlines: [
      { text: 'CAR-T therapy achieves complete remission in 54% of lymphoma patients', source: 'NEJM', time: '1d ago' },
      { text: 'Liquid biopsy detects pancreatic cancer 2 years before symptoms', source: 'Nature', time: '2d ago' },
      { text: 'New KRAS inhibitor shows activity in previously untreatable lung cancer', source: 'FDA', time: '3d ago' },
    ],
  },
  {
    category: 'Cardiovascular',
    headlines: [
      { text: 'GLP-1 receptor agonist reduces heart attack risk by 20% in non-diabetics', source: 'NEJM', time: '2d ago' },
      { text: 'Gene therapy corrects inherited heart condition in single dose', source: 'The Lancet', time: '4d ago' },
      { text: 'New statin alternative shows equivalent efficacy with fewer side effects', source: 'JAMA', time: '5d ago' },
    ],
  },
  {
    category: 'Brain & Neurology',
    headlines: [
      { text: 'Lecanemab slows Alzheimer\'s progression by 35% at 18 months', source: 'NEJM', time: '3d ago' },
      { text: 'Deep brain stimulation trial shows promise for treatment-resistant OCD', source: 'Nature Med', time: '4d ago' },
      { text: 'Blood test detects Parkinson\'s 7 years before motor symptoms', source: 'The Lancet', time: '1w ago' },
    ],
  },
  {
    category: 'Diabetes & Metabolic',
    headlines: [
      { text: 'Once-weekly insulin injection enters Phase 3 — non-inferior to daily', source: 'FDA', time: '2d ago' },
      { text: 'GLP-1 drugs show unexpected benefit in addiction and depression', source: 'NEJM', time: '3d ago' },
      { text: 'Artificial pancreas approved for Type 1 diabetes in under-7s', source: 'FDA', time: '5d ago' },
    ],
  },
  {
    category: 'Psychedelic Therapy',
    headlines: [
      { text: 'Psilocybin achieves 67% remission in treatment-resistant depression — Phase 3', source: 'The Lancet', time: '6h ago' },
      { text: 'MDMA-assisted therapy for PTSD: FDA resubmission after new data', source: 'MAPS', time: '2d ago' },
      { text: 'Ketamine shows sustained 6-month benefit in suicidal ideation trial', source: 'NIMH', time: '4d ago' },
    ],
  },
  {
    category: 'Rare Diseases',
    headlines: [
      { text: 'Gene therapy cures sickle cell disease in 95% of trial participants', source: 'NEJM', time: '1w ago' },
      { text: 'First treatment approved for progeria — extends lifespan by 2.5 years', source: 'FDA', time: '1w ago' },
      { text: 'RNA therapy halts progression of fatal prion disease in landmark trial', source: 'NEJM', time: '2w ago' },
    ],
  },
  {
    category: 'Vaccine Pipeline',
    headlines: [
      { text: 'mRNA malaria vaccine shows 77% efficacy in Phase 3 African trial', source: 'The Lancet', time: '3d ago' },
      { text: 'Universal flu vaccine enters human trials — targets conserved proteins', source: 'NIH', time: '5d ago' },
      { text: 'HIV vaccine candidate generates broadly neutralising antibodies', source: 'Nature', time: '1w ago' },
    ],
  },
  {
    category: 'Gene Therapy',
    headlines: [
      { text: 'CRISPR base editing corrects haemophilia B in single infusion', source: 'NEJM', time: '4d ago' },
      { text: 'In-vivo gene editing repairs liver disease without removing cells', source: 'Nature', time: '6d ago' },
      { text: 'Prime editing achieves 89% correction rate in muscular dystrophy model', source: 'Science', time: '1w ago' },
    ],
  },
  {
    category: 'Long COVID',
    headlines: [
      { text: 'Anticoagulant therapy reduces long COVID symptoms by 40% in trial', source: 'The Lancet', time: '2d ago' },
      { text: 'Viral persistence confirmed as mechanism in 60% of long COVID cases', source: 'Nature', time: '5d ago' },
      { text: 'Low-dose naltrexone shows benefit for long COVID fatigue and brain fog', source: 'NEJM', time: '1w ago' },
    ],
  },
];

export default function CardGrid({ activeVariants = [] }: { activeVariants?: string[] }) {
  return (
    <div style={{ padding: '0 24px 24px', backgroundColor: 'var(--bg-primary)' }}>

      {/* Row 1 — Threats */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: '12px' }}>
          THREATS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {THREATS_CARDS.map((card, i) => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '16px',
              borderTop: '2px solid var(--alert-red)',
            }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{card.category}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Updated just now</div>
              {card.headlines.map((h, j) => (
                <div key={j} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '3px' }}>{h.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{h.source} · {h.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — Discoveries */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: '12px' }}>
          SCIENCE & DISCOVERIES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '12px' }}>
          {DISCOVERIES_CARDS.map((card, i) => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '16px',
              borderTop: '2px solid #4CC9F0',
            }}>
              <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{card.category}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Updated just now</div>
              {card.headlines.map((h, j) => (
                <div key={j} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', lineHeight: '1.4', marginBottom: '3px' }}>{h.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{h.source} · {h.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}