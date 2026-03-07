'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const DISCOVERIES_DOTS = [
  { id: '6', name: 'Psilocybin Trial Results', severity: 'DISCOVERY', location: 'London, UK', keyStat: '67% remission rate in treatment-resistant depression', ageContext: 'Adults 25-65 with TRD', whyHere: 'Imperial College London Phase 3 trial', timeline: 'Results published today', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#00B4D8', coordinates: [-0.1276, 51.5074] as [number, number] },
  { id: '7', name: 'GLP-1 Cardiovascular Trial', severity: 'DISCOVERY', location: 'Boston, USA', keyStat: '20% reduction in heart attack risk in non-diabetics', ageContext: 'Adults 45-75', whyHere: 'Harvard Medical School Phase 3 results', timeline: 'Published this week', source: 'NEJM', link: 'https://www.nejm.org', color: '#00B4D8', coordinates: [-71.0589, 42.3601] as [number, number] },
  { id: '8', name: 'mRNA Malaria Vaccine', severity: 'DISCOVERY', location: 'Burkina Faso', keyStat: '77% efficacy in Phase 3 African trial', ageContext: 'Children 6 months to 5 years', whyHere: 'Phase 3 trial across 4 African countries', timeline: 'Results published this week', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#00B4D8', coordinates: [-1.5616, 12.3642] as [number, number] },
  { id: '9', name: 'CAR-T Lymphoma Therapy', severity: 'DISCOVERY', location: 'Houston, USA', keyStat: '54% complete remission in lymphoma patients', ageContext: 'Adults with relapsed lymphoma', whyHere: 'MD Anderson Cancer Center trial', timeline: 'FDA approval granted this month', source: 'NEJM', link: 'https://www.nejm.org', color: '#00B4D8', coordinates: [-95.3698, 29.7604] as [number, number] },
  { id: '10', name: 'CRISPR Haemophilia B', severity: 'DISCOVERY', location: 'London, UK', keyStat: 'Single infusion corrects haemophilia B — 89% success', ageContext: 'Males with severe haemophilia B', whyHere: 'UCL gene therapy trial', timeline: 'Published this week', source: 'NEJM', link: 'https://www.nejm.org', color: '#00B4D8', coordinates: [-0.1276, 51.5074] as [number, number] },
];

const LONGEVITY_DOTS = [
  { id: 'l1', name: 'Rapamycin Longevity Trial', severity: 'LONGEVITY', location: 'Boston, USA', keyStat: '18% reduction in biological age markers at 12 months', ageContext: 'Adults 45-70', whyHere: 'Harvard longevity lab trial', timeline: 'Published this month', source: 'Nature Aging', link: 'https://www.nature.com', color: '#059669', coordinates: [-71.0589, 42.3601] as [number, number] },
  { id: 'l2', name: 'Senolytics Phase 2', severity: 'LONGEVITY', location: 'San Francisco, USA', keyStat: 'Senescent cell clearance improves mobility in 78% of patients', ageContext: 'Adults 65+', whyHere: 'Unity Biotechnology trial', timeline: 'Results this week', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#059669', coordinates: [-122.4194, 37.7749] as [number, number] },
  { id: 'l3', name: 'NAD+ Restoration Study', severity: 'LONGEVITY', location: 'Tokyo, Japan', keyStat: 'NMN supplementation reverses vascular aging markers by 10 years', ageContext: 'Adults 50-70', whyHere: 'Keio University 3-year study', timeline: 'Published last week', source: 'Science', link: 'https://www.science.org', color: '#059669', coordinates: [139.6917, 35.6895] as [number, number] },
  { id: 'l4', name: 'HBOT Cognitive Study', severity: 'PROTOCOL', location: 'Tel Aviv, Israel', keyStat: 'Hyperbaric oxygen reverses aging hallmarks in healthy adults', ageContext: 'Adults 64+', whyHere: 'Tel Aviv University HBOT trial', timeline: 'Published this month', source: 'Aging', link: 'https://www.aging-us.com', color: '#059669', coordinates: [34.7818, 32.0853] as [number, number] },
  { id: 'l5', name: 'Red Light Therapy Trial', severity: 'PROTOCOL', location: 'London, UK', keyStat: 'Near-infrared light improves mitochondrial function by 25%', ageContext: 'Adults 40+', whyHere: 'UCL ophthalmology department', timeline: 'Published last month', source: 'Nature Aging', link: 'https://www.nature.com', color: '#059669', coordinates: [-0.1276, 51.5074] as [number, number] },
];

const MENTAL_HEALTH_DOTS = [
  { id: 'm1', name: 'MDMA-PTSD Phase 3 Trial', severity: 'BREAKTHROUGH', location: 'San Francisco, USA', keyStat: '67% of participants no longer met PTSD criteria after treatment', ageContext: 'Adults with severe PTSD', whyHere: 'MAPS Phase 3 trial sites across USA', timeline: 'FDA review in progress', source: 'Nature Medicine', link: 'https://www.nature.com', color: '#7C3AED', coordinates: [-122.4194, 37.7749] as [number, number] },
  { id: 'm2', name: 'Loneliness Cardiovascular Study', severity: 'RESEARCH', location: 'London, UK', keyStat: 'Loneliness increases cardiovascular risk by 29%', ageContext: 'Adults 40-79', whyHere: 'UK Biobank longitudinal study', timeline: 'Published this week', source: 'The Lancet', link: 'https://www.thelancet.com', color: '#7C3AED', coordinates: [-0.1276, 51.5074] as [number, number] },
  { id: 'm3', name: 'Ketamine Depression Trial', severity: 'BREAKTHROUGH', location: 'New York, USA', keyStat: 'Rapid antidepressant effect in 70% of treatment-resistant cases', ageContext: 'Adults with TRD', whyHere: 'Columbia University medical center', timeline: 'FDA approved this year', source: 'NEJM', link: 'https://www.nejm.org', color: '#7C3AED', coordinates: [-74.006, 40.7128] as [number, number] },
];

const PERFORMANCE_DOTS = [
  { id: 'p1', name: 'Cold Exposure Protocol Study', severity: 'PROTOCOL', location: 'Amsterdam, Netherlands', keyStat: 'Cold immersion 3x/week reduces inflammation markers by 40%', ageContext: 'Adults 25-50', whyHere: 'Amsterdam UMC sports science trial', timeline: 'Published this month', source: 'Cell Metabolism', link: 'https://www.cell.com', color: '#2563EB', coordinates: [4.9041, 52.3676] as [number, number] },
  { id: 'p2', name: 'VO2 Max Longevity Link', severity: 'RESEARCH', location: 'Dallas, USA', keyStat: 'Top VO2 max quintile has 5x lower mortality risk', ageContext: 'Adults 30-70', whyHere: 'Cooper Institute 20-year longitudinal study', timeline: 'Published last month', source: 'JAMA', link: 'https://jamanetwork.com', color: '#2563EB', coordinates: [-96.797, 32.7767] as [number, number] },
];

const INVESTMENTS_DOTS = [
  { id: 'e1', name: 'GLP-1 Drug Pricing Dispute', severity: 'POLICY', location: 'Washington DC, USA', keyStat: 'Ozempic costs $900/month in USA vs $60 in Germany', ageContext: 'Affects 37M+ diabetes patients in USA', whyHere: 'Congressional hearing on drug pricing', timeline: 'Hearing this week', source: 'Reuters Health', link: 'https://www.reuters.com', color: '#D97706', coordinates: [-77.0369, 38.9072] as [number, number] },
  { id: 'e2', name: 'Biotech VC Funding Record', severity: 'FUNDING', location: 'San Francisco, USA', keyStat: '$4.2B raised in longevity biotech Q1 2026', ageContext: 'Global biotech investment landscape', whyHere: 'Silicon Valley biotech hub', timeline: 'Q1 2026 report', source: 'Nature Biotechnology', link: 'https://www.nature.com', color: '#D97706', coordinates: [-122.4194, 37.7749] as [number, number] },
];

const REGION_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  'Global': { center: [20, 20], zoom: 1.8 },
  'Europe': { center: [10, 50], zoom: 3.5 },
  'GCC·MENA': { center: [45, 25], zoom: 3.5 },
  'North America': { center: [-95, 40], zoom: 3 },
  'SE Asia': { center: [110, 10], zoom: 3.5 },
  'LATAM': { center: [-60, -15], zoom: 3 },
  'Africa': { center: [20, 5], zoom: 3 },
  'ANZ': { center: [140, -25], zoom: 3.5 },
};

interface MapViewProps {
  activeVariants: string[];
  region: string;
  threats?: Dot[];
}

interface Dot {
  id: string;
  name: string;
  severity: string;
  color: string;
  location: string;
  keyStat: string;
  ageContext: string;
  whyHere: string;
  timeline: string;
  source: string;
  link?: string;
  coordinates: [number, number];
}

export default function MapView({ activeVariants, region, threats = [] }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [activeDot, setActiveDot] = useState<Dot | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 20],
      zoom: 1.8,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    const view = REGION_VIEWS[region] || REGION_VIEWS['Global'];
    map.current.flyTo({ center: view.center, zoom: view.zoom, duration: 1500 });
  }, [region]);

  useEffect(() => {
    if (!map.current) return;
    const addDots = () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      const dots: Dot[] = [
        ...(activeVariants.includes('THREATS') ? threats : []),
        ...(activeVariants.includes('DISCOVERIES') ? DISCOVERIES_DOTS : []),
        ...(activeVariants.includes('LONGEVITY') ? LONGEVITY_DOTS : []),
        ...(activeVariants.includes('MENTAL HEALTH') ? MENTAL_HEALTH_DOTS : []),
        ...(activeVariants.includes('PERFORMANCE') ? PERFORMANCE_DOTS : []),
        ...(activeVariants.includes('INVESTMENTS') ? INVESTMENTS_DOTS : []),
      ];
      dots.forEach(dot => {
        const el = document.createElement('div');
        el.style.width = '14px';
        el.style.height = '14px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = dot.color;
        el.style.border = '2px solid rgba(255,255,255,0.4)';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 8px ${dot.color}`;
        el.addEventListener('click', () => { setActiveDot(dot); setQuestion(''); setAnswer(''); });
        const marker = new mapboxgl.Marker({ element: el }).setLngLat(dot.coordinates).addTo(map.current!);
        markersRef.current.push(marker);
      });
    };
    if (map.current.isStyleLoaded()) addDots();
    else map.current.on('load', addDots);
  }, [activeVariants, threats]);

  const askClaude = async () => {
    if (!question.trim() || !activeDot) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: activeDot }),
      });
      const data = await res.json();
      setAnswer(data.response);
    } catch { setAnswer('Unable to get explanation right now.'); }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '55vh' }} />

      {activeDot && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', width: '320px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '10px', padding: '16px', zIndex: 1000,
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: 'var(--text-primary)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{activeDot.name}</strong>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ background: activeDot.color, color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{activeDot.severity}</span>
              <button onClick={() => setActiveDot(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', marginBottom: '6px' }}>📍 {activeDot.location}</div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--accent-teal)' }}>Key stat:</strong> <span style={{ color: 'var(--text-primary)' }}>{activeDot.keyStat}</span></div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--accent-teal)' }}>Who&apos;s affected:</strong> <span style={{ color: 'var(--text-primary)' }}>{activeDot.ageContext}</span></div>
          <div style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--accent-teal)' }}>Why here:</strong> <span style={{ color: 'var(--text-primary)' }}>{activeDot.whyHere}</span></div>
          <div style={{ marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>{activeDot.timeline}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
            Source: {activeDot.link
              ? <a href={activeDot.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}>{activeDot.source}</a>
              : activeDot.source}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '8px' }}>EXPLAIN THIS TO ME</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && askClaude()}
                placeholder="Ask a question..."
                style={{ flex: 1, backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text-primary)', fontSize: '12px' }}
              />
              <button onClick={askClaude} disabled={loading} style={{ backgroundColor: 'var(--accent-teal)', color: '#000', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                {loading ? '...' : 'Ask'}
              </button>
            </div>
            {answer && (
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px' }}>
                {answer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}